"use client";

import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewInventoryCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: "EQUIPMENT",
    },
  });

  const selectedType = watch("type");

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        type: data.type,
        customTypeLabel: data.type === "OTHER" ? data.customTypeLabel : null,
      };

      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      navigate("/dashboard/inventory");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">
          Add Inventory Category
        </h2>
      </div>

      <Card>
        <CardHeader
          title="Category Details"
          subtitle="Create a new inventory category"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category Name *
              </label>
              <input
                {...register("name", { required: "Category name is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Cardio Equipment"
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category Type *
              </label>
              <select
                {...register("type", { required: "Type is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="EQUIPMENT">Equipment</option>
                <option value="CONSUMABLE">Consumable</option>
                <option value="SUPPLEMENT">Supplement</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.type && (
                <p className="text-xs text-red-600">{errors.type.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Equipment: Gym machines, weights, etc. | Consumable: Towels,
                cleaning supplies | Supplement: Protein, vitamins
              </p>
            </div>

            {selectedType === "OTHER" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Custom Type Label
                </label>
                <input
                  {...register("customTypeLabel")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Merchandise"
                />
                <p className="text-xs text-gray-500">
                  Optional custom label for "Other" type categories
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  navigate("/dashboard/inventory");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
