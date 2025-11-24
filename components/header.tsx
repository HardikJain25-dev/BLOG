"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Only initialize auth on client side
    if (typeof window === 'undefined') return

    let mounted = true

    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (mounted) {
          setUser(user)
          setIsLoading(false)
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
          if (mounted) {
            setUser(session?.user)
          }
        })

        return () => {
          subscription?.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const cleanup = initializeAuth()

    return () => {
      mounted = false
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // handleLogout removed (not currently used); keep auth handling in useEffect

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md border-b border-white/[0.02]",
        isScrolled ? "bg-white/[0.02]" : "bg-white/[0.02]",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-12 lg:h-16 relative">
          {/* Logo */}
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Link
              href="/"
              className={cn(
                "text-xl lg:text-2xl font-bold tracking-tight transition-colors",
                isScrolled ? "text-neutral-900 " : "text-black/80 hover:text-white/80",
              )}
              aria-label="OUTFITCULT "
            >
              OUTFITCULT
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/"
                className={cn(
                  "text-black text-sm font-medium  duration-200",
                  isScrolled ? "text-neutral-600 hover:text-neutral-900" : "text-black/80 hover:text-white",
                )}
              >
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/community"
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  isScrolled ? "text-neutral-600 hover:text-neutral-900" : "text-black/80 hover:text-white",
                )}
              >
                Community
              </Link>
            </motion.div>
          </nav>

          {/* Write Button - Always Visible */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/#create-blog"
              className={cn(
                "flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "bg-neutral-900 text-white hover:bg-neutral-800",
              )}
              scroll={true}
            >
              <span>Write</span>
            </Link>
          </motion.div>

          {/* Auth Links */}
          {/* {user ? (
            <motion.button
              onClick={handleLogout}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isScrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white",
              )}
              whileHover={{ scale: 1.05 }}
            >
              Logout
            </motion.button>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth/login"
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isScrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white",
                  )}
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth/sign-up"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    "bg-neutral-900 text-white hover:bg-neutral-800",
                  )}
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </motion.div>
            </>
          )} */}
        </div>
      </div>
    </motion.header>
  )
}
