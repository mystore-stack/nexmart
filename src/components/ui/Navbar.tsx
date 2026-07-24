import React from 'react';
import Link from 'next/link';
import { SearchBar } from './SearchBar';
import Button from './Button';
import MegaMenu from './MegaMenu';

export const Navbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const sampleColumns = [
    { heading: 'Women', items: [{ title: 'Dresses', href: '/c/dresses' }, { title: 'Handbags' }] },
    { heading: 'Men', items: [{ title: 'Suits' }, { title: 'Shoes' }] },
    { heading: 'Home', items: [{ title: 'Decor' }, { title: 'Furniture' }] },
    { heading: 'Brands', items: [{ title: 'Brand A' }, { title: 'Brand B' }] },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--color-surface)]/80 border-b border-[var(--color-muted)]/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="NexMart home">
            <div className="text-xl font-bold text-[var(--color-primary)]">NexMart</div>
          </Link>
          <nav aria-label="Main" className="hidden md:flex gap-2 items-center">
            <button onMouseEnter={() => setOpen(true)} onClick={() => setOpen((s) => !s)} className="px-3 py-2 rounded-md hover:bg-[var(--color-backdrop)]/6">
              Categories
            </button>
            <a href="#" className="px-3 py-2 rounded-md hover:bg-[var(--color-backdrop)]/6">Deals</a>
            <a href="#" className="px-3 py-2 rounded-md hover:bg-[var(--color-backdrop)]/6">Brands</a>
          </nav>
        </div>

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Sign in</Button>
          <Button variant="secondary">Cart (0)</Button>
        </div>
      </div>

      <div onMouseLeave={() => setOpen(false)}>{open && <div className="max-w-7xl mx-auto px-4 pb-4"><MegaMenu columns={sampleColumns} /></div>}</div>
    </header>
  );
};

export default Navbar;
