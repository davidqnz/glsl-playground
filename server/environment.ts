import dotenv from "dotenv";
dotenv.config();

type EnvironmentEntry<T> = { key: string; value: T };
type RawEnvironmentEntry = EnvironmentEntry<string | undefined>;

function load(key: string): RawEnvironmentEntry {
  let resolvedKey = key;
  if (process.env.NODE_ENV === "test" && process.env[`TEST_${key}`]) {
    resolvedKey = `TEST_${key}`;
  }
  return { key, value: process.env[resolvedKey] };
}

function parseInteger({ key, value }: RawEnvironmentEntry): EnvironmentEntry<number | undefined> {
  if (!value) return { key, value: undefined };

  const parsed = Number.parseInt(value);
  if (Number.isNaN(parsed)) return { key, value: undefined };

  return { key, value: parsed };
}

function parseBoolean({ key, value }: RawEnvironmentEntry): EnvironmentEntry<boolean | undefined> {
  if (!value) return { key, value: undefined };

  let parsed: boolean | undefined = undefined;
  if (value.toLowerCase() === "true" || value === "1") {
    parsed = true;
  } else if (value.toLowerCase() === "false" || value === "0") {
    parsed = false;
  }

  if (parsed === undefined) return { key, value: undefined };

  return { key, value: parsed };
}

function fallback<T>(
  { key, value }: EnvironmentEntry<T>,
  fallbackValue: NonNullable<T>,
): EnvironmentEntry<NonNullable<T>> {
  if (value === null || value === undefined) {
    console.debug(`Warning: environment variable '${key}' is missing or invalid, defaulting to '${fallbackValue}'`);
    return { key, value: fallbackValue };
  }
  return { key, value };
}

function required<T>({ key, value }: EnvironmentEntry<T>): EnvironmentEntry<NonNullable<T>> {
  if (value === undefined || value === null) {
    console.error(`Error: missing required environment variable '${key}'`);
    process.exit(1);
  }
  return { key, value };
}

export default {
  PORT: fallback(parseInteger(load("PORT")), 7890).value,
  SESSION_COOKIE: fallback(load("SESSION_COOKIE"), "session").value,
  JWT_SECRET: required(load("JWT_SECRET")).value,
  SALT_ROUNDS: fallback(parseInteger(load("SALT_ROUNDS")), 10).value,
  DATABASE_URL: required(load("DATABASE_URL")).value,
  PGSSLMODE: fallback(parseBoolean(load("PGSSLMODE")), false).value,
};
