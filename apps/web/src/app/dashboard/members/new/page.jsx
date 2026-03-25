import React from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import ImageUploadWithWebcam from "@/components/image-upload-with-webcam";
import SignaturePad from "@/components/signature-pad";
import { useState } from "react";

export default function NewMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoUrl, setPhotoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: trainers } = useQuery({
    queryKey: ["trainers-select"],
    queryFn: async () => {
      const response = await fetch("/api/trainers?limit=100");
      if (!response.ok) throw new Error("Failed to fetch trainers");
      const json = await response.json();
      return json.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photoUrl,
          signatureUrl,
        }),
      });
      if (!response.ok) throw new Error("Failed to create member");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Member created successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      navigate("/dashboard/members");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <a
          href="/dashboard/members"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
      </div>

      <Card>
        <CardHeader
          title="Member Information"
          subtitle="Basic details for the new member"
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

            <SignaturePad
              value={signatureUrl}
              onChange={setSignatureUrl}
              label="Member Signature"
            />

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/members")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
