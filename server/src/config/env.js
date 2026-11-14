import 'dotenv/config';

const required = ['JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  throw new Error(`Faltan variables obligatorias en server/.env: ${missing.join(', ')}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres. Genera una clave aleatoria antes de iniciar.');
}

const integer = (name, fallback, min, max) => {
  const parsed = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} debe ser un entero entre ${min} y ${max}.`);
  }
  return parsed;
};

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: integer('PORT', 4000, 1, 65535),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  bcryptRounds: integer('BCRYPT_ROUNDS', 12, 10, 14),
  loginMaxAttempts: integer('LOGIN_MAX_ATTEMPTS', 5, 1, 20),
  loginLockMinutes: integer('LOGIN_LOCK_MINUTES', 15, 1, 1440),
  maxUploadMb: integer('MAX_UPLOAD_MB', 10, 1, 50),
  db: {
    host: process.env.DB_HOST,
    port: integer('DB_PORT', 3306, 1, 65535),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  },
});
