/**
 * Recursively map MongoDB _id to id (string) for API responses.
 * Handles plain objects from .lean() and nested populated docs.
 */
export function toResponse(doc) {
  if (doc == null) return doc;
  if (Array.isArray(doc)) return doc.map(toResponse);
  if (typeof doc !== "object") return doc;
  if (doc instanceof Date) return doc;
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k === "_id") {
      out.id = v?.toString?.() ?? v;
    } else {
      out[k] = toResponse(v);
    }
  }
  return out;
}
