import React from 'react';
import Card from './Card';

export type MegaMenuItem = {
  title: string;
  href?: string;
  description?: string;
  image?: string;
};

export const MegaMenu: React.FC<{
  columns: { heading: string; items: MegaMenuItem[] }[];
}> = ({ columns }) => {
  return (
    <div className="w-full bg-transparent">
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-semibold text-[var(--color-primary)] mb-2">{col.heading}</h4>
              <ul className="space-y-2">
                {col.items.map((it) => (
                  <li key={it.title}>
                    <a href={it.href || '#'} className="block hover:underline text-[var(--color-primary)]">
                      <div className="flex items-start gap-3">
                        {it.image && <img src={it.image} alt="" className="w-12 h-12 rounded-[var(--radius-sm)] object-cover" />}
                        <div>
                          <div className="text-sm font-medium">{it.title}</div>
                          {it.description && <div className="text-xs text-[var(--color-muted)]">{it.description}</div>}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MegaMenu;
