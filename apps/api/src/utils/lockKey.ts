import { createHash } from "crypto";

export function useridToLockKey(userId: string): bigint {
  const hash = createHash("sha256").update(userId).digest();
  return hash.readBigInt64BE(0);
}