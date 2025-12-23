type LogMeta = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

type Logger = {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
};

function format(message: string, meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) {
    return message;
  }
  return `${message} ${JSON.stringify(meta)}`;
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
  const payload = format(message, meta);
  if (level === "error") {
    console.error(payload);
    return;
  }
  if (level === "warn") {
    console.warn(payload);
    return;
  }
  console.log(payload);
}

export const logger: Logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta)
};
