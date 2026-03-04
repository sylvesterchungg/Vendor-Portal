import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication for prototype
    if (password === "admin123") {
      localStorage.setItem("isAdminAuthed", "true");
      navigate("/admin");
    } else {
      setError("Invalid password. Hint: admin123");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Internal Login</h2>
      
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            placeholder="Enter admin password"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          Sign In
        </button>
      </form>
    </motion.div>
  );
}
