import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface BlogPostSummary {
  id: string
  title: string
  description: string
  created_at: string
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, description, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32">
        <div className="container-custom py-12">
          <h1 className="text-5xl font-bold mb-8">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts?.map(post => (
              <Link
                key={post.id}
                href={`/blog/detail?id=${post.id}`}
                className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-2">{post.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
