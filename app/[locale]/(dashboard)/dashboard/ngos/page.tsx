"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Search,
  Filter,
  Star,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Heart,
  Shield,
  Scale,
  Calendar,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

interface NGO {
  id: string;
  name: string;
  type: "ngo" | "legal" | "icc" | "government";
  description: string;
  services: string[];
  location: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviews: number;
  verified: boolean;
  responseTime: string;
}

const organizations: NGO[] = [];

const getTypeColor = (type: string) => {
  switch (type) {
    case "ngo":
      return "bg-primary-100 text-primary-700 border-primary-200";
    case "legal":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "icc":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "government":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "ngo":
      return "NGO";
    case "legal":
      return "Legal Body";
    case "icc":
      return "ICC Network";
    case "government":
      return "Government";
    default:
      return type;
  }
};

export default function NGOsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState<NGO | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [orgs, setOrgs] = useState<NGO[]>([]);
  const [committees, setCommittees] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpType, setHelpType] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [submittingHelp, setSubmittingHelp] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      setLoading(true);
      const [ngosRes, committeesRes] = await Promise.all([
        fetch("/api/ngos"),
        fetch("/api/committees"),
      ]);
      
      if (ngosRes.ok) {
        const data = await ngosRes.json();
        const mapped: NGO[] = (data.ngos || []).map((n: Record<string, unknown>) => ({
          id: n._id as string,
          name: n.name as string,
          type: "ngo",
          description: n.description as string || "",
          services: (n.services as string[]) || [],
          location: ((n.address as Record<string, string>)?.city || "") + ", " + ((n.address as Record<string, string>)?.state || ""),
          city: (n.address as Record<string, string>)?.city || "Unknown",
          phone: (n.contact as Record<string, string>)?.phone || "",
          email: (n.contact as Record<string, string>)?.email || "",
          website: (n.contact as Record<string, string>)?.website || "",
          rating: 4.5,
          reviews: 0,
          verified: (n.verification as Record<string, boolean>)?.verified || false,
          responseTime: "Within 24 hours",
        }));
        setOrgs(mapped);
      }

      if (committeesRes.ok) {
        const data = await committeesRes.json();
        const mapped: NGO[] = (data.committees || []).map((c: Record<string, unknown>) => ({
          id: c._id as string,
          name: c.name as string,
          type: (c.type as string) === "ICC" ? "icc" : "legal",
          description: `${(c.type as string)} at ${(c.organization as Record<string, string>)?.name || "Organization"}`,
          services: ["Complaint Guidance", "Investigation", "Mediation"],
          location: (c.organization as Record<string, string>)?.industry || "",
          city: "India",
          phone: (c.contact as Record<string, string>)?.phone || "",
          email: (c.contact as Record<string, string>)?.email || "",
          rating: 4.5,
          reviews: 0,
          verified: (c.compliance as Record<string, boolean>)?.iccConstituted || false,
          responseTime: "Within 48 hours",
        }));
        setCommittees(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    } finally {
      setLoading(false);
    }
  }

  const allOrganizations = [...orgs, ...committees];

  const filteredOrgs = allOrganizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || org.type === filterType;
    const matchesCity = filterCity === "all" || org.city === filterCity;
    return matchesSearch && matchesType && matchesCity;
  });

  const cities = [...new Set(allOrganizations.map((o) => o.city))].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-600" />
            NGOs & Committees
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with support organizations and legal bodies near you
          </p>
        </div>
      </div>

      {/* Quick Help */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-error/5 border-error/20">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Women Helpline</p>
              <a href="tel:181" className="text-error font-bold text-lg hover:underline">
                181
              </a>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">NCW Helpline</p>
              <a href="tel:7827-170-170" className="text-primary-600 font-bold text-lg hover:underline">
                7827-170-170
              </a>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Police Emergency</p>
              <a href="tel:100" className="text-secondary-600 font-bold text-lg hover:underline">
                100
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search organizations or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <Select
          options={[
            { value: "all", label: "All Types" },
            { value: "ngo", label: "NGOs" },
            { value: "legal", label: "Legal Bodies" },
            { value: "government", label: "Government" },
            { value: "icc", label: "ICC Network" },
          ]}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-40"
        />
        <Select
          options={[
            { value: "all", label: "All Cities" },
            ...cities.map((c) => ({ value: c, label: c })),
          ]}
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Organizations Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredOrgs.map((org) => (
          <Card key={org.id} hover className="group">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {org.name}
                      {org.verified && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                    </h3>
                    <Badge className={cn("mt-1", getTypeColor(org.type))} size="sm">
                      {getTypeLabel(org.type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-medium text-sm">{org.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {org.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {org.services.map((service, i) => (
                  <Badge key={i} variant="secondary" size="sm">
                    {service}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {org.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Response: {org.responseTime}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`tel:${org.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${org.email}`)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedOrg(org);
                    setShowContactModal(true);
                  }}
                >
                  Request Help
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workshops Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Upcoming Workshops & Programs
          </CardTitle>
          <CardDescription>
            Join awareness sessions and training programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Know Your Rights: PoSH Act Awareness",
                org: "Women's Rights Foundation",
                date: "Feb 15, 2026",
                time: "3:00 PM - 5:00 PM",
                mode: "Online",
              },
              {
                title: "Legal Remedies for Workplace Harassment",
                org: "Legal Aid Society",
                date: "Feb 20, 2026",
                time: "10:00 AM - 12:00 PM",
                mode: "Hybrid",
              },
            ].map((workshop, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl gap-4"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {workshop.title}
                  </h4>
                  <p className="text-sm text-gray-500">by {workshop.org}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {workshop.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {workshop.time}
                    </span>
                    <Badge variant="info" size="sm">
                      {workshop.mode}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Request Help from ${selectedOrg?.name}`}
        description="Share relevant information to get appropriate support"
      >
        <div className="space-y-4">
          <Select
            label="Type of Help Needed"
            options={[
              { value: "legal", label: "Legal Assistance" },
              { value: "counseling", label: "Counseling Support" },
              { value: "case", label: "Case Filing Help" },
              { value: "info", label: "General Information" },
            ]}
            placeholder="Select help type"
          />

          <Textarea
            label="Brief Description"
            placeholder="Describe your situation briefly (without personal details)..."
            rows={4}
          />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="share-case" className="rounded" />
            <label htmlFor="share-case" className="text-sm text-gray-600 dark:text-gray-400">
              Share my case details securely with this organization
            </label>
          </div>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-success shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Your identity remains protected. The organization will contact you through the platform.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
