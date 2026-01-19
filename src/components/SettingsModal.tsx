import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, Lock, Info } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [consentEnabled, setConsentEnabled] = useState(false);

  const user = useQuery(api.users.getCurrentUser);
  const acceptConsent = useMutation(api.users.acceptConsent);
  const declineConsent = useMutation(api.users.declineConsent);

  // Sync consent state with user data
  useEffect(() => {
    if (user?.hasAcceptedConsent) {
      setConsentEnabled(true);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (consentEnabled) {
        await acceptConsent();
      } else {
        await declineConsent();
      }
      onClose();
    } catch (error) {
      console.error("Failed to update consent:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative w-full max-w-md"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-2xl opacity-50" />

              {/* Main card */}
              <div className="relative bg-background border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Settings</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                  {/* Usage Stats Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Info className="w-4 h-4 text-primary" />
                        <span>Usage Statistics</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Help us improve CleanPost by sharing anonymous usage data.
                      </p>
                    </div>

                    {/* Privacy note */}
                    <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">
                            Anonymous & Private
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            We never collect file contents, locations, or personal
                            information. All data is anonymized.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consent switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                      <div className="space-y-1">
                        <Label htmlFor="settings-consent" className="text-sm font-semibold">
                          Allow usage stats
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Anonymous tracking to improve your experience
                        </p>
                      </div>
                      <Switch
                        id="settings-consent"
                        checked={user?.hasAcceptedConsent ?? false}
                        onCheckedChange={(checked) => {
                          setConsentEnabled(checked);
                          if (checked) {
                            acceptConsent();
                          } else {
                            declineConsent();
                          }
                        }}
                        disabled={!user}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
                  <Button
                    onClick={handleSave}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
