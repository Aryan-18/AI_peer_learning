import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function MainContent() {
  const { user, loading, isTeacher, isStudent } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "register"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-apple-electric/30 border-t-apple-electric rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {!user ? (
          authView === "login" ? (
            <Login onSwitchToRegister={() => setAuthView("register")} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView("login")} />
          )
        ) : isTeacher ? (
          <TeacherDashboard />
        ) : isStudent ? (
          <StudentDashboard />
        ) : (
          <div className="text-center py-20 text-slate-500">
            Unrecognized account role.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <p>
          Pimpri Chinchwad College of Engineering (PCCOE Pune) • AI-Driven Academic Peer Learning Network
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
