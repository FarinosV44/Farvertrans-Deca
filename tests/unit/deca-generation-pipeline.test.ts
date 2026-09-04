import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationError } from "@/lib/deca/generation";
import { StorageError } from "@/lib/storage/errors";
import type { ValidatedDeca } from "@/lib/deca/validate";

/**
 * P0 FIX #29 — the generation pipeline must fail CLASSIFIED, fail CLOSED, and
 * never leave an orphan object behind. Each stage is failed in turn against a
 * fully mocked store/database.
 */

vi.mock("server-only", () => ({}));

const store = {
  put: vi.fn(async (_key: string, _body?: Buffer) => {}),
  get: vi.fn(async (_key: string) => Buffer.from("%PDF")),
  del: vi.fn(async (_key: string) => {}),
};

const prismaMock = {
  deca: { findUnique: vi.fn(async () => null as unknown), count: vi.fn(async () => 1) },
  $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      deca: { create: vi.fn(async () => ({ id: "deca1" })), update: vi.fn(async () => ({})) },
      decaVersion: { create: vi.fn(async () => ({ id: "ver1" })) },
      claimToken: { create: vi.fn(async () => ({})) },
    }),
  ),
};

const render = vi.fn(async () => Buffer.from("%PDF-1.4 test"));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/pdf/render", () => ({ renderDecaPdf: (...a: unknown[]) => render(...(a as [])) }));
vi.mock("@/lib/storage", async () => {
  const { pdfSha256 } = await import("@/lib/storage/hash");
  return {
    getPdfStore: () => store,
    pdfKey: (token: string) => `${token}.pdf`,
    pdfSha256,
    StorageError: (await import("@/lib/storage/errors")).StorageError,
  };
});

const validated = {
  data: {
    shipper: { name: "Cargador S.L.", nif: "B11111111", address: "Calle 1" },
    carrier: { name: "Transportes S.L.", nif: "B22222222", address: "Calle 2" },
    loadLocation: {
      name: "Almacén Madrid",
      address: "Calle 1",
      postalCode: "28001",
      city: "Madrid",
      province: "Madrid",
      country: "España",
    },
    unloadLocation: {
      name: "Almacén Valencia",
      address: "Calle 2",
      postalCode: "46001",
      city: "Valencia",
      province: "Valencia",
      country: "España",
    },
    loadDate: "2026-10-06",
    unloadDate: "2026-10-06",
    goods: "Palés",
    weight: "12.000 kg",
    tractorPlate: "1234BCD",
    trailerPlate: "",
    reference: "",
  },
  warnings: [],
} as unknown as ValidatedDeca;

async function createDeca(
  opts: Parameters<typeof import("@/lib/deca/persist").createDeca>[1] = {},
) {
  const mod = await import("@/lib/deca/persist");
  return mod.createDeca(validated, opts);
}

beforeEach(() => {
  vi.clearAllMocks();
  render.mockImplementation(async () => Buffer.from("%PDF-1.4 test"));
  store.put.mockImplementation(async () => {});
  store.del.mockImplementation(async () => {});
  prismaMock.deca.findUnique.mockImplementation(async () => null);
  prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      deca: { create: vi.fn(async () => ({ id: "deca1" })), update: vi.fn(async () => ({})) },
      decaVersion: { create: vi.fn(async () => ({ id: "ver1" })) },
      claimToken: { create: vi.fn(async () => ({})) },
    }),
  );
});

describe("createDeca — happy path", () => {
  it("returns a real id, token and PDF hash", async () => {
    const created = await createDeca();
    expect(created.decaId).toBe("deca1");
    expect(created.token).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    expect(created.pdfSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(store.put).toHaveBeenCalledTimes(1);
  });
});

describe("createDeca — a PDF render failure", () => {
  it("is classified as pdf_render and persists nothing", async () => {
    render.mockImplementation(async () => {
      throw new Error("fontkit exploded");
    });
    const e = await createDeca().catch((err) => err);
    expect(e).toBeInstanceOf(GenerationError);
    expect(e.stage).toBe("pdf_render");
    expect(e.correlationId).toMatch(/^[A-Z2-9]{6}$/);
    expect(store.put).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("createDeca — a storage failure", () => {
  it("is classified as pdf_storage and never reaches the database", async () => {
    store.put.mockImplementation(async () => {
      throw new StorageError("bucket unavailable");
    });
    const e = await createDeca().catch((err) => err);
    expect(e).toBeInstanceOf(GenerationError);
    expect(e.stage).toBe("pdf_storage");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("createDeca — a database failure after the object is stored", () => {
  it("is classified as database and cleans up the orphan object", async () => {
    prismaMock.$transaction.mockImplementation(async () => {
      throw Object.assign(new Error("Can't reach database server"), {
        name: "PrismaClientInitializationError",
      });
    });
    const e = await createDeca().catch((err) => err);
    expect(e).toBeInstanceOf(GenerationError);
    expect(e.stage).toBe("database");
    expect(store.put).toHaveBeenCalledTimes(1);
    // The exact key that was written is the one that gets removed.
    expect(store.del).toHaveBeenCalledTimes(1);
    expect(store.del.mock.calls[0][0]).toBe(store.put.mock.calls[0][0]);
  });

  it("still fails classified when the cleanup itself fails", async () => {
    prismaMock.$transaction.mockImplementation(async () => {
      throw new Error("tx aborted: database");
    });
    store.del.mockImplementation(async () => {
      throw new StorageError("delete denied");
    });
    const e = await createDeca().catch((err) => err);
    expect(e).toBeInstanceOf(GenerationError);
    expect(e.stage).toBe("database");
  });
});

describe("createDeca — retry with the same idempotency key", () => {
  it("returns the existing document instead of generating a second one", async () => {
    prismaMock.deca.findUnique.mockImplementation(async () => ({
      id: "deca1",
      versions: [{ id: "ver1", token: "tok", pdfSha256: "a".repeat(64) }],
      claimTokens: [{ token: "claim", expiresAt: new Date() }],
    }));
    const again = await createDeca({ idempotencyKey: "key-1" });
    expect(again.decaId).toBe("deca1");
    expect(again.token).toBe("tok");
    expect(render).not.toHaveBeenCalled();
    expect(store.put).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
