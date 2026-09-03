import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { decide, POLICIES } from "@/lib/abuse/limiter";
import { challengePrefix, verifyPow, POW_DIFFICULTY } from "@/lib/abuse/challenge";

describe("sliding-window decision (F16)", () => {
  const p = POLICIES.anon_create; // soft 3, hard 12

  it("a first-time / legitimate user is allowed with no challenge", () => {
    expect(decide(p, 0).verdict).toBe("allow");
    expect(decide(p, 2).verdict).toBe("allow");
  });
  it("crossing the soft threshold triggers a challenge", () => {
    expect(decide(p, 3).verdict).toBe("challenge");
    expect(decide(p, 11).verdict).toBe("challenge");
  });
  it("crossing the hard threshold blocks with a retry-after", () => {
    const d = decide(p, 12);
    expect(d.verdict).toBe("block");
    if (d.verdict === "block") expect(d.retryAfterMs).toBeGreaterThan(0);
  });
});

describe("proof-of-work challenge", () => {
  it("verifies a nonce found by plain SHA-256 brute force; rejects wrong / forged / stale", () => {
    const scope = "anon_create:1.2.3.4:-";
    const prefix = challengePrefix(scope);

    let nonce = "";
    for (let i = 0; i < 5_000_000; i++) {
      const c = i.toString(36);
      if (
        createHash("sha256")
          .update(`${prefix}:${c}`)
          .digest("hex")
          .startsWith("0".repeat(POW_DIFFICULTY))
      ) {
        nonce = c;
        break;
      }
    }
    expect(nonce, "PoW nonce should be found quickly at difficulty 4").not.toBe("");

    expect(verifyPow(scope, prefix, nonce)).toBe(true);
    expect(verifyPow(scope, prefix, "wrong")).toBe(false);
    expect(verifyPow("different:scope", prefix, nonce)).toBe(false); // prefix bound to its scope
    expect(verifyPow(scope, "999999999.deadbeef", nonce)).toBe(false); // forged prefix
    expect(verifyPow(scope, prefix, "x".repeat(100))).toBe(false);
  });
});
