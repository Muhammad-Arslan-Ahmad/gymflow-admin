import { cn } from "@/utils/cn";

export function Card({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white border rounded-lg shadow-sm overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
}) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="p-3 bg-indigo-50 rounded-full mr-4">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded",
                  trend === "up"
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100",
                )}
              >
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
