export const CONTACT_FIELDS = ["name", "email", "phone", "project", "message"];

export function readContactFields(readField) {
  return Object.fromEntries(CONTACT_FIELDS.map(field => [field, String(readField(field) || "").trim()]));
}
