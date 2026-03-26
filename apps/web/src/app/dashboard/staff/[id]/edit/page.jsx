import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function EditStaffPage({ params }) {
  const navigate = useNavigate();
  const staffId = params.id;
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  useEffect(() => {
    if (staff) {
      reset({
        firstName: staff.first_name,
        lastName: staff.last_name,
        phone: staff.phone,
        email: staff.email || "",
        role: staff.role || "",
        status: staff.status || "ACTIVE",
      });
    }
  }, [staff, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update staff");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Staff updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      queryClient.invalidateQueries({ queryKey: ["staff", staffId] });
      navigate(`/dashboard/staff`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/staff")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Staff Member</h2>
      </div>

      <Card>
        <CardHeader
          title="Staff Information"
          subtitle="Update staff member details"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+92 300 1234567"
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address (Optional)
              </label>
              <input
                {...register("email")}
                type="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  {...register("role", { required: "Role is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Role</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CLEANER">Cleaner</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-600">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/staff")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Update Staff Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
