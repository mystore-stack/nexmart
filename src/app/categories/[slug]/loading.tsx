export default function CategoryLoading() {
  return (
    <div className="page-enter">
      <div className="skeleton h-32 w-full" />
      <div className="container-main py-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
