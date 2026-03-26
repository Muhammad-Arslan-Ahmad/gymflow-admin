"use client";

import useAuth from "@/utils/useAuth";
import { useEffect } from "react";
import { Loader2, Dumbbell } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  }, [signOut]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600">GymFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            Signing you out
          </h1>
          <p className="text-sm text-gray-500">
            You'll be redirected shortly
          </p>
        </div>
      </div>
    </div>
  );
}
