export function arrayToInput(value?: string[]) {
  if (!Array.isArray(value)) return "";
  return value.join(", ");
}

export function inputToArray(value: string): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeSteps(value: any) {
  if (!Array.isArray(value)) return [];

  return value.map((step) => ({
    text: String(step.text || ""),
  }));
}
