"use client";

import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table";

export default function TrainerShowPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;

  const { data: trainer, isLoading } = useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      const res = await fetch(`/api/trainers?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch trainer");
      const json = await res.json();
      return json.data?.[0];
    },
  });

  const { data: assignedMembers } = useQuery({
    queryKey: ["trainer-members", id],
    queryFn: async () => {
      const res = await fetch(`/api/members?trainerId=${id}&limit=100`);
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!trainer) {
    return <div className="p-8 text-center">Trainer not found</div>;
  }

  const membersColumns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "First Name",
      accessorKey: "first_name",
    },
    {
      header: "Last Name",
      accessorKey: "last_name",
    },
    {
      header: "Phone",
      accessorKey: "phone",
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
          <button
            onClick={() => navigate("/dashboard/trainers")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {trainer.first_name} {trainer.last_name}
            </h2>
            <p className="text-sm text-gray-600">Trainer #{trainer.id}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate(`/dashboard/trainers/${id}/edit`);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Personal Information" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-semibold">
                {trainer.first_name} {trainer.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-semibold">{trainer.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{trainer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{trainer.email || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Professional Details" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                className={
                  trainer.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {trainer.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Specialties</p>
              <p className="font-semibold">{trainer.specialties || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="font-semibold">
                {new Date(trainer.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Assigned Members"
          subtitle={`${assignedMembers?.total || 0} members`}
        />
        <CardContent>
          {assignedMembers?.data?.length > 0 ? (
            <DataTable
              data={assignedMembers.data}
              columns={membersColumns}
              emptyMessage="No members assigned"
            />
          ) : (
            <p className="text-center text-gray-500 py-8">
              No members assigned yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
