"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewSubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: "ACTIVE",
    },
  });

  const selectedPlanId = watch("planId");

  const { data: members } = useQuery({
    queryKey: ["members-select"],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const res = await fetch("/api/memberships/plans?limit=100");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const json = await res.json();
      return json.data;
    },
  });

  const selectedPlan = plans?.find((p) => p.id === parseInt(selectedPlanId));

  const calculateEndDate = (startDate, plan) => {
    if (!startDate || !plan) return "";
    const date = new Date(startDate);

    switch (plan.duration_unit) {
      case "DAYS":
        date.setDate(date.getDate() + plan.duration_value);
        break;
      case "WEEKS":
        date.setDate(date.getDate() + plan.duration_value * 7);
        break;
      case "MONTHS":
        date.setMonth(date.getMonth() + plan.duration_value);
        break;
      case "YEARS":
        date.setFullYear(date.getFullYear() + plan.duration_value);
        break;
    }

    return date.toISOString().split("T")[0];
  };

  const startDate = watch("startDate");

  // Auto-calculate end date when plan or start date changes
  if (selectedPlan && startDate) {
    const endDate = calculateEndDate(startDate, selectedPlan);
    if (endDate !== watch("endDate")) {
      setValue("endDate", endDate);
    }
  }

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

      const res = await fetch("/api/memberships/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription created successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      navigate("/dashboard/memberships");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/memberships")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Assign Membership</h2>
      </div>

      <Card>
        <CardHeader
          title="Subscription Details"
          subtitle="Assign a membership plan to a member"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Member *
              </label>
              <select
                {...register("memberId", { required: "Member is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Membership Plan *
              </label>
              <select
                {...register("planId", { required: "Plan is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Plan</option>
                {plans
                  ?.filter((p) => p.status === "ACTIVE")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                Status
              </label>
              <select
                {...register("status")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="FROZEN">Frozen</option>
              </select>
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
                onClick={() => {
                  navigate("/dashboard/memberships");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Assign Membership
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
