"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, Upload } from "lucide-react"
import Image from "next/image"
import { Reveal } from "./reveal"
import { motion } from "framer-motion"

export function CreateBlogSection() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewFeatured, setPreviewFeatured] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewFeatured(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File, bucket: string) => {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let featuredImageUrl = ""

      if (featuredImage) {
        const path = await uploadImage(featuredImage, "blog-images")
        const { data } = supabase.storage.from("blog-images").getPublicUrl(path)
        featuredImageUrl = data.publicUrl
      }

      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")

      const { error: postError } = await supabase
        .from("blog_posts")
        .insert({
          title,
          description,
          content,
          author_name: author,
          featured_image_url: featuredImageUrl,
          slug,
          status: "published",
        })
        .select()
        .single()

      if (postError) throw postError

      setSuccess(true)
      setTitle("")
      setDescription("")
      setContent("")
      setAuthor("")
      setFeaturedImage(null)
      setPreviewFeatured("")

      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("FULL ERROR:", JSON.stringify(error, null, 2))
      alert("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="create-blog" className="py-20 lg:py-32 bg-neutral-50">
      <div className="container-custom">
        <Reveal>
          <div className="text-left mb-16">
            <h2 className="text-4xl lg:text-6xl text-neutral-900 mb-4">
              Share Your <span className="italic font-light">Style</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Write about fashion, styling tips, clothing inspiration, and connect with our community of fashion
              enthusiasts.
            </p>
          </div>
        </Reveal>

        {success && (
          <motion.div
            className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ Your blog post has been published successfully!
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-neutral-200 p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog title"
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Your Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your blog post"
              rows={2}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none transition-all"
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
            <label className="block text-sm font-medium text-neutral-900 mb-2">Blog Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              rows={12}
              required
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none font-mono text-sm transition-all"
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? "Publishing..." : "Publish Your Blog"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}
