import { useState } from "react";
import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface UsageConsentModalProps {
  onDismiss: () => void;
}

export function UsageConsentModal({ onDismiss }: UsageConsentModalProps) {
  const [consentEnabled, setConsentEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptConsent = useMutation(api.users.acceptConsent);
  const declineConsent = useMutation(api.users.declineConsent);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      if (consentEnabled) {
        await acceptConsent();
      } else {
        await declineConsent();
      }
      onDismiss();
    } catch (error) {
      console.error("Failed to record consent preference:", error);
      onDismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => {}}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative"
        >
          {/* Subtle glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />

          {/* Main card */}
          <div className="relative bg-background border border-border/50 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mx-auto"
              >
                <Shield className="w-6 h-6 text-primary" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-semibold text-center mb-2"
              >
                See your usage statistics
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground text-center leading-relaxed"
              >
                Track how many files you've cleaned and see your privacy impact
              </motion.p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              {/* Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="space-y-1">
                  <Label htmlFor="consent" className="text-sm font-medium">
                    Track my statistics
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    See how many times CleanPost has helped you
                  </p>
                </div>
                <Switch
                  id="consent"
                  checked={consentEnabled}
                  onCheckedChange={setConsentEnabled}
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Info note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-center text-muted-foreground"
              >
                Your stats will be visible in the app when you're not processing files
              </motion.p>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
