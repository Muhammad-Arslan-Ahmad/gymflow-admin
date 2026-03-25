"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewStaffPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: "ACTIVE",
      role: "RECEPTIONIST",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create staff");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Staff member created successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate(`/dashboard/staff/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/staff"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">
          Add New Staff Member
        </h2>
      </div>

      <Card>
        <CardHeader
          title="Staff Information"
          subtitle="Basic details for the new staff member"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                  Last Name *
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Role *
                </label>
                <select
                  {...register("role", { required: "Role is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CLEANER">Cleaner</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+92 300 1234567"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="staff@gym.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register("status")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  navigate("/dashboard/staff");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create Staff Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
