"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Users, Dumbbell, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewAttendancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [attendeeType, setAttendeeType] = useState("MEMBER");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      attendanceDate: new Date().toISOString().split("T")[0],
      checkInAt: new Date().toTimeString().slice(0, 5),
      status: "PRESENT",
      method: "MANUAL",
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members-select"],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: trainers } = useQuery({
    queryKey: ["trainers-select"],
    queryFn: async () => {
      const res = await fetch("/api/trainers?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch trainers");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: staff } = useQuery({
    queryKey: ["staff-select"],
    queryFn: async () => {
      const res = await fetch("/api/staff?limit=100");
      if (!res.ok) throw new Error("Failed to fetch staff");
      const json = await res.json();
      return json.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        attendee_type: attendeeType,
        member_id: attendeeType === "MEMBER" ? parseInt(data.attendeeId) : null,
        trainer_id:
          attendeeType === "TRAINER" ? parseInt(data.attendeeId) : null,
        staff_id: attendeeType === "STAFF" ? parseInt(data.attendeeId) : null,
        attendance_date: data.attendanceDate,
        check_in_at: data.checkInAt
          ? `${data.attendanceDate}T${data.checkInAt}:00Z`
          : null,
        check_out_at: data.checkOutAt
          ? `${data.attendanceDate}T${data.checkOutAt}:00Z`
          : null,
        status: data.status,
        method: data.method,
        notes: data.notes || null,
        marked_by_staff_id: data.markedByStaffId
          ? parseInt(data.markedByStaffId)
          : null,
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create attendance");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Attendance recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      navigate(`/dashboard/attendance/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const attendeeTypeOptions = [
    { value: "MEMBER", label: "Member", icon: Users, color: "blue" },
    { value: "TRAINER", label: "Trainer", icon: Dumbbell, color: "purple" },
    { value: "STAFF", label: "Staff", icon: Briefcase, color: "orange" },
  ];

  const getAttendeeList = () => {
    if (attendeeType === "MEMBER") return members;
    if (attendeeType === "TRAINER") return trainers;
    if (attendeeType === "STAFF") return staff;
    return [];
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/attendance"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Record Attendance
          </h2>
          <p className="text-gray-500">
            Mark attendance for members, trainers, or staff
          </p>
        </div>
      </div>

      {/* Attendee Type Selection */}
      <Card>
        <CardHeader
          title="Select Attendee Type"
          subtitle="Choose who you're marking attendance for"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attendeeTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = attendeeType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAttendeeType(option.value)}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        isSelected ? `bg-${option.color}-100` : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isSelected
                            ? `text-${option.color}-600`
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-medium ${
                        isSelected
                          ? `text-${option.color}-900`
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Attendance Details"
          subtitle={`Mark ${attendeeType.toLowerCase()} check-in and check-out`}
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {attendeeType === "MEMBER"
                  ? "Member"
                  : attendeeType === "TRAINER"
                    ? "Trainer"
                    : "Staff"}{" "}
                *
              </label>
              <select
                {...register("attendeeId", {
                  required: `${attendeeType === "MEMBER" ? "Member" : attendeeType === "TRAINER" ? "Trainer" : "Staff"} is required`,
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">
                  Select{" "}
                  {attendeeType === "MEMBER"
                    ? "Member"
                    : attendeeType === "TRAINER"
                      ? "Trainer"
                      : "Staff"}
                </option>
                {getAttendeeList()?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.first_name} {item.last_name}{" "}
                    {item.phone && `- ${item.phone}`}{" "}
                    {item.role && `- ${item.role}`}
                  </option>
                ))}
              </select>
              {errors.attendeeId && (
                <p className="text-xs text-red-600">
                  {errors.attendeeId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  {...register("attendanceDate", {
                    required: "Date is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.attendanceDate && (
                  <p className="text-xs text-red-600">
                    {errors.attendanceDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Check-in Time
                </label>
                <input
                  type="time"
                  {...register("checkInAt")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Check-out Time
                </label>
                <input
                  type="time"
                  {...register("checkOutAt")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Method
                </label>
                <select
                  {...register("method")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="QR">QR Code</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Marked By (Staff)
                </label>
                <select
                  {...register("markedByStaffId")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">None</option>
                  {staff?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional notes..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/attendance")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Record Attendance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
