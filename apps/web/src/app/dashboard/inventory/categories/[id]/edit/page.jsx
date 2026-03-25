"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EditInventoryCategoryPage({ params }) {
  const navigate = useNavigate();
  const categoryId = params.id;
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: "EQUIPMENT",
    },
  });

  const { data: category, isLoading } = useQuery({
    queryKey: ["inventory-category", categoryId],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/categories/${categoryId}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        customTypeLabel: category.custom_type_label || "",
      });
    }
  }, [category, reset]);

  const selectedType = watch("type");

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        type: data.type,
        customTypeLabel: data.type === "OTHER" ? data.customTypeLabel : null,
      };

      const res = await fetch(`/api/inventory/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-category", categoryId],
      });
      navigate("/dashboard/inventory");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
        <a
          href="/dashboard/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">
          Edit Inventory Category
        </h2>
      </div>

      <Card>
        <CardHeader
          title="Category Details"
          subtitle="Update category information"
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

            {category?.item_count > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This category contains{" "}
                  {category.item_count} item(s). Changing the type may affect
                  how these items are managed.
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
                Update Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
