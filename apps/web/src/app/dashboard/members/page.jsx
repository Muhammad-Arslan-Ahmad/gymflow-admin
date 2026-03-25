"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";

export default function MembersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["members", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/members?${params}`);
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    },
  });

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete.id);
    }
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {row.original.first_name[0]}
            {row.original.last_name[0]}
          </div>
          <span className="font-medium text-gray-900">
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-gray-900">{row.original.phone}</span>
          <span className="text-xs text-gray-500">{row.original.email}</span>
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
      id: "trainer",
      header: "Trainer",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.trainer_first_name
            ? `${row.original.trainer_first_name} ${row.original.trainer_last_name}`
            : "Not Assigned"}
        </span>
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
              navigate(`/dashboard/members/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/members/${row.original.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const availableFilters = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
    {
      id: "gender",
      label: "Gender",
      type: "select",
      options: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
        { label: "Other", value: "OTHER" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500">Manage your gym members directory</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/dashboard/members/new");
          }}
        >
          <Plus className="h-4 w-4" /> Add Member
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
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Member"
        message={
          memberToDelete
            ? `Are you sure you want to delete ${memberToDelete.first_name} ${memberToDelete.last_name}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
