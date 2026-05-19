import { hashPassword, verifyPassword } from './passwordService.js';
import { createToken, verifyToken } from './tokenService.js';

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['student', 'teacher']);

function publicUser(user) {
  return {
    id: user.id,
    role: user.role,
    displayName: user.displayName,
    gradeLevel: user.gradeLevel,
  };
}

function createTokenPair(user, jwtSecret) {
  return {
    accessToken: createToken({ sub: user.id, role: user.role, type: 'access' }, jwtSecret, ACCESS_TOKEN_SECONDS),
    refreshToken: createToken({ sub: user.id, role: user.role, type: 'refresh' }, jwtSecret, REFRESH_TOKEN_SECONDS),
  };
}

export function validateSignup(input) {
  const errors = {};

  if (!EMAIL_PATTERN.test(input.email || '')) {
    errors.email = 'A valid email is required.';
  }

  if (!input.password || input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!VALID_ROLES.has(input.role)) {
    errors.role = 'Role must be student or teacher.';
  }

  if (!input.displayName || input.displayName.trim().length < 1) {
    errors.displayName = 'Display name is required.';
  }

  if (input.gradeLevel !== undefined && input.gradeLevel !== null) {
    const grade = Number(input.gradeLevel);
    if (!Number.isInteger(grade) || grade < 1 || grade > 12) {
      errors.gradeLevel = 'Grade level must be an integer from 1 to 12.';
    }
  }

  return errors;
}

export function validateLogin(input) {
  const errors = {};
  if (!EMAIL_PATTERN.test(input.email || '')) {
    errors.email = 'A valid email is required.';
  }
  if (!input.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export function createAuthService({ store, jwtSecret }) {
  return {
    async signup(input) {
      const errors = validateSignup(input);
      if (Object.keys(errors).length > 0) {
        const error = new Error('Invalid signup request.');
        error.code = 'VALIDATION_ERROR';
        error.details = errors;
        throw error;
      }

      const user = await store.createUser({
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: input.role,
        displayName: input.displayName.trim(),
        gradeLevel: input.gradeLevel ?? null,
        schoolId: input.schoolId ?? null,
        consentStatus: input.role === 'student' ? 'required' : 'n/a',
      });

      return { user: publicUser(user), tokens: createTokenPair(user, jwtSecret) };
    },

    async login(input) {
      const errors = validateLogin(input);
      if (Object.keys(errors).length > 0) {
        const error = new Error('Invalid login request.');
        error.code = 'VALIDATION_ERROR';
        error.details = errors;
        throw error;
      }

      const user = await store.findUserByEmail(input.email);
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        const error = new Error('Invalid email or password.');
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }

      return { user: publicUser(user), tokens: createTokenPair(user, jwtSecret) };
    },

    async refresh(refreshToken) {
      const claims = verifyToken(refreshToken, jwtSecret);
      if (!claims || claims.type !== 'refresh') {
        const error = new Error('Invalid refresh token.');
        error.code = 'INVALID_REFRESH_TOKEN';
        throw error;
      }

      const user = await store.findUserById(claims.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.code = 'INVALID_REFRESH_TOKEN';
        throw error;
      }

      return { user: publicUser(user), tokens: createTokenPair(user, jwtSecret) };
    },
  };
}
