import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Welcome!</h1>
          <p className="text-neutral-600">You are authenticated. Go to your dashboard to manage posts.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
