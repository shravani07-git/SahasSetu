"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  Eye,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Upload,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  category: "auth" | "case" | "evidence" | "user" | "settings" | "system";
  user: string;
  userRole: string;
  target?: string;
  ip: string;
  timestamp: string;
  details?: string;
  severity: "info" | "warning" | "critical";
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    action: "Case Viewed",
    category: "case",
    user: "Priya Sharma",
    userRole: "ICC Member",
    target: "CASE-2026-0047",
    ip: "192.168.1.xxx",
    timestamp: "Feb 8, 2026, 2:30 PM",
    severity: "info",
  },
  {
    id: "2",
    action: "Evidence Downloaded",
    category: "evidence",
    user: "Anita Desai",
    userRole: "ICC Member",
    target: "audio_recording_1.mp3",
    ip: "192.168.1.xxx",
    timestamp: "Feb 8, 2026, 2:15 PM",
    details: "Related to CASE-2026-0045",
    severity: "warning",
  },
  {
    id: "3",
    action: "User Login",
    category: "auth",
    user: "Admin User",
    userRole: "Admin",
    ip: "192.168.1.xxx",
    timestamp: "Feb 8, 2026, 9:00 AM",
    severity: "info",
  },
  {
    id: "4",
    action: "Case Status Changed",
    category: "case",
    user: "Priya Sharma",
    userRole: "ICC Member",
    target: "CASE-2026-0047",
    ip: "192.168.1.xxx",
    timestamp: "Feb 8, 2026, 2:15 PM",
    details: "Status changed from 'New' to 'In Progress'",
    severity: "info",
  },
  {
    id: "5",
    action: "Failed Login Attempt",
    category: "auth",
    user: "Unknown",
    userRole: "Unknown",
    ip: "203.45.xx.xxx",
    timestamp: "Feb 8, 2026, 8:45 AM",
    details: "Multiple failed attempts for email: admin@example.com",
    severity: "critical",
  },
  {
    id: "6",
    action: "User Created",
    category: "user",
    user: "Admin User",
    userRole: "Admin",
    target: "New ICC Member",
    ip: "192.168.1.xxx",
    timestamp: "Feb 7, 2026, 4:30 PM",
    severity: "info",
  },
  {
    id: "7",
    action: "Evidence Uploaded",
    category: "evidence",
    user: "Anonymous",
    userRole: "User",
    target: "document_scan.pdf",
    ip: "Anonymized",
    timestamp: "Feb 7, 2026, 3:00 PM",
    details: "Related to CASE-2026-0046",
    severity: "info",
  },
  {
    id: "8",
    action: "Settings Changed",
    category: "settings",
    user: "Admin User",
    userRole: "Admin",
    ip: "192.168.1.xxx",
    timestamp: "Feb 6, 2026, 11:00 AM",
    details: "Session timeout changed from 30 to 60 minutes",
    severity: "warning",
  },
  {
    id: "9",
    action: "Case Assigned",
    category: "case",
    user: "System",
    userRole: "System",
    target: "CASE-2026-0047",
    ip: "Server",
    timestamp: "Feb 8, 2026, 11:00 AM",
    details: "Auto-assigned to Priya Sharma",
    severity: "info",
  },
  {
    id: "10",
    action: "User Logout",
    category: "auth",
    user: "Kavitha Menon",
    userRole: "ICC Member",
    ip: "192.168.1.xxx",
    timestamp: "Feb 7, 2026, 6:00 PM",
    severity: "info",
  },
];

const getActionIcon = (category: string) => {
  switch (category) {
    case "auth":
      return LogIn;
    case "case":
      return FileText;
    case "evidence":
      return Upload;
    case "user":
      return User;
    case "settings":
      return Settings;
    case "system":
      return Shield;
    default:
      return ClipboardList;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge variant="error" size="sm">Critical</Badge>;
    case "warning":
      return <Badge variant="warning" size="sm">Warning</Badge>;
    default:
      return <Badge variant="secondary" size="sm">Info</Badge>;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "auth":
      return <Badge className="bg-blue-100 text-blue-700" size="sm">Auth</Badge>;
    case "case":
      return <Badge className="bg-purple-100 text-purple-700" size="sm">Case</Badge>;
    case "evidence":
      return <Badge className="bg-green-100 text-green-700" size="sm">Evidence</Badge>;
    case "user":
      return <Badge className="bg-yellow-100 text-yellow-700" size="sm">User</Badge>;
    case "settings":
      return <Badge className="bg-gray-100 text-gray-700" size="sm">Settings</Badge>;
    case "system":
      return <Badge className="bg-primary-100 text-primary-700" size="sm">System</Badge>;
    default:
      return <Badge size="sm">{category}</Badge>;
  }
};

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary-600" />
            Audit Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all system activities and access logs
          </p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export Logs
        </Button>
      </div>

      {/* Security Alert */}
      {auditLogs.some(l => l.severity === "critical") && (
        <Card className="bg-error/5 border-error/20">
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-error">Security Alert</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Critical security events detected. Please review immediately.
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-error border-error hover:bg-error/10">
              Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: auditLogs.length, icon: ClipboardList, color: "bg-gray-100 text-gray-600" },
          { label: "Case Activities", value: auditLogs.filter(l => l.category === "case").length, icon: FileText, color: "bg-purple-100 text-purple-600" },
          { label: "Auth Events", value: auditLogs.filter(l => l.category === "auth").length, icon: LogIn, color: "bg-blue-100 text-blue-600" },
          { label: "Critical", value: auditLogs.filter(l => l.severity === "critical").length, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search events, users, or targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "all", label: "All Time" },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-36"
          />
          <Select
            options={[
              { value: "all", label: "All Categories" },
              { value: "auth", label: "Authentication" },
              { value: "case", label: "Case" },
              { value: "evidence", label: "Evidence" },
              { value: "user", label: "User" },
              { value: "settings", label: "Settings" },
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-44"
          />
          <Select
            options={[
              { value: "all", label: "All Severity" },
              { value: "info", label: "Info" },
              { value: "warning", label: "Warning" },
              { value: "critical", label: "Critical" },
            ]}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-36"
          />
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((log) => {
            const ActionIcon = getActionIcon(log.category);
            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  log.severity === "critical" && "bg-error/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  log.severity === "critical" ? "bg-error/10" :
                  log.severity === "warning" ? "bg-warning/10" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  <ActionIcon className={cn(
                    "w-5 h-5",
                    log.severity === "critical" ? "text-error" :
                    log.severity === "warning" ? "text-warning" : "text-gray-500"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </span>
                    {getCategoryBadge(log.category)}
                    {getSeverityBadge(log.severity)}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.user}
                    </span>
                    <span>•</span>
                    <span>{log.userRole}</span>
                    {log.target && (
                      <>
                        <span>•</span>
                        <span className="text-primary-600">{log.target}</span>
                      </>
                    )}
                  </div>

                  {log.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.details}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500">{log.timestamp}</p>
                  <p className="text-xs text-gray-400 mt-1">IP: {log.ip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {auditLogs.length} events
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
