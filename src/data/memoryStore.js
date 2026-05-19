import { randomUUID } from 'node:crypto';

export function createMemoryStore() {
  const usersByEmail = new Map();
  const usersById = new Map();

  return {
    async createUser(input) {
      const normalizedEmail = input.email.toLowerCase();
      if (usersByEmail.has(normalizedEmail)) {
        const error = new Error('Email is already registered.');
        error.code = 'DUPLICATE_EMAIL';
        throw error;
      }

      const now = new Date().toISOString();
      const user = {
        id: randomUUID(),
        email: normalizedEmail,
        passwordHash: input.passwordHash,
        role: input.role,
        displayName: input.displayName,
        gradeLevel: input.gradeLevel ?? null,
        schoolId: input.schoolId ?? null,
        consentStatus: input.consentStatus ?? 'n/a',
        createdAt: now,
        updatedAt: now,
      };

      usersByEmail.set(normalizedEmail, user);
      usersById.set(user.id, user);
      return user;
    },

    async findUserByEmail(email) {
      return usersByEmail.get(email.toLowerCase()) || null;
    },

    async findUserById(id) {
      return usersById.get(id) || null;
    },
  };
}
