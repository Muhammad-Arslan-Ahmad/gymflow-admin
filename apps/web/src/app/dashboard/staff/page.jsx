import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";

export default function StaffPage() {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [staffToDelete, setStaffToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["staff", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/staff?${params}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete staff");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setStaffToDelete(null);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      alert(`Failed to delete staff: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete.id);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.first_name} {row.original.last_name}
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: ({ getValue }) => <Badge variant="indigo">{getValue()}</Badge>,
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-gray-900">{row.original.phone}</span>
          <span className="text-xs text-gray-500">
            {row.original.email || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge variant={getValue() === "ACTIVE" ? "success" : "warning"}>
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
              navigate(`/dashboard/staff/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/staff/${row.original.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setStaffToDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const availableFilters = [
    {
      id: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "Admin", value: "ADMIN" },
        { label: "Receptionist", value: "RECEPTIONIST" },
        { label: "Manager", value: "MANAGER" },
        { label: "Cleaner", value: "CLEANER" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff</h2>
          <p className="text-gray-500">Manage your gym staff and roles</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/dashboard/staff/new");
          }}
        >
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        totalCount={data?.totalCount || 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        availableFilters={availableFilters}
      />

      <ConfirmationModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staffToDelete?.first_name} ${staffToDelete?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
