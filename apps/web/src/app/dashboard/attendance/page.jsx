"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Users,
  Dumbbell,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import ConfirmationModal from "@/components/confirmation-modal";

export default function AttendancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/attendance?${params}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete attendance record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["attendance"]);
      setDeleteModalOpen(false);
      setAttendanceToDelete(null);
    },
  });

  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (attendanceToDelete) {
      deleteMutation.mutate(attendanceToDelete.id);
    }
  };

  const getAttendeeName = (row) => {
    if (row.attendee_type === "MEMBER" && row.member_first_name) {
      return `${row.member_first_name} ${row.member_last_name}`;
    }
    if (row.attendee_type === "TRAINER" && row.trainer_first_name) {
      return `${row.trainer_first_name} ${row.trainer_last_name}`;
    }
    if (row.attendee_type === "STAFF" && row.staff_first_name) {
      return `${row.staff_first_name} ${row.staff_last_name}`;
    }
    return "N/A";
  };

  const getAttendeeIcon = (type) => {
    switch (type) {
      case "MEMBER":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "TRAINER":
        return <Dumbbell className="h-4 w-4 text-purple-600" />;
      case "STAFF":
        return <Briefcase className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAttendeeTypeBadge = (type) => {
    const badgeConfig = {
      MEMBER: { className: "bg-blue-100 text-blue-800 border-blue-200" },
      TRAINER: { className: "bg-purple-100 text-purple-800 border-purple-200" },
      STAFF: { className: "bg-orange-100 text-orange-800 border-orange-200" },
    };

    const config = badgeConfig[type] || badgeConfig.MEMBER;
    return <Badge className={config.className}>{type}</Badge>;
  };

  const columns = [
    {
      id: "attendee_type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getAttendeeIcon(row.original.attendee_type)}
          {getAttendeeTypeBadge(row.original.attendee_type)}
        </div>
      ),
    },
    {
      id: "attendee",
      header: "Name",
      cell: ({ row }) => {
        const name = getAttendeeName(row.original);
        const phone =
          row.original.attendee_type === "MEMBER"
            ? row.original.member_phone
            : row.original.attendee_type === "TRAINER"
              ? row.original.trainer_phone
              : row.original.staff_phone;

        const initial = name
          .split(" ")
          .map((n) => n[0])
          .join("");
        const bgColor =
          row.original.attendee_type === "MEMBER"
            ? "bg-blue-100 text-blue-700"
            : row.original.attendee_type === "TRAINER"
              ? "bg-purple-100 text-purple-700"
              : "bg-orange-100 text-orange-700";

        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center font-bold text-xs`}
            >
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{name}</span>
              {phone && <span className="text-xs text-gray-500">{phone}</span>}
            </div>
          </div>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "attendance_date",
      cell: ({ getValue }) => format(new Date(getValue()), "MMM d, yyyy"),
    },
    {
      id: "check_in",
      header: "Check In",
      cell: ({ row }) =>
        row.original.check_in_at
          ? format(new Date(row.original.check_in_at), "h:mm a")
          : "-",
    },
    {
      id: "check_out",
      header: "Check Out",
      cell: ({ row }) =>
        row.original.check_out_at
          ? format(new Date(row.original.check_out_at), "h:mm a")
          : "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge variant={getValue() === "PRESENT" ? "success" : "warning"}>
          {getValue()}
        </Badge>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: ({ getValue }) => <Badge variant="info">{getValue()}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/attendance/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/attendance/${row.original.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const availableFilters = [
    {
      id: "attendeeType",
      label: "Attendee Type",
      type: "select",
      options: [
        { label: "Members", value: "MEMBER" },
        { label: "Trainers", value: "TRAINER" },
        { label: "Staff", value: "STAFF" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Present", value: "PRESENT" },
        { label: "Absent", value: "ABSENT" },
        { label: "Late", value: "LATE" },
      ],
    },
    {
      id: "method",
      label: "Method",
      type: "select",
      options: [
        { label: "Manual", value: "MANUAL" },
        { label: "QR", value: "QR" },
      ],
    },
    {
      id: "startDate",
      label: "From Date",
      type: "date",
    },
    {
      id: "endDate",
      label: "To Date",
      type: "date",
    },
  ];

  // Quick stats
  const stats = {
    total: data?.totalCount || 0,
    members:
      data?.data?.filter((a) => a.attendee_type === "MEMBER").length || 0,
    trainers:
      data?.data?.filter((a) => a.attendee_type === "TRAINER").length || 0,
    staff: data?.data?.filter((a) => a.attendee_type === "STAFF").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
          <p className="text-gray-500">
            Track attendance for members, trainers, and staff
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/dashboard/attendance/new");
          }}
        >
          <Plus className="h-4 w-4" /> Record Attendance
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.members}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trainers</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.trainers}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Staff</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.staff}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        totalCount={data?.totalCount || 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        availableFilters={availableFilters}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAttendanceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Record"
        message={
          attendanceToDelete
            ? `Are you sure you want to delete the attendance record for ${getAttendeeName(attendanceToDelete)} on ${format(new Date(attendanceToDelete.attendance_date), "MMM d, yyyy")}?`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
