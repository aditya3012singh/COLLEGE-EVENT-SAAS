/**
 * Environment Variable Validator
 * Validates all required environment variables on startup
 * Fails fast with clear error messages
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV',
];

const optionalEnvVars = {
  JWT_EXPIRES_IN: '1h',
  BCRYPT_ROUNDS: '12',
  PORT: '3000',
  FRONTEND_ORIGIN: 'http://localhost:5173',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
};

/**
 * Validate environment variables
 * Throws error if required vars are missing
 */
export const validateEnv = () => {
  const missing = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

/**
 * Get environment variable with fallback
 */
export const getEnv = (key, defaultValue = undefined) => {
  return process.env[key] ?? defaultValue;
};

/**
 * Get all env config
 */
export const getEnvConfig = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    databaseUrl: process.env.DATABASE_URL,
  };
};

export default { validateEnv, getEnv, getEnvConfig };
