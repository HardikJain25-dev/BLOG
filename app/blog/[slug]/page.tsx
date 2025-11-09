import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, profiles(display_name, avatar_url), post_images(image_url, alt_text, order_index)")
    .eq("slug", slug)
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
      <main className="min-h-screen pt-32">
        <article className="container-custom py-12">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to posts</span>
          </Link>

          {/* Post Header */}
          <div className="max-w-3xl mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">{post_detail.title}</h1>
            <p className="text-xl text-neutral-600 mb-8">{post_detail.description}</p>

            {/* Author Info */}
            <div className="flex items-center gap-4 pb-8 border-b border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden">
                {post_detail.profiles.avatar_url ? (
                  <Image
                    src={post_detail.profiles.avatar_url || "/placeholder.svg"}
                    alt={post_detail.profiles.display_name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="font-medium text-neutral-900">{post_detail.profiles.display_name}</p>
                <p className="text-sm text-neutral-500">{date}</p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post_detail.featured_image_url && (
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden mb-12 bg-neutral-100">
              <Image
                src={post_detail.featured_image_url || "/placeholder.svg"}
                alt={post_detail.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="max-w-3xl prose prose-lg prose-neutral mb-12">
            <div
              dangerouslySetInnerHTML={{ __html: post_detail.content }}
              className="text-neutral-700 leading-relaxed whitespace-pre-wrap"
            />
          </div>

          {/* Additional Images */}
          {post_detail.post_images && post_detail.post_images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
        </article>
      </main>
      <Footer />
    </>
  )
}
