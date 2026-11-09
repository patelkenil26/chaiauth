import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, BCRYPT_COST);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
