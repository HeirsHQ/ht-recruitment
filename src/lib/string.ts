export function getInitials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const fromKebabCase = (str?: string) => {
  if (!str) return "";
  return str.replace(/-/g, " ");
};

export const fromPascalCase = (str?: string) => {
  if (!str) return "";
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
};

export const fromCamelCase = (str?: string) => {
  if (!str) return "";
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
};

export const fromSnakeCase = (str?: string) => {
  if (!str) return "";
  return str.replace(/_/g, " ");
};

export const toKebabCase = (str?: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/ /g, "-");
};

export const toPascalCase = (str?: string) => {
  if (!str) return "";
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/ /g, "")
    .replace(/^./, (str) => str.toUpperCase());
};

export const toCamelCase = (str?: string) => {
  if (!str) return "";
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/ /g, "")
    .replace(/^./, (str) => str.toLowerCase());
};

export const toSnakeCase = (str?: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/ /g, "_");
};
