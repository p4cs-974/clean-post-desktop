import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AnonymousContextType {
  isAnonymous: boolean;
  anonymousId: string | null;
  setAnonymous: (id: string) => void;
  clearAnonymous: () => void;
}

const AnonymousContext = createContext<AnonymousContextType | undefined>(undefined);

export function AnonymousProvider({ children }: { children: ReactNode }) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("isAnonymous");
    const storedId = localStorage.getItem("anonymousId");
    if (stored === "true" && storedId) {
      setIsAnonymous(true);
      setAnonymousId(storedId);
    }
  }, []);

  const setAnonymous = (id: string) => {
    localStorage.setItem("isAnonymous", "true");
    localStorage.setItem("anonymousId", id);
    setIsAnonymous(true);
    setAnonymousId(id);
  };

  const clearAnonymous = () => {
    localStorage.removeItem("isAnonymous");
    localStorage.removeItem("anonymousId");
    setIsAnonymous(false);
    setAnonymousId(null);
  };

  return (
    <AnonymousContext.Provider value={{ isAnonymous, anonymousId, setAnonymous, clearAnonymous }}>
      {children}
    </AnonymousContext.Provider>
  );
}

export function useAnonymous() {
  const context = useContext(AnonymousContext);
  if (context === undefined) {
    throw new Error("useAnonymous must be used within an AnonymousProvider");
  }
  return context;
}
