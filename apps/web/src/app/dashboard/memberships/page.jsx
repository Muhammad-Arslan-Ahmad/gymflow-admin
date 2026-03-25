import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";

export default function MembershipsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [deleteSubModalOpen, setDeleteSubModalOpen] = useState(false);
  const [deletePlanModalOpen, setDeletePlanModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const response = await fetch("/api/memberships/plans");
      return response.json();
    },
  });

  const { data: subs, isLoading: isSubsLoading } = useQuery({
    queryKey: [
      "memberships-subscriptions",
      pageIndex,
      pageSize,
      searchQuery,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex,
        limit: pageSize,
        search: searchQuery,
        ...filters,
      });
      const response = await fetch(`/api/memberships/subscriptions?${params}`);
      return response.json();
    },
    enabled: activeTab === "subscriptions",
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/memberships/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["memberships-subscriptions"]);
      setDeleteSubModalOpen(false);
      setSubscriptionToDelete(null);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/memberships/plans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-plans"]);
      setDeletePlanModalOpen(false);
      setPlanToDelete(null);
    },
  });

  const handleDeleteSubscriptionClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setDeleteSubModalOpen(true);
  };

  const handleDeletePlanClick = (plan) => {
    setPlanToDelete(plan);
    setDeletePlanModalOpen(true);
  };

  const handleDeleteSubscriptionConfirm = () => {
    if (subscriptionToDelete) {
      deleteSubscriptionMutation.mutate(subscriptionToDelete.id);
    }
  };

  const handleDeletePlanConfirm = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete.id);
    }
  };

  const subColumns = [
    {
      id: "member",
      header: "Member",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      header: "Plan",
      accessorKey: "plan_name",
    },
    {
      header: "Start Date",
      accessorKey: "start_date",
    },
    {
      header: "End Date",
      accessorKey: "end_date",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge
          variant={
            getValue() === "ACTIVE"
              ? "success"
              : getValue() === "EXPIRED"
                ? "danger"
                : "warning"
          }
        >
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
              navigate(`/dashboard/memberships/subscriptions/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => {
              navigate(`/dashboard/memberships/subscriptions/${row.original.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700"
            onClick={() => handleDeleteSubscriptionClick(row.original)}
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
          <h2 className="text-2xl font-bold text-gray-900">Memberships</h2>
          <p className="text-gray-500">Manage plans and member subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
              navigate("/dashboard/memberships/plans/new");
            }}
          >
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              navigate("/dashboard/memberships/subscriptions/new");
            }}
          >
            <Plus className="h-4 w-4" /> Assign Membership
          </Button>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`${activeTab === "subscriptions" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`${activeTab === "plans" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Plans
          </button>
        </nav>
      </div>

      {activeTab === "subscriptions" ? (
        <DataTable
          columns={subColumns}
          data={subs?.data || []}
          totalCount={subs?.totalCount || 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          isLoading={isSubsLoading}
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
                { label: "Expired", value: "EXPIRED" },
                { label: "Frozen", value: "FROZEN" },
              ],
            },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border rounded-lg p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <Badge
                  variant={plan.status === "ACTIVE" ? "success" : "default"}
                >
                  {plan.status}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm">
                {plan.description || "No description provided."}
              </p>
              <div className="text-3xl font-bold text-indigo-600">
                {plan.price}{" "}
                <span className="text-sm font-normal text-gray-400">PKR</span>
              </div>
              <div className="text-sm text-gray-600">
                Duration: {plan.duration_value} {plan.duration_unit}
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(`/dashboard/memberships/plans/${plan.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePlanClick(plan)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {plans?.length === 0 && (
            <p className="col-span-full text-center py-12 text-gray-500">
              No plans created yet.
            </p>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteSubModalOpen}
        onClose={() => {
          setDeleteSubModalOpen(false);
          setSubscriptionToDelete(null);
        }}
        onConfirm={handleDeleteSubscriptionConfirm}
        title="Delete Subscription"
        message={
          subscriptionToDelete
            ? `Are you sure you want to delete the subscription for ${subscriptionToDelete.first_name} ${subscriptionToDelete.last_name}?`
            : ""
        }
        confirmText="Delete"
        isLoading={deleteSubscriptionMutation.isPending}
      />

      <ConfirmationModal
        isOpen={deletePlanModalOpen}
        onClose={() => {
          setDeletePlanModalOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleDeletePlanConfirm}
        title="Delete Plan"
        message={
          planToDelete
            ? `Are you sure you want to delete the plan "${planToDelete.name}"? This may affect existing subscriptions.`
            : ""
        }
        confirmText="Delete"
        isLoading={deletePlanMutation.isPending}
      />
    </div>
  );
}
