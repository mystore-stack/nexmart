export function WhyNexMart() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[
        {
          title: "Artisanat marocain authentique",
          description: "Support local artisans and discover unique products from every region.",
        },
        {
          title: "Livraison rapide partout au Maroc",
          description: "Suivi en temps réel et livraison express pour toutes vos commandes.",
        },
        {
          title: "Paiement sécurisé et fiable",
          description: "Checkout sécurisé avec Stripe et protection totale de vos données.",
        },
      ].map((item) => (
        <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
