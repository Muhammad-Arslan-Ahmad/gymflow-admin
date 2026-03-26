"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";

export default function TrainersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["trainers", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/trainers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch trainers");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/trainers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trainer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trainers"]);
      setDeleteModalOpen(false);
      setTrainerToDelete(null);
    },
  });

  const handleDeleteClick = (trainer) => {
    setTrainerToDelete(trainer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (trainerToDelete) {
      deleteMutation.mutate(trainerToDelete.id);
    }
  };

  const columns = [
    {
      id: "trainer",
      header: "Trainer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            {row.original.first_name[0]}
            {row.original.last_name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.first_name} {row.original.last_name}
            </div>
            <div className="text-xs text-gray-500">{row.original.gender}</div>
          </div>
        </div>
      ),
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
      header: "Specialties",
      accessorKey: "specialties",
      cell: ({ getValue }) => (
        <span className="text-gray-600 truncate max-w-xs block">
          {getValue() || "General Fitness"}
        </span>
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
              navigate(`/dashboard/trainers/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/trainers/${row.original.id}/edit`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trainers</h2>
          <p className="text-gray-500">Manage gym trainers and specialties</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/dashboard/trainers/new");
          }}
        >
          <Plus className="h-4 w-4" /> Add Trainer
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
        availableFilters={[
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
        ]}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTrainerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Trainer"
        message={
          trainerToDelete
            ? `Are you sure you want to delete ${trainerToDelete.first_name} ${trainerToDelete.last_name}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
