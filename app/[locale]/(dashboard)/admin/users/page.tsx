"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Eye,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "ngo" | "icc";
  status: "active" | "inactive" | "suspended";
  verified: boolean;
  joinedAt: string;
  lastActive: string;
  casesReported: number;
}

const users: User[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    role: "icc",
    status: "active",
    verified: true,
    joinedAt: "Jan 15, 2026",
    lastActive: "2 hours ago",
    casesReported: 0,
  },
  {
    id: "2",
    name: "Anita Desai",
    email: "anita.desai@example.com",
    phone: "+91 98765 43211",
    role: "icc",
    status: "active",
    verified: true,
    joinedAt: "Jan 20, 2026",
    lastActive: "5 hours ago",
    casesReported: 0,
  },
  {
    id: "3",
    name: "Anonymous User",
    email: "user123@safeher.org",
    phone: "Hidden",
    role: "user",
    status: "active",
    verified: true,
    joinedAt: "Feb 1, 2026",
    lastActive: "1 day ago",
    casesReported: 2,
  },
  {
    id: "4",
    name: "Women's Rights Foundation",
    email: "contact@wrf.org",
    phone: "+91 22 2345 6789",
    role: "ngo",
    status: "active",
    verified: true,
    joinedAt: "Dec 10, 2025",
    lastActive: "3 hours ago",
    casesReported: 0,
  },
  {
    id: "5",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+91 98765 43212",
    role: "user",
    status: "active",
    verified: true,
    joinedAt: "Feb 5, 2026",
    lastActive: "Just now",
    casesReported: 1,
  },
  {
    id: "6",
    name: "Suspended User",
    email: "suspended@example.com",
    phone: "+91 98765 43213",
    role: "user",
    status: "suspended",
    verified: false,
    joinedAt: "Jan 25, 2026",
    lastActive: "1 week ago",
    casesReported: 0,
  },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge variant="error">Admin</Badge>;
    case "icc":
      return <Badge variant="info">ICC Member</Badge>;
    case "ngo":
      return <Badge variant="success">NGO</Badge>;
    default:
      return <Badge variant="secondary">User</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="success" size="sm">Active</Badge>;
    case "inactive":
      return <Badge variant="default" size="sm">Inactive</Badge>;
    case "suspended":
      return <Badge variant="error" size="sm">Suspended</Badge>;
    default:
      return <Badge size="sm">{status}</Badge>;
  }
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, ICC members, and NGO accounts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.filter(u => u.role === "user").length, color: "bg-gray-100 text-gray-600" },
          { label: "ICC Members", value: users.filter(u => u.role === "icc").length, color: "bg-blue-100 text-blue-600" },
          { label: "NGOs", value: users.filter(u => u.role === "ngo").length, color: "bg-green-100 text-green-600" },
          { label: "Suspended", value: users.filter(u => u.status === "suspended").length, color: "bg-red-100 text-red-600" },
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-xl", stat.color)}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Roles" },
              { value: "user", label: "Users" },
              { value: "icc", label: "ICC Members" },
              { value: "ngo", label: "NGOs" },
              { value: "admin", label: "Admins" },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "suspended", label: "Suspended" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">User</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Role</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Status</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Joined</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Last Active</th>
                <th className="text-right py-4 px-4 font-medium text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          {user.verified && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {user.joinedAt}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {user.lastActive}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error hover:bg-error/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        description="Create a new user or ICC member account"
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" />
          <Input label="Email Address" type="email" placeholder="email@example.com" />
          <Input label="Phone Number" placeholder="+91 98765 43210" />
          <Select
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "icc", label: "ICC Member" },
              { value: "ngo", label: "NGO Partner" },
              { value: "admin", label: "Admin" },
            ]}
            placeholder="Select role"
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1">Create User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
