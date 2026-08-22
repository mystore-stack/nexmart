import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nouveautés | NexMart Maroc",
  description: "Découvrez les dernières nouveautés et sorties sur NexMart Maroc. High-Tech, Mode, Beauté - soyez les premiers à découvrir les tendances.",
  keywords: "nouveautés, new arrivals, sorties, tendances, NexMart Maroc, shopping",
};

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
