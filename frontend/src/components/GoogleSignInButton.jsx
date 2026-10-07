import React, { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function GoogleSignInButton({ onClick, role = "student", text = "Sign in with PCCOE Google Account" }) {
  const { googleLogin } = useAuth();
  const googleBtnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            hosted_domain: "pccoepune.org",
            callback: async (response) => {
              if (response.credential) {
                await googleLogin({
                  credential: response.credential,
                  role: role
                });
              }
            },
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 380,
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
          });
        } catch (e) {
          console.warn("Google Sign-In initialization:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [clientId, role, googleLogin]);

  // When live Google Client ID is configured, render Google's official native GIS button
  if (clientId) {
    return (
      <div className="w-full flex justify-center my-1">
        <div ref={googleBtnRef}></div>
      </div>
    );
  }

  // Otherwise, render our custom Google button that opens the setup / testing modal
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#CCE6FF] dark:border-slate-700/80 hover:border-[#0062FF] dark:hover:border-[#38A6FF] text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Official Google 'G' SVG Logo */}
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span className="group-hover:text-[#0062FF] dark:group-hover:text-[#38A6FF] transition-colors">
        {text}
      </span>
    </button>
  );
}
