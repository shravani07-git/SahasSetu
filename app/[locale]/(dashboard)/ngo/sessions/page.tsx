"use client";

import { useState } from "react";
import {
  Video,
  Phone,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Star,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Session {
  id: number;
  user: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  counselor: string;
  notes: string;
  feedback?: number;
}

export default function NGOSessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState("all");

  const upcomingSessions: Session[] = [
    {
      id: 1,
      user: "Anonymous User #1042",
      type: "Video Counseling",
      date: "2026-02-08",
      time: "3:00 PM",
      duration: "45 mins",
      status: "confirmed",
      counselor: "Dr. Meera Patel",
      notes: "Follow-up session for workplace anxiety",
    },
    {
      id: 2,
      user: "Anonymous User #1038",
      type: "Voice Call",
      date: "2026-02-08",
      time: "5:30 PM",
      duration: "30 mins",
      status: "confirmed",
      counselor: "Sunita Krishnan",
      notes: "Initial counseling session",
    },
    {
      id: 3,
      user: "Anonymous User #1045",
      type: "Video Counseling",
      date: "2026-02-09",
      time: "10:00 AM",
      duration: "60 mins",
      status: "pending",
      counselor: "Dr. Meera Patel",
      notes: "Detailed discussion required",
    },
    {
      id: 4,
      user: "Anonymous User #1039",
      type: "Follow-up Call",
      date: "2026-02-09",
      time: "2:00 PM",
      duration: "30 mins",
      status: "confirmed",
      counselor: "Priya Sharma",
      notes: "Check on progress and next steps",
    },
  ];

  const pastSessions: Session[] = [
    {
      id: 101,
      user: "Anonymous User #1035",
      type: "Video Counseling",
      date: "2026-02-07",
      time: "11:00 AM",
      duration: "45 mins",
      status: "completed",
      counselor: "Dr. Meera Patel",
      feedback: 5,
      notes: "Session completed successfully",
    },
    {
      id: 102,
      user: "Anonymous User #1032",
      type: "Voice Call",
      date: "2026-02-06",
      time: "4:00 PM",
      duration: "30 mins",
      status: "completed",
      counselor: "Sunita Krishnan",
      feedback: 4,
      notes: "Follow-up scheduled",
    },
    {
      id: 103,
      user: "Anonymous User #1028",
      type: "Video Counseling",
      date: "2026-02-05",
      time: "2:30 PM",
      duration: "60 mins",
      status: "cancelled",
      counselor: "Dr. Meera Patel",
      notes: "User requested cancellation",
    },
  ];

  const sessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "info" | "error"; label: string }> = {
      confirmed: { variant: "success", label: "Confirmed" },
      pending: { variant: "warning", label: "Pending" },
      completed: { variant: "info", label: "Completed" },
      cancelled: { variant: "error", label: "Cancelled" },
    };
    const { variant, label } = config[status] || { variant: "info", label: status };
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage counseling and support sessions
          </p>
        </div>
        <Button leftIcon={<Calendar className="w-4 h-4" />} onClick={() => setShowSessionModal(true)}>
          Schedule Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-green-600">{upcomingSessions.filter(s => s.status === "confirmed").length}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-orange-600">{upcomingSessions.filter(s => s.status === "pending").length}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-600">{pastSessions.filter(s => s.status === "completed").length}</p>
            <p className="text-sm text-gray-500">Completed This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === "upcoming"
              ? "bg-secondary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          Upcoming Sessions
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === "past"
              ? "bg-secondary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          Past Sessions
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sessions..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                options={[
                  { value: "all", label: "All Types" },
                  { value: "video", label: "Video Counseling" },
                  { value: "voice", label: "Voice Call" },
                  { value: "followup", label: "Follow-up" },
                ]}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSession(session)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                    {session.type.includes("Video") ? (
                      <Video className="w-6 h-6 text-secondary-600" />
                    ) : (
                      <Phone className="w-6 h-6 text-secondary-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{session.user}</p>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-sm text-gray-500">{session.type}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time} ({session.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {session.counselor}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.feedback && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="text-sm font-medium">{session.feedback}</span>
                    </div>
                  )}
                  {session.status === "confirmed" && activeTab === "upcoming" && (
                    <Button size="sm" leftIcon={<Video className="w-4 h-4" />}>
                      Join
                    </Button>
                  )}
                  {session.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" leftIcon={<CheckCircle className="w-4 h-4" />}>
                        Confirm
                      </Button>
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Schedule New Session"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Session Type"
            options={[
              { value: "video", label: "Video Counseling" },
              { value: "voice", label: "Voice Call" },
              { value: "followup", label: "Follow-up Call" },
            ]}
          />
          <Select
            label="Assign Counselor"
            options={[
              { value: "meera", label: "Dr. Meera Patel" },
              { value: "sunita", label: "Sunita Krishnan" },
              { value: "priya", label: "Priya Sharma" },
            ]}
          />
          <Input label="Date" type="date" />
          <Input label="Time" type="time" />
          <Select
            label="Duration"
            options={[
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
            ]}
          />
          <Textarea label="Session Notes" placeholder="Add any notes for this session..." rows={3} />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowSessionModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setShowSessionModal(false)}>
              Schedule Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                {selectedSession.type.includes("Video") ? (
                  <Video className="w-6 h-6 text-secondary-600" />
                ) : (
                  <Phone className="w-6 h-6 text-secondary-600" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedSession.user}</p>
                <p className="text-sm text-gray-500">{selectedSession.type}</p>
              </div>
              {getStatusBadge(selectedSession.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{selectedSession.date}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{selectedSession.time}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium">{selectedSession.duration}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Counselor</p>
                <p className="font-medium">{selectedSession.counselor}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{selectedSession.notes}</p>
            </div>

            {selectedSession.feedback && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">User Feedback</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= (selectedSession.feedback || 0)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedSession.status === "confirmed" && activeTab === "upcoming" && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" leftIcon={<XCircle className="w-4 h-4" />}>
                  Cancel Session
                </Button>
                <Button className="flex-1" leftIcon={<Video className="w-4 h-4" />}>
                  Join Session
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
