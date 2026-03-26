"use client";

import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Package, Edit2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ViewInventoryItemPage({ params }) {
  const navigate = useNavigate();
  const itemId = params.id;

  const { data: item, isLoading } = useQuery({
    queryKey: ["inventory-item", itemId],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/items/${itemId}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

  const { data: category } = useQuery({
    queryKey: ["inventory-category", item?.category_id],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/categories/${item.category_id}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!item?.category_id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  const isLowStock = item.quantity <= item.reorder_level && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/inventory")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-500">SKU: {item.sku || "N/A"}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate(`/dashboard/inventory/items/${itemId}/edit`);
          }}
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Stock Level" />
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  isOutOfStock
                    ? "bg-red-100"
                    : isLowStock
                      ? "bg-yellow-100"
                      : "bg-green-100"
                }`}
              >
                {isOutOfStock || isLowStock ? (
                  <AlertTriangle
                    className={`h-6 w-6 ${isOutOfStock ? "text-red-600" : "text-yellow-600"}`}
                  />
                ) : (
                  <Package className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isOutOfStock
                      ? "text-red-600"
                      : isLowStock
                        ? "text-yellow-600"
                        : "text-gray-900"
                  }`}
                >
                  {item.quantity} {item.unit}
                </div>
                <div className="text-sm text-gray-500">
                  {isOutOfStock
                    ? "Out of Stock"
                    : isLowStock
                      ? "Low Stock"
                      : "In Stock"}
                </div>
              </div>
            </div>
            {item.reorder_level && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">Reorder Level</div>
                <div className="font-medium text-gray-900">
                  {item.reorder_level} {item.unit}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Category" />
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium text-gray-900">
                  {category?.name || "Loading..."}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <Badge variant="indigo">{category?.type || item.type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status" />
          <CardContent>
            <Badge
              variant={item.status === "ACTIVE" ? "success" : "danger"}
              className="text-lg px-4 py-2"
            >
              {item.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Item Details" />
          <CardContent className="space-y-4">
            {item.image_url && (
              <div>
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Purchase Price</div>
                <div className="font-medium text-gray-900">
                  {item.purchase_price
                    ? `PKR ${parseFloat(item.purchase_price).toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sale Price</div>
                <div className="font-medium text-gray-900">
                  {item.sale_price
                    ? `PKR ${parseFloat(item.sale_price).toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Supplier</div>
              <div className="font-medium text-gray-900">
                {item.supplier || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium text-gray-900">
                {item.location || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Additional Information" />
          <CardContent className="space-y-4">
            {item.expiry_date && (
              <div>
                <div className="text-sm text-gray-500">Expiry Date</div>
                <div className="font-medium text-gray-900">
                  {new Date(item.expiry_date).toLocaleDateString()}
                </div>
              </div>
            )}
            {item.serial_number && (
              <div>
                <div className="text-sm text-gray-500">Serial Number</div>
                <div className="font-medium text-gray-900">
                  {item.serial_number}
                </div>
              </div>
            )}
            {item.warranty_end_date && (
              <div>
                <div className="text-sm text-gray-500">Warranty End Date</div>
                <div className="font-medium text-gray-900">
                  {new Date(item.warranty_end_date).toLocaleDateString()}
                </div>
              </div>
            )}
            {item.maintenance_interval_days && (
              <div>
                <div className="text-sm text-gray-500">
                  Maintenance Interval
                </div>
                <div className="font-medium text-gray-900">
                  Every {item.maintenance_interval_days} days
                </div>
              </div>
            )}
            {item.last_serviced_at && (
              <div>
                <div className="text-sm text-gray-500">Last Serviced</div>
                <div className="font-medium text-gray-900">
                  {new Date(item.last_serviced_at).toLocaleDateString()}
                </div>
              </div>
            )}
            {item.next_service_due_at && (
              <div>
                <div className="text-sm text-gray-500">Next Service Due</div>
                <div className="font-medium text-gray-900">
                  {new Date(item.next_service_due_at).toLocaleDateString()}
                </div>
              </div>
            )}
            {!item.expiry_date &&
              !item.serial_number &&
              !item.warranty_end_date &&
              !item.maintenance_interval_days &&
              !item.last_serviced_at &&
              !item.next_service_due_at && (
                <p className="text-gray-500 text-sm">
                  No additional information available
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Timeline" />
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Created</span>
              <span className="font-medium text-gray-900">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="font-medium text-gray-900">
                {new Date(item.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
