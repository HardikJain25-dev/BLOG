import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogPostDetail {
  id: string
  title: string
  description: string
  content: string
  featured_image_url: string
  created_at: string
  profiles: { display_name: string; avatar_url: string }
  post_images: Array<{ image_url: string; alt_text: string; order_index?: number }>
}

export default async function PostDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  if (!id) notFound()

  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, profiles(display_name, avatar_url), post_images(image_url, alt_text, order_index)")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!post) notFound()

  const post_detail = post as BlogPostDetail
  const date = new Date(post_detail.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back Button */}
          <div className="py-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Back to posts</span>
            </Link>
          </div>

          {/* Featured Image */}
          {post_detail.featured_image_url && (
            <div className="w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden mb-10 bg-neutral-100 relative">
              <Image
                src={post_detail.featured_image_url || "/placeholder.svg"}
                alt={post_detail.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Post Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">{post_detail.title}</h1>
          {/* Post Description */}
          <p className="text-lg text-neutral-600 mb-8">{post_detail.description}</p>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-10 border-b border-neutral-200 pb-6">
            <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden">
              {post_detail.profiles.avatar_url && (
                <Image
                  src={post_detail.profiles.avatar_url || "/placeholder.svg"}
                  alt={post_detail.profiles.display_name}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{post_detail.profiles.display_name}</p>
              <p className="text-sm text-neutral-500">{date}</p>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-lg prose-neutral max-w-none mb-12">
            <div
              dangerouslySetInnerHTML={{ __html: post_detail.content }}
              className="whitespace-pre-wrap text-neutral-700 leading-relaxed"
            />
          </article>

          {/* Additional Images */}
          {post_detail.post_images && post_detail.post_images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {post_detail.post_images
                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                .map((img, idx) => (
                  <div key={idx} className="relative w-full h-80 rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={img.image_url || "/placeholder.svg"}
                      alt={img.alt_text || "Post image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
