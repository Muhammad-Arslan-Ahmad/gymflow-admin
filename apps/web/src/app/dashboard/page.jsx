import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, CreditCard, Trophy, UserCheck } from "lucide-react";
import { StatCard, Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const { stats, recentMembers, recentPayments } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          icon={Users}
          description="Active members"
        />
        <StatCard
          label="Active Plans"
          value={stats.activeSubscriptions}
          icon={Trophy}
          description="Current subscriptions"
        />
        <StatCard
          label="Today's Revenue"
          value={`${stats.revenueToday.toLocaleString()} PKR`}
          icon={CreditCard}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          label="Checked In"
          value={stats.currentlyCheckedIn}
          icon={UserCheck}
          description="Currently in gym"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Recent Members" subtitle="Latest signups" />
          <CardContent>
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.phone}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={member.status === "ACTIVE" ? "success" : "warning"}
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
              {recentMembers.length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  No recent members
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent Payments" subtitle="Latest transactions" />
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {payment.first_name} {payment.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(payment.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {payment.amount} {payment.currency}
                    </div>
                    <Badge
                      variant={
                        payment.status === "CONFIRMED" ? "success" : "warning"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  No recent payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
