const TZ = 'Australia/Melbourne';

export function todayLocal() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

export function matchLocalDate(utcDate) {
  return new Date(utcDate).toLocaleDateString('en-CA', { timeZone: TZ });
}

export function formatKickoffLocal(utcDate) {
  if (!utcDate) return '--:--';
  return new Date(utcDate).toLocaleTimeString('en-AU', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
