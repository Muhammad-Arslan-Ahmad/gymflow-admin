import { Link, useLocation, useNavigate } from "react-router";
import {
  Users,
  CalendarCheck,
  CreditCard,
  Trophy,
  UserSquare2,
  UserCog,
  Package,
  LayoutDashboard,
  LogOut,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Memberships", href: "/dashboard/memberships", icon: Trophy },
  { name: "Trainers", href: "/dashboard/trainers", icon: UserSquare2 },
  { name: "Staff", href: "/dashboard/staff", icon: UserCog },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-64 border-r bg-white h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-xl font-bold text-indigo-600">GymFlow Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-gray-500",
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={() => navigate("/account/logout")}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
