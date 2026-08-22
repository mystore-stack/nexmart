export default function Loading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container-main py-12 max-w-3xl">
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
