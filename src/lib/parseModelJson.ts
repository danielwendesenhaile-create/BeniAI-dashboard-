// Claude is instructed to return raw JSON, but occasionally wraps it in a
// markdown code fence (```json ... ```) or adds surrounding prose. Strip
// that before parsing instead of letting JSON.parse throw on the backtick.
export function parseModelJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]) as T;
    throw new Error(`Model did not return valid JSON: ${text.slice(0, 200)}`);
  }
}
