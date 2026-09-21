import { describe, it, expect } from 'vitest';
import menu from './menu.json';

describe('menu.json', () => {
  it('has 14 categories', () => {
    expect(menu.categories).toHaveLength(14);
  });

  it('has 95 items total', () => {
    const total = menu.categories.reduce((n, c) => n + c.items.length, 0);
    expect(total).toBe(95);
  });

  it('every multi-size item has one price per column', () => {
    for (const cat of menu.categories) {
      if (!cat.columns) continue;
      for (const item of cat.items) {
        expect(item.prices).toHaveLength(cat.columns.length);
      }
    }
  });

  it('every simple item has a price string', () => {
    for (const cat of menu.categories) {
      if (cat.columns) continue;
      for (const item of cat.items) {
        expect(typeof item.price).toBe('string');
      }
    }
  });

  it('spot-checks known prices', () => {
    const pizza = menu.categories.find((c) => c.id === 'pizza');
    const fromage = pizza.items.find((i) => i.nom === 'Fromage');
    expect(fromage.prices).toEqual(['11,50', '13,40', '19,50', '24,25', '28,00']);
  });
});
