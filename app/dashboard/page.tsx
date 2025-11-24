"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  status: string
  created_at: string
  featured_image_url: string
}

interface AuthUser { id: string }

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData.user) {
          redirect("/auth/login")
        }

        setUser(authData.user as AuthUser)

        const { data: postsData, error: postsError } = await supabase
          .from("blog_posts")
          .select("id, title, status, created_at, featured_image_url")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false })

        if (postsError) {
          console.error('Error fetching posts:', postsError)
          setError('Failed to load your posts')
        } else {
          setPosts(postsData as BlogPost[])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

        if (error) {
          console.error('Error deleting post:', error)
          alert('Failed to delete post. Please try again.')
        } else {
          setPosts(posts.filter((p) => p.id !== postId))
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        alert('An unexpected error occurred')
      }
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20">
          <div className="container-custom">
            <div className="h-96 bg-neutral-100 animate-pulse rounded-lg" />
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20">
          <div className="container-custom">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Dashboard</h2>
              <p className="text-neutral-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800"
              >
                Try Again
              </button>
            </div>
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
