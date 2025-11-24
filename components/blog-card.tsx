"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, User } from "lucide-react"

interface BlogCardProps {
  post: {
    id: string
    title: string
    description: string
    featured_image_url: string
    slug: string
    created_at: string
    author_name?: string
    profiles?: { display_name: string }
  }
}

export function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const authorDisplay = post.author_name || post.profiles?.display_name || 'Anonymous'

  return (
    <Link href={`/community/${post.slug}`}>
      <motion.div
        className="group cursor-pointer h-full flex flex-col"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* Image Container */}
        <div className="relative w-full h-80 overflow-hidden rounded-lg mb-6 bg-neutral-100">
          <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
            <Image
              src={post.featured_image_url || "/placeholder.svg?height=400&width=600&query=fashion-blog"}
              alt={post.title}
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-1">{post.description}</p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-neutral-500 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{authorDisplay}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
