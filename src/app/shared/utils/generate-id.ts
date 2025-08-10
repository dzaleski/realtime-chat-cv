export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).slice(2, 9);
  return `${timestamp}-${randomNum}`;
}
