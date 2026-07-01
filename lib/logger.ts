const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => isDev && console.log("[CC]", ...args),
  info: (...args: unknown[]) => isDev && console.info("[CC]", ...args),
  warn: (...args: unknown[]) => console.warn("[CC]", ...args),
  error: (...args: unknown[]) => console.error("[CC]", ...args),
};
