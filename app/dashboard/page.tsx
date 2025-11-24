"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  status: string
  created_at: string
  featured_image_url: string
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  interface AuthUser { id: string }
  const [, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        redirect("/auth/login")
      }
  setUser(authData.user as AuthUser)

      const { data: postsData } = await supabase
        .from("blog_posts")
        .select("id, title, status, created_at, featured_image_url")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })

      setPosts(postsData as BlogPost[])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const supabase = createClient()
      await supabase.from("blog_posts").delete().eq("id", postId)
      setPosts(posts.filter((p) => p.id !== postId))
    }
  }

  if (loading) return <div className="h-96 bg-neutral-100 animate-pulse" />

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900">Dashboard</h1>
            <Link
              href="/dashboard/create"
              className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">You have not created any posts yet</p>
              <Link href="/dashboard/create" className="text-neutral-900 font-medium hover:underline">
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-neutral-100" />
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Status: <span className="capitalize">{post.status}</span>
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/edit/${post.id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-neutral-900 text-white py-2 rounded hover:bg-neutral-800 transition-colors text-sm"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex items-center justify-center gap-1 border border-neutral-200 py-2 px-3 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
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
