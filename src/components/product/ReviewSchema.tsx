interface ReviewSchemaProps {
  productName: string;
  productImage: string;
  averageRating: number;
  reviewCount: number;
  reviews: Array<{
    author: string;
    rating: number;
    comment: string;
    datePublished: string;
  }>;
}

export default function ReviewSchema({
  productName,
  productImage,
  averageRating,
  reviewCount,
  reviews,
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    image: productImage,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.datePublished,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
