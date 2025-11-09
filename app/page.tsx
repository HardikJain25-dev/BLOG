"use client"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CreateBlogSection } from "@/components/create-blog-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CollectionStrip } from "@/components/collection-strip"
// import { MaterialsSection } from "@/components/materials-section"
// NewsletterSection intentionally unused on homepage; import removed to avoid lint error.
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CreateBlogSection />
      <FeaturedProducts />
      <CollectionStrip />
      {/* <MaterialsSection /> */}
      {/* <NewsletterSection /> */}
      <Footer />
    </main>
  )
}
