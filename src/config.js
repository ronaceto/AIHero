const DEFAULT_PORT = 3000;

export function getConfig(env = process.env) {
  return {
    env: env.NODE_ENV || 'development',
    port: Number.parseInt(env.PORT || `${DEFAULT_PORT}`, 10),
    jwtSecret: env.JWT_SECRET || 'development-only-change-me',
    databaseUrl: env.DATABASE_URL || '',
  };
}
