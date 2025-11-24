"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CreatePostPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  interface AuthUser { id: string }
  const [user, setUser] = useState<AuthUser | null>(null)
  const [previewFeatured, setPreviewFeatured] = useState<string>("")
  const [previewAdditional, setPreviewAdditional] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        redirect("/auth/login")
      }
      setUser(authData.user as AuthUser)
    }
    checkUser()
  }, [])

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewFeatured(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalImages((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewAdditional((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const uploadImage = async (file: File, bucket: string) => {
    const supabase = createClient()
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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

      // Create blog post
      const { data: post, error: postError } = await supabase
        .from("blog_posts")
        .insert({
          user_id: user!.id,
          title,
          description,
          content,
          featured_image_url: featuredImageUrl,
          slug,
          status: "published",
        })
        .select()
        .single()

      if (postError) throw postError

      // Upload additional images
      for (const file of additionalImages) {
        const path = await uploadImage(file, "blog-images")
        const { data } = supabase.storage.from("blog-images").getPublicUrl(path)
        await supabase.from("post_images").insert({
          post_id: post.id,
          image_url: data.publicUrl,
          order_index: additionalImages.indexOf(file),
        })
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom max-w-3xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>

          <h1 className="text-4xl font-bold text-neutral-900 mb-12">Create New Post</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your post"
                rows={2}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
              />
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
                    <Image
                      src={previewFeatured || "/placeholder.svg"}
                      alt="Featured preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <label htmlFor="featured-image" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-neutral-400" />
                    <span className="text-neutral-600">Click to upload featured image</span>
                  </label>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Post Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here..."
                rows={12}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none font-mono text-sm"
              />
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Additional Images</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-neutral-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                  id="additional-images"
                />
                <label htmlFor="additional-images" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-neutral-400" />
                  <span className="text-neutral-600">Click to add more images</span>
                </label>
              </div>
              {previewAdditional.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {previewAdditional.map((preview, idx) => (
                    <div key={idx} className="relative w-full h-24">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${idx}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
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
