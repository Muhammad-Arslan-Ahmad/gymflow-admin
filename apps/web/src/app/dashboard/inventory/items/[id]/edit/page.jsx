"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Upload } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useUpload from "@/utils/useUpload";

export default function EditInventoryItemPage({ params }) {
  const navigate = useNavigate();
  const itemId = params.id;
  const queryClient = useQueryClient();
  const { upload, uploading } = useUpload();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      status: "ACTIVE",
      unit: "PIECES",
      quantity: 0,
    },
  });

  const { data: item, isLoading } = useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/items/${itemId}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/categories?limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        categoryId: item.category_id,
        name: item.name,
        sku: item.sku || "",
        quantity: item.quantity,
        unit: item.unit,
        reorderLevel: item.reorder_level || "",
        status: item.status,
        purchasePrice: item.purchase_price || "",
        salePrice: item.sale_price || "",
        supplier: item.supplier || "",
        location: item.location || "",
        expiryDate: item.expiry_date || "",
        serialNumber: item.serial_number || "",
        warrantyEndDate: item.warranty_end_date || "",
        maintenanceIntervalDays: item.maintenance_interval_days || "",
        imageUrl: item.image_url || "",
      });
    }
  }, [item, reset]);

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories?.find(
    (c) => c.id === parseInt(selectedCategoryId),
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({ file });
      setValue("imageUrl", result.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        categoryId: parseInt(data.categoryId),
        name: data.name,
        sku: data.sku || null,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        reorderLevel: data.reorderLevel ? parseFloat(data.reorderLevel) : null,
        status: data.status,
        purchasePrice: data.purchasePrice
          ? parseFloat(data.purchasePrice)
          : null,
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        supplier: data.supplier || null,
        location: data.location || null,
        expiryDate: data.expiryDate || null,
        serialNumber: data.serialNumber || null,
        warrantyEndDate: data.warrantyEndDate || null,
        maintenanceIntervalDays: data.maintenanceIntervalDays
          ? parseInt(data.maintenanceIntervalDays)
          : null,
        imageUrl: data.imageUrl || null,
      };

      const res = await fetch(`/api/inventory/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Inventory item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item", itemId] });
      navigate("/dashboard/inventory");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isEquipment = selectedCategory?.type === "EQUIPMENT";
  const isConsumable =
    selectedCategory?.type === "CONSUMABLE" ||
    selectedCategory?.type === "SUPPLEMENT";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">
          Edit Inventory Item
        </h2>
      </div>

      <Card>
        <CardHeader
          title="Item Details"
          subtitle="Update inventory item information"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                {...register("categoryId", {
                  required: "Category is required",
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Item Name *
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Treadmill Pro X1"
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <input
                  {...register("sku")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="SKU-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("quantity", {
                    required: "Quantity is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  {...register("unit")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PIECES">Pieces</option>
                  <option value="KG">Kilograms</option>
                  <option value="LITERS">Liters</option>
                  <option value="BOXES">Boxes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Reorder Level
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("reorderLevel")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Purchase Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("purchasePrice")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("salePrice")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <input
                  {...register("supplier")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  {...register("location")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Storage Room A"
                />
              </div>
            </div>

            {isConsumable && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  {...register("expiryDate")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {isEquipment && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Serial Number
                    </label>
                    <input
                      {...register("serialNumber")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="SN-12345"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Warranty End Date
                    </label>
                    <input
                      type="date"
                      {...register("warrantyEndDate")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Maintenance Interval (Days)
                  </label>
                  <input
                    type="number"
                    {...register("maintenanceIntervalDays")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="90"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Item Image
              </label>
              <input type="hidden" {...register("imageUrl")} />
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">
                        {uploading ? "Uploading..." : "Click to upload image"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {watch("imageUrl") && (
                <div className="mt-2">
                  <img
                    src={watch("imageUrl")}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
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
                  navigate("/dashboard/inventory");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting || uploading}>
                Update Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
