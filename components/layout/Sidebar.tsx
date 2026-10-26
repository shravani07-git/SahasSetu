"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  FolderLock,
  MessageCircle,
  Building2,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  Users,
  BarChart3,
  Gavel,
  BookOpen,
  Activity,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  userRole?: "user" | "admin" | "ngo";
}

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Report Incident", href: "/dashboard/report", icon: FileText },
  { name: "Evidence Vault", href: "/dashboard/evidence", icon: FolderLock },
  { name: "Counseling", href: "/dashboard/counseling", icon: MessageCircle },
  { name: "NGOs & Committees", href: "/dashboard/ngos", icon: Building2 },
  { name: "Help Center", href: "/dashboard/help", icon: HelpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Cases", href: "/admin/cases", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Committees", href: "/admin/committees", icon: Gavel },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Audit Log", href: "/admin/audit", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const ngoNavigation = [
  { name: "Dashboard", href: "/ngo", icon: Home },
  { name: "Sessions", href: "/ngo/sessions", icon: MessageCircle },
  { name: "Committee", href: "/ngo/committee", icon: Gavel },
  { name: "Resources", href: "/ngo/resources", icon: BookOpen },
];

export default function Sidebar({ userRole = "user" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const loading = user === undefined;
  // Use the actual user role if available, otherwise fall back to prop
  const effectiveRole = user?.role || userRole;

  const navigation =
    effectiveRole === "admin"
      ? adminNavigation
      : effectiveRole === "ngo" || effectiveRole === "counselor"
      ? ngoNavigation
      : userNavigation;

  const displayName = user?.name || "User";
  const roleLabel =
    effectiveRole === "admin"
      ? "Administrator"
      : effectiveRole === "ngo"
      ? "NGO Partner"
      : effectiveRole === "counselor"
      ? "Counselor"
      : effectiveRole === "committee_member"
      ? "Committee Member"
      : "User";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                SafeHer
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden lg:block"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const strippedPath = pathname.replace(/^\/(en|hi|mr|ta|te|bn)/, "");
            const isActive =
              strippedPath === item.href ||
              (item.href !== "/" &&
                item.href !== "/dashboard" &&
                item.href !== "/admin" &&
                item.href !== "/ngo" &&
                strippedPath.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive && "text-primary-600 dark:text-primary-400"
                    )}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800",
            collapsed && "justify-center"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <>
              <Avatar name={displayName} size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {roleLabel}
                  </p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-error transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
