"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, Package, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import ConfirmationModal from "@/components/confirmation-modal";

export default function InventoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: async () => {
      const response = await fetch("/api/inventory/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { data: items, isLoading: isItemsLoading } = useQuery({
    queryKey: ["inventory-items", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/inventory/items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
    enabled: activeTab === "items",
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/inventory/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory-items"]);
      setDeleteItemModalOpen(false);
      setItemToDelete(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/inventory/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory-categories"]);
      setDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleDeleteItemClick = (item) => {
    setItemToDelete(item);
    setDeleteItemModalOpen(true);
  };

  const handleDeleteCategoryClick = (category) => {
    setCategoryToDelete(category);
    setDeleteCategoryModalOpen(true);
  };

  const handleDeleteItemConfirm = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };

  const handleDeleteCategoryConfirm = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  const itemColumns = [
    {
      id: "item",
      header: "Item",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-xs text-gray-500">
              {row.original.sku || "No SKU"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category_name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-gray-900">{row.original.category_name}</span>
          <span className="text-xs text-gray-500">
            {row.original.category_type}
          </span>
        </div>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const isLow =
          row.original.quantity <= row.original.reorder_level &&
          row.original.quantity > 0;
        const isOut = row.original.quantity === 0;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold",
                isOut
                  ? "text-red-600"
                  : isLow
                    ? "text-yellow-600"
                    : "text-gray-900",
              )}
            >
              {row.original.quantity} {row.original.unit}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            {isOut && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge variant={getValue() === "ACTIVE" ? "success" : "danger"}>
          {getValue()}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/inventory/items/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/inventory/items/${row.original.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700"
            onClick={() => handleDeleteItemClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500">Manage gym assets and supplies</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
              navigate("/dashboard/inventory/categories/new");
            }}
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              navigate("/dashboard/inventory/items/new");
            }}
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("items")}
            className={`${activeTab === "items" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`${activeTab === "categories" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Categories
          </button>
        </nav>
      </div>

      {activeTab === "items" ? (
        <DataTable
          columns={itemColumns}
          data={items?.data || []}
          totalCount={items?.totalCount || 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          isLoading={isItemsLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          availableFilters={[
            {
              id: "categoryId",
              label: "Category",
              type: "select",
              options:
                categories?.map((c) => ({ label: c.name, value: c.id })) || [],
            },
            {
              id: "stockStatus",
              label: "Stock Level",
              type: "select",
              options: [
                { label: "Low Stock", value: "low" },
                { label: "Out of Stock", value: "out" },
              ],
            },
            {
              id: "status",
              label: "Status",
              type: "select",
              options: [
                { label: "Active", value: "ACTIVE" },
                { label: "Out of Service", value: "OUT_OF_SERVICE" },
              ],
            },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border rounded-lg p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                <Badge variant="indigo">{cat.type}</Badge>
              </div>
              <p className="text-gray-500 text-sm">
                Contains {cat.item_count} items.
              </p>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(`/dashboard/inventory/categories/${cat.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteCategoryClick(cat)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {categories?.length === 0 && (
            <p className="col-span-full text-center py-12 text-gray-500">
              No categories created yet.
            </p>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteItemModalOpen}
        onClose={() => {
          setDeleteItemModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteItemConfirm}
        title="Delete Item"
        message={
          itemToDelete
            ? `Are you sure you want to delete "${itemToDelete.name}"?`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteItemMutation.isPending}
      />

      <ConfirmationModal
        isOpen={deleteCategoryModalOpen}
        onClose={() => {
          setDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This may affect ${categoryToDelete.item_count} items.`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
