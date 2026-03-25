"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Edit,
  User,
  Activity,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table";

export default function MemberShowPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) throw new Error("Failed to fetch member");
      return res.json();
    },
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["member-attendance", id],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?memberId=${id}&limit=100`);
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: activeTab === "attendance",
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["member-payments", id],
    queryFn: async () => {
      const res = await fetch(`/api/payments?memberId=${id}&limit=100`);
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: activeTab === "payments",
  });

  const { data: subscriptionsData } = useQuery({
    queryKey: ["member-subscriptions", id],
    queryFn: async () => {
      const res = await fetch(
        `/api/memberships/subscriptions?memberId=${id}&limit=100`,
      );
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: activeTab === "subscriptions",
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!member) {
    return <div className="p-8 text-center">Member not found</div>;
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: User },
    { key: "attendance", label: "Attendance", icon: Activity },
    { key: "payments", label: "Payments", icon: DollarSign },
    { key: "subscriptions", label: "Memberships", icon: Calendar },
  ];

  const attendanceColumns = [
    {
      header: "Date",
      accessorKey: "attendance_date",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "PRESENT"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "check_in",
      header: "Check-in",
      cell: ({ row }) =>
        row.original.check_in_at
          ? new Date(row.original.check_in_at).toLocaleTimeString()
          : "N/A",
    },
    {
      id: "check_out",
      header: "Check-out",
      cell: ({ row }) =>
        row.original.check_out_at
          ? new Date(row.original.check_out_at).toLocaleTimeString()
          : "N/A",
    },
  ];

  const paymentsColumns = [
    {
      id: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => `${row.original.currency} ${row.original.amount}`,
    },
    {
      id: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge className="bg-blue-100 text-blue-800">
          {row.original.method}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "CONFIRMED"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const subscriptionsColumns = [
    {
      header: "Plan ID",
      accessorKey: "plan_id",
    },
    {
      header: "Start Date",
      accessorKey: "start_date",
    },
    {
      header: "End Date",
      accessorKey: "end_date",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard/members"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </a>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h2>
            <p className="text-sm text-gray-600">Member #{member.id}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate(`/dashboard/members/${id}/edit`);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="Personal Information" />
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">
                    {member.first_name} {member.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{member.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{member.gender || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Membership Status" />
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      member.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trainer ID</p>
                  <p className="font-semibold">
                    {member.trainer_id || "No Trainer Assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold">
                    {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {(member.photo_url || member.signature_url) && (
            <Card>
              <CardHeader title="Documents & Media" />
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {member.photo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Member Photo</p>
                      <img
                        src={member.photo_url}
                        alt="Member Photo"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}

                  {member.signature_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Signature</p>
                      <img
                        src={member.signature_url}
                        alt="Member Signature"
                        className="border-2 border-gray-200 rounded-lg bg-white p-2"
                        style={{ maxWidth: "400px", height: "auto" }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader
            title="Attendance History"
            subtitle={`${attendanceData?.total || 0} total records`}
          />
          <CardContent>
            {attendanceData?.data?.length > 0 ? (
              <DataTable
                data={attendanceData.data}
                columns={attendanceColumns}
                emptyMessage="No attendance records found"
              />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No attendance records yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card>
          <CardHeader
            title="Payment History"
            subtitle={`${paymentsData?.total || 0} total payments`}
            action={
              <Button
                size="sm"
                onClick={() => {
                  navigate("/dashboard/payments/new");
                }}
              >
                Record Payment
              </Button>
            }
          />
          <CardContent>
            {paymentsData?.data?.length > 0 ? (
              <DataTable
                data={paymentsData.data}
                columns={paymentsColumns}
                emptyMessage="No payments found"
              />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No payments recorded yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "subscriptions" && (
        <Card>
          <CardHeader
            title="Membership Subscriptions"
            subtitle={`${subscriptionsData?.total || 0} total subscriptions`}
            action={
              <Button
                size="sm"
                onClick={() => {
                  navigate("/dashboard/memberships/subscriptions/new");
                }}
              >
                Assign Membership
              </Button>
            }
          />
          <CardContent>
            {subscriptionsData?.data?.length > 0 ? (
              <DataTable
                data={subscriptionsData.data}
                columns={subscriptionsColumns}
                emptyMessage="No subscriptions found"
              />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No membership subscriptions yet
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
