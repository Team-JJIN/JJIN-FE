/** 페이지 경계가 밀려 같은 항목이 두 페이지에 걸쳐 오면 id 기준으로 첫 등장만 남긴다 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
