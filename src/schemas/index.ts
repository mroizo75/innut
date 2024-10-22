import * as z from "zod"

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Ugyldig epost",
    }),
    password: z.string().min(1, {
        message: "Passord er obligatorisk",
    })
});
export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Epost er obligatorisk",
    }),
    password: z.string().min(6, {
        message: "Passord må være minst 6 tegn",
    }),
    bedriftNavn: z.string().min(1, {
        message: "Bedriftsnavn er obligatorisk",
    }),
    orgnr: z.string().min(9).max(9).regex(/^[0-9]+$/, {
        message: "Organisasjonsnummer må være 9 siffer",
    }),
    navn: z.string().min(1, {
        message: "Navn er obligatorisk",
    }), 
    etternavn: z.string().min(1, {
        message: "Etternavn er obligatorisk",
    }),
    postnr: z.string().min(4).max(4).regex(/^[0-9]+$/, {
        message: "Postnummer må være 4 siffer",
    }),
    sted: z.string().min(1, {
        message: "Sted er obligatorisk",
    }),
});

