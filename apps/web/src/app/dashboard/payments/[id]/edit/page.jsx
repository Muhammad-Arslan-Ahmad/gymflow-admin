"use client";

import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronLeft, Upload } from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function EditPaymentPage({ params }) {
  const navigate = useNavigate();
  const paymentId = params.id;
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm();

  const paymentMethod = watch("method");

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const response = await fetch(`/api/payments/${paymentId}`);
      if (!response.ok) throw new Error("Failed to fetch payment");
      return response.json();
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members-select"],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: staff } = useQuery({
    queryKey: ["staff-select"],
    queryFn: async () => {
      const res = await fetch("/api/staff?limit=100");
      if (!res.ok) throw new Error("Failed to fetch staff");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (payment) {
      reset({
        memberId: payment.member_id,
        amount: payment.amount,
        currency: payment.currency || "PKR",
        method: payment.method,
        status: payment.status,
        receiptUrl: payment.receipt_url || "",
        referenceNo: payment.reference_no || "",
        receivedByStaffId: payment.received_by_staff_id || "",
        notes: payment.notes || "",
      });
    }
  }, [payment, reset]);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({ file });
      setValue("receiptUrl", result.url);
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload receipt");
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        memberId: parseInt(data.memberId),
        amount: parseFloat(data.amount),
        currency: data.currency,
        method: data.method,
        status: data.status,
        receiptUrl: data.receiptUrl || null,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        receivedByStaffId: data.receivedByStaffId
          ? parseInt(data.receivedByStaffId)
          : null,
      };

      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
      navigate(`/dashboard/payments/${paymentId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
        <button
          onClick={() => navigate(`/dashboard/payments/${paymentId}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Payment</h2>
      </div>

      <Card>
        <CardHeader
          title="Payment Details"
          subtitle="Update payment transaction information"
        />
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Member *
              </label>
              <select
                {...register("memberId", { required: "Member is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Member</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} - {m.phone}
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p className="text-xs text-red-600">
                  {errors.memberId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be positive" },
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-red-600">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  {...register("currency")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Payment Method *
                </label>
                <select
                  {...register("method", { required: "Method is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Receipt {paymentMethod === "ONLINE" ? "*" : "(Optional)"}
              </label>
              <input
                type="hidden"
                {...register("receiptUrl", {
                  required:
                    paymentMethod === "ONLINE"
                      ? "Receipt is required for online payments"
                      : false,
                })}
              />
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">
                        {uploading
                          ? "Uploading..."
                          : watch("receiptUrl")
                            ? "Click to replace receipt"
                            : "Click to upload receipt"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {watch("receiptUrl") && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-600">✓ Receipt uploaded</p>
                  <a
                    href={watch("receiptUrl")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              )}
              {errors.receiptUrl && (
                <p className="text-xs text-red-600">
                  {errors.receiptUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <input
                {...register("referenceNo")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Transaction ID or reference"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Received By (Staff)
              </label>
              <select
                {...register("receivedByStaffId")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">None</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional notes..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  navigate(`/dashboard/payments/${paymentId}`);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting || uploading}>
                Update Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
