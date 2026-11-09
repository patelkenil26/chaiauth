import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, BCRYPT_COST);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

let dummyHash: Promise<string> | undefined;

/**
 * Burns the same CPU time as a real password check. Call when the account does not exist so
 * response time cannot be used to tell "unknown user" from "wrong password" (user enumeration).
 */
export const burnPasswordCheck = async (plain: string): Promise<void> => {
  dummyHash ??= hashPassword("chaiauth-timing-equaliser");
  await bcrypt.compare(plain, await dummyHash);
};
