/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import SupplierForm from "./components/SupplierForm";
import AdminDashboard from "./components/AdminDashboard";
import SupplierDetails from "./components/SupplierDetails";
import Login from "./components/Login";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthed = localStorage.getItem("isAdminAuthed") === "true";
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthed = localStorage.getItem("isAdminAuthed") === "true";
  
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/login";

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthed");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {isAdminRoute ? (
              <Link to="/admin" className="flex-shrink-0 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                <span className="font-bold text-xl text-gray-900">Internal Dashboard</span>
              </Link>
            ) : (
              <div className="flex-shrink-0 flex items-center gap-2">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <span className="font-bold text-xl text-gray-900">Supplier Portal</span>
              </div>
            )}
          </div>
          {isAdminRoute && isAuthed && (
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />

        <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<SupplierForm />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/supplier/:id" 
              element={
                <ProtectedRoute>
                  <SupplierDetails />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
