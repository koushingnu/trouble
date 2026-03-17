/**
 * ユーザーIDから自社通番を生成する
 * フォーマット: mm0000000 (mmと7桁数字)
 * 例: id=1 -> mm0000001, id=123 -> mm0000123
 */
export function generateCompanySerialNumber(userId: number): string {
  const paddedId = userId.toString().padStart(7, '0');
  return `mm${paddedId}`;
}

/**
 * 自社通番からユーザーIDを抽出する
 * 例: mm0000001 -> 1, mm0000123 -> 123
 */
export function extractUserIdFromSerialNumber(serialNumber: string): number | null {
  if (!serialNumber || !serialNumber.startsWith('mm')) {
    return null;
  }
  const idStr = serialNumber.substring(2);
  const id = parseInt(idStr, 10);
  return isNaN(id) ? null : id;
}
