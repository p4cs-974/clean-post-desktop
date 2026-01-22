import { Shield, Lock, Eye, Sparkles } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
  useMutation,
} from "convex/react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { UsageConsentModal } from "./UsageConsentModal";
import { useAnonymous } from "../contexts/AnonymousContext";
import { api } from "../../convex/_generated/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
  const ensureUser = useMutation(api.users.getOrCreateUser);
  const { isAnonymous, setAnonymous, clearAnonymous } = useAnonymous();
  // Use ref to track if mutation has been called (async-api-routes fix)
  const hasCalled = useRef(false);

  // Handle anonymous sign in
  const handleAnonymousSignIn = () => {
    // Generate a unique anonymous ID
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setAnonymous(anonymousId);
  };

  // Ensure user exists when authenticated
  useEffect(() => {
    if (user === undefined) {
      // Still loading
      return;
    }

    // If user is authenticated, clear anonymous state from localStorage
    if (user !== null && isAnonymous) {
      clearAnonymous();
      return;
    }

    if (user === null && !hasCalled.current) {
      // User doesn't exist yet, create them (only once)
      hasCalled.current = true;
      ensureUser();
    }
  }, [user, ensureUser, isAnonymous, clearAnonymous]);

  // If anonymous, show app without auth requirement (must be after all hooks)
  if (isAnonymous) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background relative">
          {/* Header skeleton */}
          <div className="sticky top-0 z-50 border-b border-border/50">
            <div className="container mx-auto max-w-2xl px-4 pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="flex gap-3">
                  <div className="h-9 w-9 bg-muted/50 rounded-full animate-pulse" />
                  <div className="h-9 w-9 bg-muted/50 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
            <div className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
              <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
              <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
            </div>
          </main>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md"
            >
              {/* Logo with enhanced visual effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-2xl"
                  />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 shadow-2xl shadow-primary/30 border border-white/10">
                    <Shield className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                >
                  CleanPost
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-muted-foreground font-medium"
                >
                  Protect your privacy
                </motion.p>
              </motion.div>

              {/* Feature cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-3 mb-8"
              >
                {[
                  { icon: Lock, title: "Secure", desc: "Local processing" },
                  { icon: Eye, title: "Private", desc: "No uploads ever" },
                  { icon: Sparkles, title: "Clean", desc: "Remove metadata" },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full p-4 rounded-2xl bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 hover:border-primary/30 transition-colors duration-300">
                      <feature.icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-xs font-semibold text-foreground mb-1">
                        {feature.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Sign in card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                      Start protecting your privacy
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Sign in to remove metadata from your photos and videos
                    </p>
                  </div>

                  <SignInButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-base shadow-lg">
                        Sign In
                      </div>
                    </motion.button>
                  </SignInButton>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnonymousSignIn}
                    className="relative w-full group mt-3"
                  >
                    <div className="relative px-8 py-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-medium text-base border border-border transition-colors">
                      Use anonymously
                    </div>
                  </motion.button>

                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        <span>End-to-end encrypted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>100% private</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center text-xs text-muted-foreground mt-8"
              >
                Your files never leave your device
              </motion.p>
            </motion.div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {user &&
        !user.hasAcceptedConsent &&
        user.consentAcceptedAt === undefined ? (
          <UsageConsentModal onDismiss={() => window.location.reload()} />
        ) : (
          children
        )}
      </Authenticated>
    </>
  );
}
