"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image_url: string;
  created_at: string;
  author_name?: string;
  profiles?: {
    display_name: string;
  };
}

export const dynamic = 'force-dynamic'

export default function BlogPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, description, content, featured_image_url, created_at, author_name, profiles(display_name)")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (error) {
          console.error('Error fetching post:', error)
          setError('Post not found')
        } else {
          setPost(data as BlogPost);
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading post...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>

          <article className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-neutral-200">
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full rounded-lg mb-8 object-cover max-h-96"
              />
            )}

            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-neutral-600">
                <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>•</span>
                <span>By {post.author_name || post.profiles?.display_name || 'Anonymous'}</span>
              </div>
            </header>

            <div className="prose prose-neutral max-w-none">
              <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
                {post.description}
              </p>

              <div className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
