"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  PieChart,
  Activity,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const resolutionStats = [
  { status: "Resolved in favor of complainant", count: 22, color: "bg-success" },
  { status: "Resolved with mediation", count: 8, color: "bg-blue-500" },
  { status: "Dismissed (insufficient evidence)", count: 3, color: "bg-gray-400" },
  { status: "Withdrawn by complainant", count: 2, color: "bg-yellow-500" },
];

const performanceMetrics = [
  {
    label: "Average Resolution Time",
    value: "23 days",
    change: "-5 days",
    trend: "down",
    description: "Target: 30 days",
  },
  {
    label: "First Response Time",
    value: "4 hours",
    change: "-2 hours",
    trend: "down",
    description: "Target: 24 hours",
  },
  {
    label: "Complainant Satisfaction",
    value: "87%",
    change: "+5%",
    trend: "up",
    description: "Based on feedback",
  },
  {
    label: "Evidence Submission Rate",
    value: "78%",
    change: "+12%",
    trend: "up",
    description: "Cases with evidence",
  },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-6-months");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/reports");
        if (res.ok) {
          const json = await res.json();
          setReportData(json);
        }
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const dynamicMetrics = [
    {
      label: "Total Cases",
      value: reportData.totalComplaints,
      change: "+12%",
      trend: "up",
      description: "All time",
    },
    {
      label: "Open Cases",
      value: reportData.activeComplaints,
      change: "-5%",
      trend: "down",
      description: "Currently investigating",
    },
    {
      label: "Resolved",
      value: reportData.resolvedComplaints,
      change: "+8%",
      trend: "up",
      description: "Successfully closed",
    },
    {
      label: "Urgent",
      value: reportData.urgentComplaints,
      change: "-2%",
      trend: "down",
      description: "Priority High",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into case management performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            options={[
              { value: "last-30-days", label: "Last 30 days" },
              { value: "last-3-months", label: "Last 3 months" },
              { value: "last-6-months", label: "Last 6 months" },
              { value: "last-year", label: "Last year" },
              { value: "all-time", label: "All time" },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-44"
          />
          <Button 
            variant="outline" 
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => { window.location.href = '/api/admin/reports/export'; }}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent>
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-500">{metric.label}</p>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    metric.trend === "up" ? "text-success" : "text-info"
                  )}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cases Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              Cases Over Time
            </CardTitle>
            <CardDescription>Monthly case submissions and resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {(reportData.monthlyTrend || []).map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex gap-1">
                    <div
                      className="flex-1 bg-primary-200 rounded-t"
                      style={{ height: `${(data.count || 0) * 10}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data._id?.month}/{data._id?.year}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-primary-200" />
                <span className="text-sm text-gray-500">Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-success" />
                <span className="text-sm text-gray-500">Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              Cases by Category
            </CardTitle>
            <CardDescription>Distribution of harassment types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(reportData.complaintsByType || []).map((item: any, index: number) => {
                const total = reportData.totalComplaints || 1;
                const percentage = Math.round((item.count / total) * 100);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item._id || "Unspecified"}
                      </span>
                      <span className="text-sm font-medium">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Stats & Compliance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resolution Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolution Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolutionStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("w-3 h-3 rounded-full", stat.color)} />
                    <span className="text-sm">{stat.status}</span>
                  </div>
                  <span className="font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">ICC Constituted</span>
                </div>
                <Badge variant="success" size="sm">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Annual Report Filed</span>
                </div>
                <Badge variant="success" size="sm">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm">Awareness Training</span>
                </div>
                <Badge variant="success" size="sm">100%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="text-sm">Policy Review Due</span>
                </div>
                <Badge variant="warning" size="sm">30 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ICC Member Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Priya Sharma", cases: 15, resolved: 12 },
                { name: "Anita Desai", cases: 12, resolved: 10 },
                { name: "Kavitha Menon", cases: 8, resolved: 7 },
              ].map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {member.resolved}/{member.cases} resolved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">
                      {Math.round((member.resolved / member.cases) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-600">47</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-success">68%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-info">23d</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Resolution</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary-600">87%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
