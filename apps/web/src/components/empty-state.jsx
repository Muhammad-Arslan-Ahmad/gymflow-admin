export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
