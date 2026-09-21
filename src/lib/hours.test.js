import { describe, it, expect } from 'vitest';
import { toMinutes, computeStatus } from './hours.js';

const schedule = [
  { ouvert: '06:00', ferme: '19:00' }, // dim
  { ouvert: null, ferme: null },       // lun
  { ouvert: null, ferme: null },       // mar
  { ouvert: '06:00', ferme: '20:00' }, // mer
  { ouvert: '06:00', ferme: '20:00' }, // jeu
  { ouvert: '06:00', ferme: '20:00' }, // ven
  { ouvert: '06:00', ferme: '20:00' }, // sam
];

describe('toMinutes', () => {
  it('converts HH:MM to minutes', () => {
    expect(toMinutes('06:00')).toBe(360);
    expect(toMinutes('16:30')).toBe(990);
  });
});

describe('computeStatus', () => {
  it('is open during hours', () => {
    const r = computeStatus(3, 720, schedule); // mercredi 12:00
    expect(r.open).toBe(true);
    expect(r.label).toBe('Ouvert · ferme à 20 h');
  });

  it('is closed before opening, same day', () => {
    const r = computeStatus(3, 300, schedule); // mercredi 05:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre à 6 h');
  });

  it('is closed after closing, points to next day as demain', () => {
    const r = computeStatus(3, 1260, schedule); // mercredi 21:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre demain à 6 h');
  });

  it('is closed on a closed day, names the next open day', () => {
    const r = computeStatus(1, 600, schedule); // lundi 10:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre mercredi à 6 h');
  });
});
