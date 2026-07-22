'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="px-4 pb-6">
      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <h2 className="font-display text-lg font-bold text-foreground mb-2">Stay Updated</h2>
        <p className="text-sm text-muted-foreground mb-4">Get exclusive deals & new arrivals</p>
        {submitted ? (
          <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-semibold text-green-700">✓ Subscribed!</p>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
