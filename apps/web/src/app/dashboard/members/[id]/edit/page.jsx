import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import ImageUploadWithWebcam from "@/components/image-upload-with-webcam";
import SignaturePad from "@/components/signature-pad";

export default function EditMemberPage({ params }) {
  const navigate = useNavigate();
  const memberId = params.id;
  const queryClient = useQueryClient();
  const [photoUrl, setPhotoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", memberId],
    queryFn: async () => {
      const response = await fetch(`/api/members/${memberId}`);
      if (!response.ok) throw new Error("Failed to fetch member");
      return response.json();
    },
  });

  const { data: trainers } = useQuery({
    queryKey: ["trainers-select"],
    queryFn: async () => {
      const response = await fetch("/api/trainers?limit=100");
      if (!response.ok) throw new Error("Failed to fetch trainers");
      const json = await response.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.first_name,
        lastName: member.last_name,
        phone: member.phone,
        email: member.email || "",
        gender: member.gender || "",
        trainerId: member.trainer_id || "",
        status: member.status || "ACTIVE",
      });
      setPhotoUrl(member.photo_url || "");
      setSignatureUrl(member.signature_url || "");
    }
  }, [member, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photoUrl,
          signatureUrl,
        }),
      });
      if (!response.ok) throw new Error("Failed to update member");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member", memberId] });
      navigate(`/dashboard/members/${memberId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/dashboard/members/${memberId}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Member</h2>
      </div>

      <Card>
        <CardHeader
          title="Member Information"
          subtitle="Update member details"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ImageUploadWithWebcam
              value={photoUrl}
              onChange={setPhotoUrl}
              label="Member Photo"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+92 300 1234567"
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address (Optional)
              </label>
              <input
                {...register("email")}
                type="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Trainer (Optional)
                </label>
                <select
                  {...register("trainerId")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">No Trainer</option>
                  {trainers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register("status", { required: "Status is required" })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-600">{errors.status.message}</p>
              )}
            </div>

            <SignaturePad
              value={signatureUrl}
              onChange={setSignatureUrl}
              label="Member Signature"
            />

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`/dashboard/members/${memberId}`)
                }
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Update Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
