'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, asArray } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/catalog'); // {items:[...]}
        setItems(asArray(data));
      } catch (e: any) {
        setError(e?.message || 'Ошибка загрузки каталога');
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) =>
      [p?.name, p?.sku, p?.color, p?.country].some((v: string) =>
        String(v || '').toLowerCase().includes(term)
      )
    );
  }, [items, q]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <input
          className="input flex-1"
          placeholder="Поиск по названию, артикулу, цвету…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="text-sm text-gray-500">Найдено: {filtered.length}</div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {filtered.length === 0 && <div className="text-gray-500">Ничего не найдено</div>}
      </div>
    </div>
  );
}
