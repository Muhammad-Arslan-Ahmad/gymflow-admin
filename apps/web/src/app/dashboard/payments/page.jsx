import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, ShieldAlert, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ConfirmationModal from "@/components/confirmation-modal";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", pageIndex, pageSize, searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/payments?${params}`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    },
  });

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      deleteMutation.mutate(paymentToDelete.id);
    }
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "created_at",
      cell: ({ getValue }) =>
        format(new Date(getValue()), "MMM d, yyyy h:mm a"),
    },
    {
      id: "member",
      header: "Member",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.first_name} {row.original.last_name}
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-bold text-gray-900">
          {row.original.amount} {row.original.currency}
        </span>
      ),
    },
    {
      header: "Method",
      accessorKey: "method",
      cell: ({ getValue }) => <Badge variant="info">{getValue()}</Badge>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge
          variant={
            getValue() === "CONFIRMED"
              ? "success"
              : getValue() === "PENDING"
                ? "warning"
                : getValue() === "REJECTED"
                  ? "danger"
                  : "default"
          }
        >
          {getValue()}
        </Badge>
      ),
    },
    {
      header: "Reference",
      accessorKey: "reference_no",
      cell: ({ getValue }) => getValue() || "-",
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
              navigate(`/dashboard/payments/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === "PENDING" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-indigo-600"
              onClick={() => {
                navigate(`/dashboard/payments/${row.original.id}`);
              }}
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          )}
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
      id: "method",
      label: "Method",
      type: "select",
      options: [
        { label: "Cash", value: "CASH" },
        { label: "Online", value: "ONLINE" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Rejected", value: "REJECTED" },
        { label: "Voided", value: "VOIDED" },
      ],
    },
    {
      id: "startDate",
      label: "From Date",
      type: "date",
    },
    {
      id: "endDate",
      label: "To Date",
      type: "date",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-500">Track and manage membership payments</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/dashboard/payments/new");
          }}
        >
          <Plus className="h-4 w-4" /> Record Payment
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
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        message={
          paymentToDelete
            ? `Are you sure you want to delete the payment of ${paymentToDelete.amount} ${paymentToDelete.currency} from ${paymentToDelete.first_name} ${paymentToDelete.last_name}?`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
