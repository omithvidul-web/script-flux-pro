import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

// NOTE: Client-side keystroke unlock as specified. This is a UI reveal only —
// it is NOT a security boundary. Anyone reading the JS bundle can find the
// secret. Real destructive admin actions should be protected server-side.
const SECRET = "Admin@Omith*666";
const FAIL_HINT = "";

export function AdminUnlockListener() {
  const navigate = useNavigate();
  useEffect(() => {
    let buffer = "";
    let clearTimer: ReturnType<typeof setTimeout> | null = null;

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      // Also work while typing in fields (some users unlock via the converter textarea).
      if (e.key.length === 1) {
        buffer += e.key;
      } else if (e.key === "Backspace") {
        buffer = buffer.slice(0, -1);
      } else if (e.key === "Enter") {
        // Submit on Enter
        if (buffer.includes(SECRET)) {
          try {
            sessionStorage.setItem("uuc-admin-unlocked", "1");
          } catch {}
          buffer = "";
          toast.success("Access granted");
          navigate({ to: "/admin" });
        } else if (buffer.length > 4) {
          // Generic-looking rejection — no admin hint
          toast("No results found", { description: FAIL_HINT });
        }
        buffer = "";
      }
      if (buffer.length > 64) buffer = buffer.slice(-64);

      // Also allow accidental full-typed sequence without Enter
      if (buffer.endsWith(SECRET)) {
        try {
          sessionStorage.setItem("uuc-admin-unlocked", "1");
        } catch {}
        buffer = "";
        toast.success("Access granted");
        navigate({ to: "/admin" });
      }

      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => (buffer = ""), 8000);
      // Prevent unused ref
      void target;
    }
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [navigate]);
  return null;
}

export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("uuc-admin-unlocked") === "1";
  } catch {
    return false;
  }
}
