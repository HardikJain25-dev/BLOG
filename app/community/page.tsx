"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogCard } from "@/components/blog-card"
import { Reveal } from "@/components/reveal"

interface BlogPost {
  id: string
  title: string
  description: string
  featured_image_url: string
  slug: string
  created_at: string
  author_name?: string
  profiles?: {
    display_name: string
  }
}

export const dynamic = 'force-dynamic'

export default function CommunityPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, description, featured_image_url, slug, created_at, author_name")
          .eq("status", "published")
          .order("created_at", { ascending: false })

        if (error) {
          console.error('Error fetching posts:', error)
          setError('Failed to load blog posts')
        } else {
          setPosts(data as BlogPost[])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom">
          <Reveal>
            <div className="text-left mb-16">
              <h1 className="text-5xl lg:text-7xl text-neutral-900 mb-4">
                Community <span className="italic font-light">Stories</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl">
                Explore fashion blogs, styling tips, and inspiration from our community of writers and fashion
                enthusiasts.
              </p>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-600 text-lg mb-4">No blog posts yet. Be the first to share!</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.6,
                      },
                    },
                  }}
                >
                  <Reveal delay={index * 0.1}>
                    <BlogCard post={post} />
                  </Reveal>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
