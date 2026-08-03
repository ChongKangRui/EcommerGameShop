import { createHash } from "crypto";

// used for advisory lock in checkout service
export function useridToLockKey(userId: string): bigint {
  const hash = createHash("sha256").update(userId).digest();
  return hash.readBigInt64BE(0);
}