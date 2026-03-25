"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Snowflake } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FreezeSubscriptionPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", id],
    queryFn: async () => {
      const res = await fetch(`/api/memberships/subscriptions?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch subscription");
      const json = await res.json();
      return json.data?.[0];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/memberships/subscriptions/${id}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frozenFrom: data.frozenFrom,
          frozenTo: data.frozenTo,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to freeze subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription frozen successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      navigate("/dashboard/memberships");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
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
        <div className="flex items-center gap-2">
          <Snowflake className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Freeze Membership
          </h2>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Freeze Period"
          subtitle="Temporarily pause this membership"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                The membership will be paused during the freeze period. The end
                date will be automatically extended by the freeze duration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Freeze From *
                </label>
                <input
                  type="date"
                  {...register("frozenFrom", {
                    required: "Start date is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.frozenFrom && (
                  <p className="text-xs text-red-600">
                    {errors.frozenFrom.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Freeze Until *
                </label>
                <input
                  type="date"
                  {...register("frozenTo", {
                    required: "End date is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.frozenTo && (
                  <p className="text-xs text-red-600">
                    {errors.frozenTo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Reason / Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional reason for freezing..."
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
                Freeze Membership
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
