export const IMPLEMENTED_TEMPLATE_KEYS = [
  "DEVFOLIO",
  "CLASSICPRO",
  "DESIGNCASE",
  "LENSWORK",
  "MENTORHUB",
  "FREELANCERKIT",
  "STARTUPFOUNDER",
  "WRITERSDESK",
];

export function isImplementedTemplate(templateKey) {
  return IMPLEMENTED_TEMPLATE_KEYS.includes(String(templateKey || "").toUpperCase());
}
