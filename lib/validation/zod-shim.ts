/** Minimal zod-compatible shim to avoid adding zod dep for 3 server actions. */
type ParseFn<T> = (v: unknown) => T;

function makeSchema<T extends Record<string, unknown>>(shape: Record<string, ParseFn<unknown>>) {
  return {
    parse(v: unknown): T {
      if (typeof v !== "object" || v === null) throw new Error("Invalid input");
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(shape)) {
        out[k] = (shape[k] as ParseFn<unknown>)((v as Record<string, unknown>)[k]);
      }
      return out as T;
    },
  };
}

export const z = {
  string: (): ParseFn<string> => (v) => {
    if (typeof v !== "string") throw new Error("Expected string");
    return v;
  },
  number: (): ParseFn<number> => (v) => {
    if (typeof v !== "number" || !Number.isFinite(v)) throw new Error("Expected number");
    return v;
  },
  boolean: (): ParseFn<boolean> => (v) => {
    if (typeof v !== "boolean") throw new Error("Expected boolean");
    return v;
  },
  object: <T extends Record<string, unknown>>(shape: Record<string, ParseFn<unknown>>) =>
    makeSchema<T>(shape),
};
