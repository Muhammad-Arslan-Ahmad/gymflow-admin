"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EditSubscriptionPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", id],
    queryFn: async () => {
      const res = await fetch(`/api/memberships/subscriptions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch subscription");
      const data = await res.json();
      console.log("Subscription data:", data);
      return data;
    },
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["members-select"],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const res = await fetch("/api/memberships/plans?limit=100");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const json = await res.json();
      console.log("Plans data:", json.data);
      return json.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      memberId: "",
      planId: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
      notes: "",
    },
  });

  // Load subscription data into form when all data is fetched
  useEffect(() => {
    if (subscription && members && plans) {
      const formData = {
        memberId: String(subscription.member_id),
        planId: String(subscription.plan_id),
        startDate: subscription.start_date || "",
        endDate: subscription.end_date || "",
        status: subscription.status || "ACTIVE",
        notes: subscription.notes || "",
      };
      console.log("Setting form data:", formData);
      reset(formData);
    }
  }, [subscription, members, plans, reset]);

  const selectedPlanId = watch("planId");
  const selectedPlan = plans?.find((p) => String(p.id) === selectedPlanId);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        memberId: parseInt(data.memberId),
        planId: parseInt(data.planId),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        notes: data.notes || null,
      };

      const res = await fetch(`/api/memberships/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      navigate("/dashboard/memberships");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = subscriptionLoading || membersLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Subscription not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/memberships"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">Edit Subscription</h2>
      </div>

      <Card>
        <CardHeader
          title="Subscription Details"
          subtitle="Update membership subscription information"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Member *
              </label>
              <select
                {...register("memberId", { required: "Member is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Member</option>
                {members?.map((m) => (
                  <option key={m.id} value={String(m.id)}>
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Membership Plan *
              </label>
              <select
                {...register("planId", { required: "Plan is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Plan</option>
                {plans?.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} - PKR {p.price} ({p.duration_value}{" "}
                    {p.duration_unit.toLowerCase()})
                  </option>
                ))}
              </select>
              {errors.planId && (
                <p className="text-xs text-red-600">{errors.planId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-600">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                {...register("status", { required: "Status is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="FROZEN">Frozen</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Optional notes..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  navigate("/dashboard/memberships");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Update Subscription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
