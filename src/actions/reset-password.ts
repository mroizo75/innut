"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const resetPassword = async (token: string, password: string) => {
    const user = await db.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() },
        },
    });

    if (!user) {
        return { error: "Token er ugyldig eller utløpt" }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        }
    });

    return { success: "Passord er oppdatert" }
}