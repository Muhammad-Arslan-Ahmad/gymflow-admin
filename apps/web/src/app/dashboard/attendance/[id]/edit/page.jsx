"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, User, Dumbbell, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EditAttendancePage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const queryClient = useQueryClient();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/${id}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
  });

  const [attendeeType, setAttendeeType] = useState(
    attendance?.attendee_type || "MEMBER",
  );

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    values: attendance
      ? {
          attendeeType: attendance.attendee_type,
          memberId: attendance.member_id || "",
          trainerId: attendance.trainer_id || "",
          staffId: attendance.staff_id || "",
          attendanceDate: attendance.attendance_date,
          checkInAt: attendance.check_in_at
            ? new Date(attendance.check_in_at).toTimeString().slice(0, 5)
            : "",
          checkOutAt: attendance.check_out_at
            ? new Date(attendance.check_out_at).toTimeString().slice(0, 5)
            : "",
          status: attendance.status,
          method: attendance.method,
          markedByStaffId: attendance.marked_by_staff_id || "",
          notes: attendance.notes || "",
        }
      : {},
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        attendee_type: data.attendeeType,
        member_id:
          data.attendeeType === "MEMBER" ? parseInt(data.memberId) : null,
        trainer_id:
          data.attendeeType === "TRAINER" ? parseInt(data.trainerId) : null,
        staff_id: data.attendeeType === "STAFF" ? parseInt(data.staffId) : null,
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
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update attendance");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Attendance updated successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      navigate(`/dashboard/attendance/${id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const selectedType = watch("attendeeType");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/dashboard/attendance/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Attendance</h2>
      </div>

      <Card>
        <CardHeader
          title="Attendance Details"
          subtitle="Update attendance information"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Attendee Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setValue("attendeeType", "MEMBER");
                    setAttendeeType("MEMBER");
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === "MEMBER"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <User
                    className={`h-6 w-6 mx-auto mb-2 ${
                      selectedType === "MEMBER"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      selectedType === "MEMBER"
                        ? "text-blue-900"
                        : "text-gray-700"
                    }`}
                  >
                    Member
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue("attendeeType", "TRAINER");
                    setAttendeeType("TRAINER");
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === "TRAINER"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Dumbbell
                    className={`h-6 w-6 mx-auto mb-2 ${
                      selectedType === "TRAINER"
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      selectedType === "TRAINER"
                        ? "text-purple-900"
                        : "text-gray-700"
                    }`}
                  >
                    Trainer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue("attendeeType", "STAFF");
                    setAttendeeType("STAFF");
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === "STAFF"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Users
                    className={`h-6 w-6 mx-auto mb-2 ${
                      selectedType === "STAFF"
                        ? "text-orange-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      selectedType === "STAFF"
                        ? "text-orange-900"
                        : "text-gray-700"
                    }`}
                  >
                    Staff
                  </p>
                </button>
              </div>
              <input type="hidden" {...register("attendeeType")} />
            </div>

            {selectedType === "MEMBER" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Member *
                </label>
                <select
                  {...register("memberId", {
                    required:
                      selectedType === "MEMBER" ? "Member is required" : false,
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Member</option>
                  {members?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} - {m.phone}
                    </option>
                  ))}
                </select>
                {errors.memberId && (
                  <p className="text-xs text-red-600">
                    {errors.memberId.message}
                  </p>
                )}
              </div>
            )}

            {selectedType === "TRAINER" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Trainer *
                </label>
                <select
                  {...register("trainerId", {
                    required:
                      selectedType === "TRAINER"
                        ? "Trainer is required"
                        : false,
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Trainer</option>
                  {trainers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name} - {t.phone}
                    </option>
                  ))}
                </select>
                {errors.trainerId && (
                  <p className="text-xs text-red-600">
                    {errors.trainerId.message}
                  </p>
                )}
              </div>
            )}

            {selectedType === "STAFF" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Staff *
                </label>
                <select
                  {...register("staffId", {
                    required:
                      selectedType === "STAFF" ? "Staff is required" : false,
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Staff</option>
                  {staff?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} - {s.role}
                    </option>
                  ))}
                </select>
                {errors.staffId && (
                  <p className="text-xs text-red-600">
                    {errors.staffId.message}
                  </p>
                )}
              </div>
            )}

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
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`/dashboard/attendance/${id}`)
                }
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
