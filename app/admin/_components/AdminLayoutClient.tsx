"use client";
import { useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import SidebarAdmin from "./SidebarAdmin";
import { SellerToaster } from "@/app/dashboard/_components/SellerToaster";
interface AdminLayoutClientProps {
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
  };
  children: React.ReactNode;
}
export default function AdminLayoutClient({
  user,
  children,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Admin */}
      <NavbarAdmin
        user={user}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      {/* Main Body */}
      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <SidebarAdmin
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user.role}
        />
        {/* Content View */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
      <SellerToaster />
    </div>
  );
}
