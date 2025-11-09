import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, description, content, featured_image_url, created_at")
    .eq("slug", params.slug)
    .single();

  if (error || !post) {
    return notFound();
  }

  return (
    <div className="w-screen bg-white min-h-screen text-black">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-6xl font-extrabold mb-10">Blog.</h1>

        <div className="bg-white w-full rounded-2xl p-8 border border-gray-200">
          {post.featured_image_url && (
            <div className="relative w-full h-72 rounded-xl mb-10 overflow-hidden">
              {/* next/image for better performance */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.featured_image_url} alt={post.title} className="object-cover w-full h-full" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h1 className="text-4xl font-semibold mb-4">{post.title}</h1>
              <p className="text-gray-700">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <p className="text-gray-700 leading-relaxed mb-4">
                {post.description}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                <div>
                  <p className="font-semibold">Author</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-lg leading-relaxed whitespace-pre-wrap text-black">
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
}