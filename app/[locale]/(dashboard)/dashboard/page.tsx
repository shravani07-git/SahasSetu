"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FolderLock,
  MessageCircle,
  Building2,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  Calendar,
  ArrowRight,
  Bell,
  Sparkles,
  Loader2,
  CircleDot,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface Complaint {
  _id: string;
  caseId: string;
  incidentType: string;
  incidentDate: string;
  location?: string;
  status: string;
  priority: string;
  timeline: Array<{ status: string; description: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

interface EvidenceFile {
  _id: string;
  originalName: string;
  category: string;
  createdAt: string;
}

interface Session {
  _id: string;
  counselorId: { name: string } | null;
  type: string;
  status: string;
  scheduledAt: string;
}

const quickActions = [
  {
    title: "Report New Incident",
    description: "Document a new harassment incident securely",
    icon: Plus,
    href: "/dashboard/report",
    color: "bg-primary-600",
    textColor: "text-white",
  },
  {
    title: "Evidence Vault",
    description: "Access your encrypted digital locker",
    icon: FolderLock,
    href: "/dashboard/evidence",
    color: "bg-secondary-600",
    textColor: "text-white",
  },
  {
    title: "Counseling Support",
    description: "Connect with a certified counselor",
    icon: MessageCircle,
    href: "/dashboard/counseling",
    color: "bg-accent-600",
    textColor: "text-white",
  },
  {
    title: "NGOs & Committees",
    description: "Find support organizations near you",
    icon: Building2,
    href: "/dashboard/ngos",
    color: "bg-blue-600",
    textColor: "text-white",
  },
];

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  investigation: "Investigation",
  hearing_scheduled: "Hearing Scheduled",
  hearing_in_progress: "Hearing In Progress",
  resolution_pending: "Resolution Pending",
  resolved: "Resolved",
  closed: "Closed",
  appealed: "Appealed",
  escalated: "Escalated",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  investigation: "bg-orange-100 text-orange-700",
  hearing_scheduled: "bg-purple-100 text-purple-700",
  hearing_in_progress: "bg-purple-200 text-purple-800",
  resolution_pending: "bg-cyan-100 text-cyan-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-600",
  appealed: "bg-red-100 text-red-700",
  escalated: "bg-red-200 text-red-800",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, evidenceRes, sessionsRes, notifRes] = await Promise.all([
          fetch("/api/complaints"),
          fetch("/api/evidence"),
          fetch("/api/counseling"),
          fetch("/api/notifications"),
        ]);

        if (complaintsRes.ok) {
          const data = await complaintsRes.json();
          setComplaints(data.complaints || []);
        }
        if (evidenceRes.ok) {
          const data = await evidenceRes.json();
          setEvidenceCount(data.files?.length || 0);
        }
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeComplaints = complaints.filter((c) => !["draft", "resolved", "closed"].includes(c.status));
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const totalReports = complaints.length;
  const pendingCount = complaints.filter((c) => c.status !== "draft" && c.status !== "resolved" && c.status !== "closed").length;
  const counselingHours = sessions.filter((s) => s.status === "completed").length * 0.75;

  const stats = [
    {
      label: "Reports Filed",
      value: String(totalReports),
      subtext: `${pendingCount} pending`,
      icon: FileText,
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: "Evidence Files",
      value: String(evidenceCount),
      subtext: "Encrypted",
      icon: FolderLock,
      color: "text-secondary-600",
      bg: "bg-secondary-100",
    },
    {
      label: "Counseling Hours",
      value: counselingHours.toFixed(1),
      subtext: "This month",
      icon: MessageCircle,
      color: "text-accent-600",
      bg: "bg-accent-100",
    },
    {
      label: "Active Cases",
      value: String(activeComplaints.length),
      subtext: "In progress",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your secure dashboard — here&apos;s what&apos;s happening
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/report">
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Privacy Banner */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold">Your Privacy is Protected</h3>
            <p className="text-sm text-primary-100">
              Sensitive complaint fields and evidence are encrypted at rest, with role-based access controls and audit logging.
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white/10"
            >
              Privacy Settings
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {stat.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card hover className="h-full group">
                <CardContent>
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    {action.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col - Notifications & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Complaint Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Complaint Tracking
              </CardTitle>
              <CardDescription>Track the progress of your complaints</CardDescription>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No complaints filed yet</p>
                  <Link href="/dashboard/report">
                    <Button size="sm">File Your First Report</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {complaints.slice(0, 3).map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      {/* Case Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {complaint.caseId}
                            </h4>
                            <Badge className={statusColors[complaint.status]} size="sm">
                              {statusLabels[complaint.status] || complaint.status}
                            </Badge>
                          </div>
                           <p className="text-sm text-gray-500 mt-1">
                             {complaint.incidentType
                               ? complaint.incidentType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                               : "Incident"}
                             {complaint.incidentDate && ` • ${new Date(complaint.incidentDate).toLocaleDateString()}`}
                           </p>
                        </div>
                        <Link href={`/dashboard/report?id=${complaint._id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* Timeline */}
                      {complaint.timeline && complaint.timeline.length > 0 && (
                        <div className="relative pl-6 space-y-3">
                          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700" />
                          {complaint.timeline.slice(-4).map((entry, idx) => (
                            <div key={idx} className="relative flex items-start gap-3">
                              <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${
                                idx === complaint.timeline.length - 1
                                  ? "border-primary-600 bg-primary-600"
                                  : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statusLabels[entry.status] || entry.status}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {entry.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {complaints.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/report" className="text-sm text-primary-600 hover:underline">
                        View all {complaints.length} complaints →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 2).map((session) => (
                    <div
                      key={session._id}
                      className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={typeof session.counselorId === "object" && session.counselorId?.name ? session.counselorId.name : "Counselor"} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {typeof session.counselorId === "object" && session.counselorId?.name ? session.counselorId.name : "Counselor"}
                          </p>
                          <p className="text-xs text-gray-500">{session.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming sessions scheduled
                </p>
              )}
              <Link href="/dashboard/counseling">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Schedule Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Assistant Tip */}
          <Card className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border-accent-200 dark:border-accent-800">
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  AI Writing Assistant
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Need help documenting an incident? Our AI can help you write a
                clear, professional report while protecting your emotional
                well-being.
              </p>
              <Link href="/dashboard/report">
                <Button size="sm" variant="secondary" className="w-full">
                  Try AI Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-error/5 border-error/20">
            <CardContent className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Need Immediate Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                24/7 Women Helpline
              </p>
              <a href="tel:181">
                <Button variant="danger" size="sm" className="w-full">
                  Call 181
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
