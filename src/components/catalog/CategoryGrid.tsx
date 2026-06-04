import Link from "next/link";
import Image from "next/image";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  _count?: { products: number };
};

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">Aucune catégorie disponible pour le moment.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-300 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div className="relative aspect-[4/3] bg-muted">
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-display font-bold text-muted-foreground/30">
                {cat.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="font-semibold group-hover:text-brand-600 transition-colors">{cat.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {cat._count?.products ?? 0} produit{(cat._count?.products ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
