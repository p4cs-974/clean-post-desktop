import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "motion/react";
import { File, MapPin, Camera, Clock, Shield, TrendingUp, LucideIcon } from "lucide-react";

// Stats config hoisted outside component (rendering-hoist-jsx)
interface StatConfig {
  key: "files" | "gps" | "camera" | "timestamp";
  label: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}

const STATS_CONFIG: readonly StatConfig[] = [
  {
    key: "files",
    label: "Files Processed",
    icon: File,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    key: "gps",
    label: "GPS Removals",
    icon: MapPin,
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
  {
    key: "camera",
    label: "Camera Info Removals",
    icon: Camera,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    key: "timestamp",
    label: "Timestamp Removals",
    icon: Clock,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
  },
] as const;

export function UserStats() {
  const user = useQuery(api.users.getCurrentUser);

  // Memoize stats with actual values (rerender-derived-state)
  const stats = useMemo(() => {
    if (!user) return null;

    return STATS_CONFIG.map((config) => ({
      ...config,
      value:
        config.key === "files"
          ? user.totalFilesProcessed
          : config.key === "gps"
          ? user.gpsRemovalsCount
          : config.key === "camera"
          ? user.cameraInfoRemovalsCount
          : user.timestampRemovalsCount,
    }));
  }, [user]);

  const totalRemovals = useMemo(() => {
    if (!user) return 0;
    return user.gpsRemovalsCount + user.cameraInfoRemovalsCount + user.timestampRemovalsCount;
  }, [user]);

  // Don't show stats if user hasn't consented
  if (!user || !user.hasAcceptedConsent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-8 space-y-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Your files stay private</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            All processing happens on your device. Nothing is ever uploaded to any server.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 py-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Privacy Stats</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Total metadata removed:{" "}
          <span className="font-semibold text-foreground">{totalRemovals}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2 + index * 0.08,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Card */}
            <div className="relative h-full p-4 rounded-2xl bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 hover:border-primary/30 transition-colors duration-300">
              {/* Icon */}
              <div className="flex items-start justify-between mb-3">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} border border-border/50`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </motion.div>
              </div>

              {/* Value */}
              <div className="mb-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4 + index * 0.08,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="text-3xl font-bold tracking-tight tabular-nums"
                >
                  {stat.value.toLocaleString()}
                </motion.span>
              </div>

              {/* Label */}
              <p className="text-xs text-muted-foreground leading-tight">
                {stat.label}
              </p>

              {/* Decorative corner accent */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-primary/50 to-accent/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground pt-2"
      >
        Your usage data is anonymous and helps us improve CleanPost
      </motion.p>
    </motion.div>
  );
}
