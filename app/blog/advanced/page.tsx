"use client"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Upload, AlertCircle, Bold, Italic, List, Link as LinkIcon, X } from "lucide-react"
import Link from "next/link"

interface AuthUser { id: string }

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const dynamic = 'force-dynamic'

export default function AdvancedBlogEditor() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [previewFeatured, setPreviewFeatured] = useState<string>("")
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data: authData, error } = await supabase.auth.getUser()
        if (error || !authData.user) {
          redirect("/auth/login")
        }
        setUser(authData.user as AuthUser)
      } catch (err) {
        console.error('Auth check error:', err)
        redirect("/auth/login")
      }
    }
    checkUser()
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB'
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File must be a valid image (JPEG, PNG, WebP, or GIF)'
    }
    return null
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        setErrors(prev => ({ ...prev, featuredImage: error }))
        return
      }

      setErrors(prev => ({ ...prev, featuredImage: '' }))
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewFeatured(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let replacement = ''
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`
        break
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}`
        break
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`
        break
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  const uploadImage = async (file: File, bucket: string): Promise<string> => {
    const supabase = createClient()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }

    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    const newErrors: {[key: string]: string} = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!content.trim()) newErrors.content = 'Content is required'
    if (title.length > 200) newErrors.title = 'Title must be less than 200 characters'
    if (description.length > 500) newErrors.description = 'Description must be less than 500 characters'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const supabase = createClient()
      let featuredImageUrl = ""

      // Upload featured image if provided
      if (featuredImage) {
        const path = await uploadImage(featuredImage, "blog-images")
        const { data } = supabase.storage.from("blog-images").getPublicUrl(path)
        featuredImageUrl = data.publicUrl
      }

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .substring(0, 100)

      // Create blog post
      const { data: post, error: postError } = await supabase
        .from("blog_posts")
        .insert({
          user_id: user!.id,
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          featured_image_url: featuredImageUrl,
          slug,
          status: "published",
        })
        .select()
        .single()

      if (postError) {
        throw new Error(`Failed to create post: ${postError.message}`)
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating post:", error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create post. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>

          <h1 className="text-4xl font-bold text-neutral-900 mb-12">Advanced Blog Editor</h1>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
                }}
                placeholder="Enter an engaging title"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-200 focus:ring-neutral-900'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
                }}
                placeholder="Brief description of your post"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-200 focus:ring-neutral-900'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Featured Image</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className="hidden"
                  id="featured-image"
                />
                {previewFeatured ? (
                  <div className="relative w-full h-64">
                    <img
                      src={previewFeatured}
                      alt="Featured preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage(null)
                        setPreviewFeatured("")
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="featured-image" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-neutral-400" />
                    <span className="text-neutral-600">Click to upload featured image</span>
                    <span className="text-sm text-neutral-500">Max 5MB • JPEG, PNG, WebP, GIF</span>
                  </label>
                )}
              </div>
              {errors.featuredImage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.featuredImage}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Content</label>

              {/* Formatting Toolbar */}
              <div className="flex gap-2 mb-2 p-2 bg-neutral-50 rounded-lg border">
                <button
                  type="button"
                  onClick={() => insertFormatting('bold')}
                  className="p-2 hover:bg-neutral-200 rounded"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('italic')}
                  className="p-2 hover:bg-neutral-200 rounded"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('list')}
                  className="p-2 hover:bg-neutral-200 rounded"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('link')}
                  className="p-2 hover:bg-neutral-200 rounded"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>

              <textarea
                id="content-editor"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (errors.content) setErrors(prev => ({ ...prev, content: '' }))
                }}
                placeholder="Write your blog post content here... Use **bold**, *italic*, - lists, and [text](url) for links"
                rows={20}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm resize-none ${
                  errors.content
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-neutral-200 focus:ring-neutral-900'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.content}
                </p>
              )}

              <div className="mt-2 text-sm text-neutral-500">
                <p><strong>Formatting Guide:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>**text** for <strong>bold</strong></li>
                  <li>*text* for <em>italic</em></li>
                  <li>- item for bullet lists</li>
                  <li>[text](url) for links</li>
                </ul>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}