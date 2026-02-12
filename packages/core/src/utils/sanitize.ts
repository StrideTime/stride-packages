export function sanitizeString(input: string): string {
  return (
    input
      .trim()
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
  );
}

export function sanitizeFields<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      (result as any)[key] = sanitizeString(result[key] as string);
    }
  }
  return result;
}
