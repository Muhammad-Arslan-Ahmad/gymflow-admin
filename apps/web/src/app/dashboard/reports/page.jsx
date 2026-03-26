"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, StatCard } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-stats"],
    queryFn: async () => {
      const res = await fetch("/api/payments?limit=1000");
      if (!res.ok) return [];
      const json = await res.json();

      const monthlyRevenue = {};
      json.data?.forEach((payment) => {
        if (payment.status === "CONFIRMED") {
          const month = new Date(payment.created_at).toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          });
          monthlyRevenue[month] =
            (monthlyRevenue[month] || 0) + parseFloat(payment.amount);
        }
      });

      return Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue),
        }))
        .slice(-6);
    },
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance-stats"],
    queryFn: async () => {
      const res = await fetch("/api/attendance?limit=1000");
      if (!res.ok) return [];
      const json = await res.json();

      const dailyAttendance = {};
      json.data?.forEach((record) => {
        const date = new Date(record.attendance_date).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" },
        );
        dailyAttendance[date] = (dailyAttendance[date] || 0) + 1;
      });

      return Object.entries(dailyAttendance)
        .map(([date, count]) => ({
          date,
          count,
        }))
        .slice(-7);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Reports & Analytics
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          View insights and trends for your gym
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats?.totalMembers || 0}
          icon={Users}
          description="All registered members"
        />
        <StatCard
          label="Active Memberships"
          value={stats?.activeMemberships || 0}
          icon={Calendar}
          description="Currently active"
        />
        <StatCard
          label="Today's Revenue"
          value={`PKR ${stats?.todayRevenue || 0}`}
          icon={DollarSign}
          description="Payments received today"
        />
        <StatCard
          label="Today's Attendance"
          value={stats?.todayAttendance || 0}
          icon={Activity}
          description="Members checked in"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Monthly Revenue Trend"
            subtitle="Last 6 months"
            action={<BarChart3 className="h-5 w-5 text-gray-400" />}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`PKR ${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Daily Attendance Trend"
            subtitle="Last 7 days"
            action={<TrendingUp className="h-5 w-5 text-gray-400" />}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} members`, "Attendance"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader title="Payment Methods" />
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cash</span>
              <span className="font-semibold">
                {stats?.paymentMethodBreakdown?.CASH || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Online</span>
              <span className="font-semibold">
                {stats?.paymentMethodBreakdown?.ONLINE || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Member Status" />
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-semibold text-green-600">
                {stats?.memberStatusBreakdown?.ACTIVE || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inactive</span>
              <span className="font-semibold text-gray-600">
                {stats?.memberStatusBreakdown?.INACTIVE || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick Stats" />
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Trainers</span>
              <span className="font-semibold">{stats?.totalTrainers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Staff</span>
              <span className="font-semibold">{stats?.totalStaff || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
