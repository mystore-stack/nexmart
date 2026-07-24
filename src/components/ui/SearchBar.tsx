import React from 'react';

export const SearchBar: React.FC<{
  placeholder?: string;
  onSearch?: (q: string) => void;
}> = ({ placeholder = 'Search products, brands, categories...', onSearch }) => {
  const [q, setQ] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(q.trim());
  };

  return (
    <form onSubmit={submit} role="search" className="w-full max-w-xl">
      <label htmlFor="site-search" className="sr-only">Search</label>
      <div className="relative">
        <input
          id="site-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-[var(--color-muted)] px-4 py-2 bg-[var(--color-surface)] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          aria-label="Search"
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-sm bg-[var(--color-accent)] text-white"
        >
          Go
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
