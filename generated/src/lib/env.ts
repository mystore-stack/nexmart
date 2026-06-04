type EnvOptions = {
  minLength?: number;
  devFallback?: string;
};

export function getRequiredEnv(name: string, options: EnvOptions = {}) {
  const value = process.env[name]?.trim().replace(/^['"]|['"]$/g, "");
  const isProduction = process.env.NODE_ENV === "production";

  if (!value) {
    if (!isProduction && options.devFallback) return options.devFallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (options.minLength && value.length < options.minLength) {
    throw new Error(
      `Environment variable ${name} must be at least ${options.minLength} characters.`
    );
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name]?.trim().replace(/^['"]|['"]$/g, "") || undefined;
}
