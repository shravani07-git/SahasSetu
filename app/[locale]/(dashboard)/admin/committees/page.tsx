"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Users,
  Shield,
  Award,
  MapPin,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface Committee {
  id: string;
  name: string;
  organization: string;
  type: "icc" | "lcc";
  members: number;
  presiding: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "pending" | "expired";
  formationDate: string;
  lastMeeting: string;
}

const committees: Committee[] = [
  {
    id: "1",
    name: "TechCorp ICC",
    organization: "TechCorp Solutions Pvt. Ltd.",
    type: "icc",
    members: 5,
    presiding: "Priya Sharma",
    email: "icc@techcorp.com",
    phone: "+91 22 2345 6789",
    location: "Mumbai, Maharashtra",
    status: "active",
    formationDate: "Jan 15, 2025",
    lastMeeting: "Feb 5, 2026",
  },
  {
    id: "2",
    name: "HealthFirst ICC",
    organization: "HealthFirst Hospitals",
    type: "icc",
    members: 4,
    presiding: "Dr. Kavitha Menon",
    email: "icc@healthfirst.org",
    phone: "+91 80 3456 7890",
    location: "Bangalore, Karnataka",
    status: "active",
    formationDate: "Mar 20, 2025",
    lastMeeting: "Feb 1, 2026",
  },
  {
    id: "3",
    name: "EduLearn ICC",
    organization: "EduLearn Academy",
    type: "icc",
    members: 3,
    presiding: "Anita Desai",
    email: "icc@edulearn.edu",
    phone: "+91 11 4567 8901",
    location: "Delhi NCR",
    status: "pending",
    formationDate: "Feb 1, 2026",
    lastMeeting: "Not held yet",
  },
  {
    id: "4",
    name: "District LCC - Mumbai",
    organization: "Maharashtra State Government",
    type: "lcc",
    members: 6,
    presiding: "Smt. Rekha Patil",
    email: "lcc.mumbai@maharashtra.gov.in",
    phone: "+91 22 2345 9999",
    location: "Mumbai, Maharashtra",
    status: "active",
    formationDate: "Jul 10, 2024",
    lastMeeting: "Jan 28, 2026",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "pending":
      return <Badge variant="warning">Pending Setup</Badge>;
    case "expired":
      return <Badge variant="error">Needs Renewal</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function CommitteesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCommittees = committees.filter((committee) => {
    const matchesSearch =
      committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      committee.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || committee.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-600" />
            Committees
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Internal and Local Complaints Committees
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Committee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total ICCs", value: committees.filter(c => c.type === "icc").length, icon: Shield, color: "bg-primary-100 text-primary-600" },
          { label: "Total LCCs", value: committees.filter(c => c.type === "lcc").length, icon: Building2, color: "bg-secondary-100 text-secondary-600" },
          { label: "Active", value: committees.filter(c => c.status === "active").length, icon: CheckCircle, color: "bg-green-100 text-green-600" },
          { label: "Total Members", value: committees.reduce((acc, c) => acc + c.members, 0), icon: Users, color: "bg-blue-100 text-blue-600" },
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
              placeholder="Search committees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "icc", label: "ICC" },
              { value: "lcc", label: "LCC" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          />
        </CardContent>
      </Card>

      {/* Committees Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredCommittees.map((committee) => (
          <Card key={committee.id} hover>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    committee.type === "icc" ? "bg-primary-100" : "bg-secondary-100"
                  )}>
                    {committee.type === "icc" ? (
                      <Shield className="w-6 h-6 text-primary-600" />
                    ) : (
                      <Building2 className="w-6 h-6 text-secondary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {committee.name}
                    </h3>
                    <p className="text-sm text-gray-500">{committee.organization}</p>
                  </div>
                </div>
                {getStatusBadge(committee.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Presiding Officer</p>
                  <div className="flex items-center gap-2">
                    <Avatar name={committee.presiding} size="xs" />
                    <span className="text-sm font-medium">{committee.presiding}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Members</p>
                  <p className="text-sm font-medium">{committee.members} members</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {committee.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Last meeting: {committee.lastMeeting}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="w-4 h-4 mr-1" />
                  Members
                </Button>
                <Button size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Committee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Committee"
        description="Register a new ICC or LCC"
      >
        <div className="space-y-4">
          <Input label="Committee Name" placeholder="e.g., TechCorp ICC" />
          <Input label="Organization" placeholder="Organization name" />
          <Select
            label="Type"
            options={[
              { value: "icc", label: "Internal Complaints Committee (ICC)" },
              { value: "lcc", label: "Local Complaints Committee (LCC)" },
            ]}
            placeholder="Select type"
          />
          <Input label="Presiding Officer" placeholder="Name of presiding officer" />
          <Input label="Email" type="email" placeholder="icc@organization.com" />
          <Input label="Phone" placeholder="+91 XX XXXX XXXX" />
          <Input label="Location" placeholder="City, State" />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1">Create Committee</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
