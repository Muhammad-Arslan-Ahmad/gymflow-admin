"use client";

import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Package, Edit2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ViewCategoryPage({ params }) {
  const navigate = useNavigate();
  const categoryId = params.id;

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["inventory-category", categoryId],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/categories/${categoryId}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["inventory-items-by-category", categoryId],
    queryFn: async () => {
      const res = await fetch(
        `/api/inventory/items?categoryId=${categoryId}&limit=1000`,
      );
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading category...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Category not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard/inventory"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </a>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {category.name}
            </h2>
            <p className="text-gray-500">
              Category: {category.type}
              {category.custom_type_label && ` (${category.custom_type_label})`}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate(`/dashboard/inventory/categories/${categoryId}/edit`);
          }}
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Total Items" />
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {category.item_count || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Items in this category</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Category Type" />
          <CardContent>
            <Badge variant="indigo" className="text-lg px-4 py-2">
              {category.type}
            </Badge>
            {category.custom_type_label && (
              <p className="text-sm text-gray-500 mt-2">
                {category.custom_type_label}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Low Stock Items" />
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {items?.data?.filter(
                (item) =>
                  item.reorder_level &&
                  item.quantity <= item.reorder_level &&
                  item.quantity > 0,
              ).length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Need restocking</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Items in Category"
          subtitle={`${items?.data?.length || 0} items found`}
        />
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading items...
            </div>
          ) : items?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No items in this category yet</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  navigate("/dashboard/inventory/items/new");
                }}
              >
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.data.map((item) => {
                const isLowStock =
                  item.reorder_level &&
                  item.quantity <= item.reorder_level &&
                  item.quantity > 0;
                const isOutOfStock = item.quantity === 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-red-600"
                              : isLowStock
                                ? "text-yellow-600"
                                : "text-gray-900"
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isOutOfStock
                            ? "Out of Stock"
                            : isLowStock
                              ? "Low Stock"
                              : "In Stock"}
                        </div>
                      </div>

                      {(isLowStock || isOutOfStock) && (
                        <AlertTriangle
                          className={`h-5 w-5 ${isOutOfStock ? "text-red-500" : "text-yellow-500"}`}
                        />
                      )}

                      <Badge
                        variant={
                          item.status === "ACTIVE" ? "success" : "danger"
                        }
                      >
                        {item.status}
                      </Badge>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/dashboard/inventory/items/${item.id}`);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigate(`/dashboard/inventory/items/${item.id}/edit`);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
