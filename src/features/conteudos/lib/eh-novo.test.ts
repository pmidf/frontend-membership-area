import { describe, expect, it } from "vitest";

import { ehNovo } from "./eh-novo";

const agora = new Date("2026-11-20T15:00:00.000Z");

describe("ehNovo", () => {
  it.each([
    ["2026-11-20T12:00:00.000Z", true],
    ["2026-11-06T15:00:00.000Z", true],
    ["2026-11-05T15:00:00.000Z", false],
    [null, false],
  ])("para %s responde %s", (data, esperado) => {
    expect(ehNovo(data, agora)).toBe(esperado);
  });
});
