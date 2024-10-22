import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { getVerificationTokenByEmail } from '@/data/verification-token';

export const generateVerificationToken = async(email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    
    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return {
      email, // Legg til denne linjen
      token,
      expires,
    };
  }

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
  
    const existingUser = await db.user.findUnique({
      where: { email }
    });
  
    if (!existingUser) {
      throw new Error("Ingen bruker funnet med denne e-postadressen");
    }
  
    await db.user.update({
      where: { id: existingUser.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  
    return { email, token };
  };

export const renewToken = async (userId: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dager

  await db.user.update({
    where: { id: userId },
    data: {
      sessionToken: token,
      sessionExpires: expires,
    },
  });

  return { token, expires };
};
