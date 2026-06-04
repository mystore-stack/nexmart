export default function CategoriesLoading() {
  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-8">
          <div className="skeleton h-8 w-48 rounded mb-2" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
      </div>
      <div className="container-main section grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
