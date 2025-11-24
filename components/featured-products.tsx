"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { BlogCard } from "./blog-card"
import { Reveal } from "./reveal"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  description: string
  featured_image_url: string
  slug: string
  created_at: string
}

export function FeaturedProducts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, description, featured_image_url, slug, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6)

      if (data) setPosts(data as BlogPost[])
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) return <div className="h-96 bg-neutral-100 animate-pulse" />

  return (
    <section className="py-20 lg:py-32" id="featured-posts">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-16">
          <Reveal>
            <div>
              <h2 className="text-4xl text-neutral-900 mb-4 lg:text-6xl">
                Latest <span className="italic font-light">Stories</span>
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl">
                Discover the newest fashion blogs and styling insights from our community.
              </p>
            </div>
          </Reveal>
          <Link
            href="/community"
            className="hidden md:inline-block text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.21, 0.47, 0.32, 0.98],
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

        <div className="md:hidden text-center mt-12">
          <Link
            href="/community"
            className="inline-block text-neutral-900 hover:text-neutral-600 font-medium transition-colors"
          >
            View All Stories →
          </Link>
        </div>
      </div>
    </section>
  )
}
