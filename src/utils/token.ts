import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export const generateVerificationToken = async (email: string) => {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // Token gyldig i 1 time

  await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return { token, expires };
};