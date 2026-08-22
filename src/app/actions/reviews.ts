// src/app/actions/reviews.ts — Server Actions for Product Reviews
'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

export async function createReview(formData: FormData) {
  const session = await getSession();
  
  if (!session?.userId) {
    return { success: false, error: 'Vous devez être connecté pour laisser un avis' };
  }

  const productId = formData.get('productId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;

  if (!productId || !rating || !body) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires' };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'La note doit être entre 1 et 5' };
  }

  try {
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Check if user already reviewed this product
    const existingReview = await sql`
      SELECT id FROM reviews 
      WHERE product_id = ${productId}::uuid AND user_id = ${session.userId}::uuid
      LIMIT 1
    `;

    if (existingReview.length > 0) {
      return { success: false, error: 'Vous avez déjà laissé un avis pour ce produit' };
    }

    // Create the review
    const review = await sql`
      INSERT INTO reviews (product_id, user_id, rating, title, body, verified_purchase, created_at, updated_at, images)
      VALUES (${productId}::uuid, ${session.userId}::uuid, ${rating}, ${title || null}, ${body}, false, NOW(), NOW(), '{}')
      RETURNING *
    `;

    // Update product rating
    const allReviews = await sql`
      SELECT rating FROM reviews WHERE product_id = ${productId}::uuid
    `;

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      : 0;
    
    await sql`
      UPDATE products 
      SET rating = ${avgRating} 
      WHERE id = ${productId}::uuid
    `;

    // Revalidate the product page
    revalidatePath(`/products/${productId}`);

    return { success: true, review: review[0] };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error: 'Une erreur est survenue lors de la création de l\'avis' };
  }
}

export async function markReviewHelpful(reviewId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' };
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const review = await sql`
      UPDATE reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = ${reviewId}::uuid
      RETURNING helpful_count
    `;

    return { success: true, helpfulCount: review[0].helpful_count };
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

export async function deleteReview(reviewId: string) {
  const session = await getSession();
  
  if (!session?.userId) {
    return { success: false, error: 'Vous devez être connecté' };
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const review = await sql`
      SELECT * FROM reviews WHERE id = ${reviewId}::uuid LIMIT 1
    `;

    if (review.length === 0) {
      return { success: false, error: 'Avis non trouvé' };
    }

    if (review[0].user_id !== session.userId) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à supprimer cet avis' };
    }

    const productId = review[0].product_id;

    await sql`
      DELETE FROM reviews WHERE id = ${reviewId}::uuid
    `;

    // Update product rating
    const allReviews = await sql`
      SELECT rating FROM reviews WHERE product_id = ${productId}::uuid
    `;

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      : 0;
    
    await sql`
      UPDATE products 
      SET rating = ${avgRating} 
      WHERE id = ${productId}::uuid
    `;

    revalidatePath(`/products/${productId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}