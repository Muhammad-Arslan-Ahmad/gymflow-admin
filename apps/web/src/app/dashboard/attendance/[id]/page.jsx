"use client";

import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Edit, User, Dumbbell, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AttendanceShowPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/${id}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!attendance) {
    return <div className="p-8 text-center">Attendance record not found</div>;
  }

  const statusColors = {
    PRESENT: "bg-green-100 text-green-800",
    ABSENT: "bg-red-100 text-red-800",
    LATE: "bg-yellow-100 text-yellow-800",
  };

  const typeColors = {
    MEMBER: "bg-blue-100 text-blue-800",
    TRAINER: "bg-purple-100 text-purple-800",
    STAFF: "bg-orange-100 text-orange-800",
  };

  const typeIcons = {
    MEMBER: User,
    TRAINER: Dumbbell,
    STAFF: Users,
  };

  const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    return new Date(dt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = () => {
    if (!attendance.check_in_at || !attendance.check_out_at) return "N/A";
    const diff =
      new Date(attendance.check_out_at) - new Date(attendance.check_in_at);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Get attendee name and details based on type
  const getAttendeeInfo = () => {
    if (attendance.attendee_type === "MEMBER") {
      return {
        name: `${attendance.member_first_name} ${attendance.member_last_name}`,
        phone: attendance.member_phone,
        email: attendance.member_email,
        id: attendance.member_id,
      };
    } else if (attendance.attendee_type === "TRAINER") {
      return {
        name: `${attendance.trainer_first_name} ${attendance.trainer_last_name}`,
        phone: attendance.trainer_phone,
        email: attendance.trainer_email,
        id: attendance.trainer_id,
      };
    } else if (attendance.attendee_type === "STAFF") {
      return {
        name: `${attendance.staff_first_name} ${attendance.staff_last_name}`,
        phone: attendance.staff_phone,
        email: attendance.staff_email,
        id: attendance.staff_id,
      };
    }
    return { name: "Unknown", phone: "N/A", email: "N/A", id: "N/A" };
  };

  const attendeeInfo = getAttendeeInfo();
  const TypeIcon = typeIcons[attendance.attendee_type] || User;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/attendance")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Attendance Details
            </h2>
            <p className="text-sm text-gray-600">Record #{attendance.id}</p>
          </div>
        </div>
        <Button
          onClick={() =>
            navigate(`/dashboard/attendance/${id}/edit`)
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Attendee Information" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    typeColors[attendance.attendee_type] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {attendance.attendee_type}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{attendeeInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{attendeeInfo.phone || "N/A"}</p>
            </div>
            {attendeeInfo.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{attendeeInfo.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">ID</p>
              <p className="font-semibold">{attendeeInfo.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Attendance Status" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">
                {new Date(attendance.attendance_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                className={
                  statusColors[attendance.status] || "bg-gray-100 text-gray-800"
                }
              >
                {attendance.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Method</p>
              <Badge className="bg-blue-100 text-blue-800">
                {attendance.method}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Time Tracking" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="font-semibold">
                {formatDateTime(attendance.check_in_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="font-semibold">
                {formatDateTime(attendance.check_out_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{calculateDuration()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recording Details" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Marked By</p>
              <p className="font-semibold">
                {attendance.marked_by_first_name &&
                attendance.marked_by_last_name
                  ? `${attendance.marked_by_first_name} ${attendance.marked_by_last_name}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-semibold">
                {formatDateTime(attendance.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold">
                {formatDateTime(attendance.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        {attendance.notes && (
          <Card className="md:col-span-2">
            <CardHeader title="Notes" />
            <CardContent>
              <p className="text-gray-700">{attendance.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
