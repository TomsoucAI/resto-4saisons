const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatHeure(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

// schedule: array of 7 { ouvert, ferme } (string|null), index 0 = dimanche
export function computeStatus(weekday, minutes, schedule) {
  const today = schedule[weekday];
  if (today && today.ouvert && today.ferme) {
    const open = toMinutes(today.ouvert);
    const close = toMinutes(today.ferme);
    if (minutes >= open && minutes < close) {
      return { open: true, label: `Ouvert · ferme à ${formatHeure(today.ferme)}` };
    }
    if (minutes < open) {
      return { open: false, label: `Fermé · ouvre à ${formatHeure(today.ouvert)}` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (weekday + i) % 7;
    const day = schedule[d];
    if (day && day.ouvert && day.ferme) {
      const quand = i === 1 ? 'demain' : JOURS[d];
      return { open: false, label: `Fermé · ouvre ${quand} à ${formatHeure(day.ouvert)}` };
    }
  }
  return { open: false, label: 'Fermé' };
}

export function nowInToronto(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = map[parts.weekday];
  const hour = parseInt(parts.hour, 10) % 24;
  const minutes = hour * 60 + parseInt(parts.minute, 10);
  return { weekday, minutes };
}

export function getStatus(schedule, date = new Date()) {
  const { weekday, minutes } = nowInToronto(date);
  return computeStatus(weekday, minutes, schedule);
}
