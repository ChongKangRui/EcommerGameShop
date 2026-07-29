import bcrypt from "bcrypt";

export const passwordHelper = {
  async hash(password: string): Promise<string> {
    const peppered = password + process.env.PEPPER;
    return bcrypt.hash(peppered, 12);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    const peppered = password + process.env.PEPPER;
    return bcrypt.compare(peppered, hash);
  },
};