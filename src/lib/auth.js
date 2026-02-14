import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

// Prisma Role enum values as defined in prisma/schema.prisma
const ROLE_VALUES = ["RESIDENT", "COMMUNITY_LEADER"];

/**
 * Ensures the user object includes a valid role.
 * Falls back to "RESIDENT" if role is missing or invalid.
 */
function normalizeUserRole(user) {
  // Use optional chaining to guard against missing user/role
  let role = user?.role;
  if (!ROLE_VALUES.includes(role)) {
    role = "RESIDENT";
  }
  return {
    ...user,
    role,
  };
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    // Sanitize all user objects' role fields to ensure they are valid
    {
      name: "normalizeRolePlugin",
      async onUser(user) {
        return normalizeUserRole(user);
      },
    },
  ],
});