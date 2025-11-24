import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Calendar, User, ArrowRight } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  description: string
  featured_image_url?: string
  slug: string
  created_at: string
  author_name?: string
}

export const metadata = {
  title: 'Fashion Blog | OutfitCult',
  description: 'Discover the latest fashion stories, styling tips, and inspiration from our community of fashion enthusiasts.',
  openGraph: {
    title: 'Fashion Blog | OutfitCult',
    description: 'Latest fashion stories and styling inspiration',
    type: 'website',
  },
}

export default async function BlogPage() {
  const supabase = await createClient()

  // Get featured post (most recent)
  const { data: featuredPost } = await supabase
    .from("blog_posts")
    .select("id, title, description, featured_image_url, slug, created_at, author_name")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get recent posts (excluding featured)
  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("id, title, description, featured_image_url, slug, created_at, author_name")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(1, 9) // Skip first post (featured), get next 9

  const getAuthorDisplay = (post: BlogPost) => {
    return post.author_name || 'Anonymous'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section with Featured Post */}
        {featuredPost && (
          <section className="relative bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative container-custom py-20 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-neutral-300">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">Featured Story</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    {featuredPost.title}
                  </h1>
                  <p className="text-xl text-neutral-300 leading-relaxed max-w-2xl">
                    {featuredPost.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>By {getAuthorDisplay(featuredPost)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredPost.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <Link
                    href={`/community/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-neutral-100 transition-colors group"
                  >
                    Read Full Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                {featuredPost.featured_image_url && (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src={featuredPost.featured_image_url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts Section */}
        <section className="py-20 lg:py-32">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                Latest <span className="italic font-light">Stories</span>
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Discover fashion inspiration, styling tips, and community stories from fashion enthusiasts around the world.
              </p>
            </div>

            {recentPosts && recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100"
                  >
                    {/* Post Image */}
                    <div className="relative aspect-[4/3] bg-neutral-100">
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                          <span className="text-neutral-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {post.description}
                      </p>

                      {/* Post Meta */}
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{getAuthorDisplay(post)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600 text-lg">No blog posts yet. Be the first to share your fashion story!</p>
                <Link
                  href="/"
                  className="inline-block mt-4 bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Write Your Story
                </Link>
              </div>
            )}

            {/* View All Link */}
            {recentPosts && recentPosts.length >= 9 && (
              <div className="text-center mt-12">
                <Link
                  href="/community"
                  className="inline-flex items-center gap-2 text-neutral-900 hover:text-neutral-700 font-semibold transition-colors group"
                >
                  View All Stories
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container-custom text-center">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Stay Inspired
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Get the latest fashion stories and styling tips delivered to your inbox.
            </p>
            <Link
              href="/#newsletter"
              className="inline-block bg-neutral-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
