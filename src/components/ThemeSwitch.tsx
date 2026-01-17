import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border border-border/40 bg-muted/30" />
    );
  }

  const isDark = theme === "dark";

  // Auto-reset animation state with proper cleanup
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  const handleToggle = () => {
    setIsAnimating(true);
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative h-10 w-10 overflow-hidden rounded-xl border border-border/40 bg-muted/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_20px_-5px_rgba(var(--color-primary),0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Ambient glow that follows theme */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        // style={{
        //   background:
        //     "radial-gradient(circle at center, oklch(0.70 0.18 185 / 0.15) 0%, transparent 70%)",
        // }}
      />

      {/* Icon container with rotation */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className={`transition-transform duration-500 ${
            isAnimating ? "scale-90 rotate-180" : "scale-100 rotate-0"
          }`}
        >
          {isDark ? (
            <Moon
              className="h-5 w-5 text-white transition-colors duration-300"
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className="h-5 w-5 text-black transition-colors duration-300"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>

      {/* Subtle inner ring effect on hover */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
