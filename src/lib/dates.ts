function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayLocal(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function yesterdayLocal(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return todayLocal(d);
}

export function isBeforeYesterday(date: string | null, now: Date = new Date()): boolean {
  if (!date) return true;
  return date < yesterdayLocal(now);
}
