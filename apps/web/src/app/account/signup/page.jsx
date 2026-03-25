"use client";

import { Dumbbell, ShieldAlert } from "lucide-react";
import { Link } from "react-router";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600">GymFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mx-auto w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-yellow-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Access Restricted
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            New accounts can only be created by a super admin. Please contact
            your administrator for access.
          </p>
          <Link
            to="/account/signin"
            className="inline-flex items-center justify-center w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
