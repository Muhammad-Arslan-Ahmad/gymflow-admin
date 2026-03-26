"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Edit, FileText, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentShowPage({ params }) {
  const navigate = useNavigate();
  const { id } = params;
  const queryClient = useQueryClient();
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const res = await fetch(`/api/payments?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch payment");
      const json = await res.json();
      return json.data?.[0];
    },
  });

  const voidMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payments/${id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voidReason }),
      });
      if (!res.ok) throw new Error("Failed to void payment");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment voided successfully");
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowVoidModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!payment) {
    return <div className="p-8 text-center">Payment not found</div>;
  }

  const statusColors = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    VOIDED: "bg-gray-100 text-gray-800",
  };

  const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    return new Date(dt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/payments")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h2>
            <p className="text-sm text-gray-600">Transaction #{payment.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {payment.status !== "VOIDED" && (
            <Button variant="secondary" onClick={() => setShowVoidModal(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Void Payment
            </Button>
          )}
          <Button
            onClick={() => {
              navigate(`/dashboard/payments/${id}/edit`);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Payment Information" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {payment.currency} {payment.amount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                className={
                  statusColors[payment.status] || "bg-gray-100 text-gray-800"
                }
              >
                {payment.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <Badge className="bg-blue-100 text-blue-800">
                {payment.method}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reference Number</p>
              <p className="font-semibold">{payment.reference_no || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Member Details" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Member ID</p>
              <button
                onClick={() => navigate(`/dashboard/members/${payment.member_id}`)}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                #{payment.member_id}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received By Staff ID</p>
              <p className="font-semibold">
                {payment.received_by_staff_id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="font-semibold">
                {formatDateTime(payment.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        {payment.receipt_url && (
          <Card>
            <CardHeader title="Receipt" />
            <CardContent>
              <a
                href={payment.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <FileText className="h-5 w-5" />
                View Receipt
              </a>
            </CardContent>
          </Card>
        )}

        {payment.notes && (
          <Card>
            <CardHeader title="Notes" />
            <CardContent>
              <p className="text-gray-700">{payment.notes}</p>
            </CardContent>
          </Card>
        )}

        {payment.voided_at && (
          <Card className="md:col-span-2">
            <CardHeader title="Void Information" />
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Voided At</p>
                <p className="font-semibold">
                  {formatDateTime(payment.voided_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Voided By Staff ID</p>
                <p className="font-semibold">{payment.voided_by_id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Void Reason</p>
                <p className="font-semibold">{payment.void_reason || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showVoidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Void Payment
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to void this payment? This action cannot be
              undone.
            </p>
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-gray-700">
                Reason for voiding
              </label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter reason..."
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowVoidModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => voidMutation.mutate()}
                loading={voidMutation.isPending}
                disabled={!voidReason.trim()}
              >
                Void Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
