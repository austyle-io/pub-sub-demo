import bcrypt from "bcrypt";

// Use fewer salt rounds in test environment for faster tests
// 12 rounds for production (secure), 4 rounds for testing (fast)
const SALT_ROUNDS = process.env["NODE_ENV"] === "test" ? 4 : 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
