type Level = 'info' | 'warn' | 'error';

function emit(level: Level, event: string, data?: object) {
  const entry = JSON.stringify({ ts: new Date().toISOString(), level, event, ...data });
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else console.log(entry);
}

export const log = {
  info: (event: string, data?: object) => emit('info', event, data),
  warn: (event: string, data?: object) => emit('warn', event, data),
  error: (event: string, err?: unknown, data?: object) => {
    const errMsg = err instanceof Error ? err.message : String(err ?? '');
    emit('error', event, { error: errMsg, ...data });
  },
};
