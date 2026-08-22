import Link from "next/link";

type StaticPageProps = {
  title: string;
  children: React.ReactNode;
};

export function StaticPage({ title, children }: StaticPageProps) {
  return (
    <div className="container-main section max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
        {children}
      </div>
      <p className="mt-10">
        <Link href="/" className="text-primary hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
