// src/components/reviews/ReviewForm.tsx — Product Review Form
'use client';

import { useState } from 'react';
import { createReview } from '@/app/actions/reviews';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewFormProps {
  productId: string;
  userId?: string;
}

export function ReviewForm({ productId, userId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('rating', rating.toString());
    formData.append('title', title);
    formData.append('body', body);

    const result = await createReview(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Votre avis a été publié avec succès !' });
      setRating(0);
      setTitle('');
      setBody('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Une erreur est survenue' });
    }

    setIsSubmitting(false);
  };

  if (!userId) {
    return (
      <div className="bg-surface rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          Vous devez être connecté pour laisser un avis.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl p-6 border border-border"
    >
      <h3 className="font-display text-xl font-semibold mb-4">Laisser un avis</h3>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? 'fill-gold-500 text-gold-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Titre (optionnel)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Résumez votre expérience"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold-500"
            maxLength={100}
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-2">
            Votre avis *
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit..."
            required
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
            minLength={10}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {body.length}/1000 caractères
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || body.length < 10}
          className="w-full py-3 px-6 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-lg font-medium hover:from-brand-800 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Publication en cours...' : 'Publier mon avis'}
        </button>
      </form>
    </motion.div>
  );
}