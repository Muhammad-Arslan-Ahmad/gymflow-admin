"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  Edit,
  User,
  Phone,
  Mail,
  Briefcase,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "@/components/confirmation-modal";

export default function StaffShowPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const res = await fetch(`/api/staff?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch staff");
      const json = await res.json();
      return json.data?.[0];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete staff");
      }
      return res.json();
    },
    onSuccess: () => {
      navigate("/dashboard/staff");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      alert(`Failed to delete staff: ${error.message}`);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Staff member not found</p>
        <Button
          className="mt-4"
          onClick={() => {
            navigate("/dashboard/staff");
          }}
        >
          Back to Staff
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/staff")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {staff.first_name} {staff.last_name}
            </h2>
            <p className="text-sm text-gray-600">Staff #{staff.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={() => {
              navigate(`/dashboard/staff/${id}/edit`);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Personal Information" />
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {staff.first_name} {staff.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{staff.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {staff.email || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Employment Details" />
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <Badge variant="indigo" className="mt-1">
                  {staff.role}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                variant={staff.status === "ACTIVE" ? "success" : "warning"}
                className="mt-1"
              >
                {staff.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="font-semibold text-gray-900">
                {new Date(staff.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {staff.updated_at && staff.updated_at !== staff.created_at && (
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {new Date(staff.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staff?.first_name} ${staff?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
