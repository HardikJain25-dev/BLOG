"use client"
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";

export default async function BlogPage() {
  const supabase = createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, description, content, featured_image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !post) {
    return notFound();
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Blog</h1>

        <div className="bg-gray-50 rounded-xl p-4 md:p-6 shadow-md">
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full rounded-lg mb-6 object-contain"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-500 text-sm md:text-base">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
                {post.description}
              </p>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div>
                  <p className="font-medium text-sm md:text-base">Author</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 text-base md:text-lg leading-relaxed whitespace-pre-wrap text-gray-700">
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
}
