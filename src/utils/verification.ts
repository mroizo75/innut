import { db } from "@/lib/db"
import { sendEmail } from '@/lib/mail';

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const saveVerificationCode = async (email: string, code: string) => {
    await db.verificationCode.create({
        data: {
            email,
            code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutter
        }
    })
}

export const verifyCode = async (email: string, code: string) => {
    const storedCode = await db.verificationCode.findFirst({
        where: {
            email,
            code,
            expiresAt: { gt: new Date() }
        }
    })
    return !!storedCode
}

export const sendVerificationCode = async (email: string) => {
    const code = generateVerificationCode();
    await saveVerificationCode(email, code);
    await sendEmail(
        email,
        "Verifiseringskode for registrering",
        `<p>Din verifiseringskode er: <strong>${code}</strong></p>`
    );
    return { success: true, message: "Verifiseringskode sendt" };
};
