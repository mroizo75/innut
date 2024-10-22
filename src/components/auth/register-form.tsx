"use client"

import * as z from "zod"
import { useTransition } from "react";
import { useState } from "react";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RegisterSchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { register } from "@/actions/register"

export const RegisterForm = () => {

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            navn: "",
            etternavn: "",
            bedriftNavn: "",
            orgnr: "",
            postnr: "",
            sted: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
        console.log("onSubmit function called");
        console.log("onSubmit called", values);
        setError(undefined);    // Endret fra ""
        setSuccess(undefined);  // Endret fra ""

        try {
            const result = await register(values);
            if (result.error) {
                setError(result.error);
                setSuccess(undefined);
            } else if (result.success) {
                setSuccess(result.message);
                setError(undefined);
                // Eventuell omdirigering
            }
        } catch (error) {
            console.error("Register error", error);
            setError("En uventet feil oppstod");
            setSuccess(undefined);
        }
    }
    
    return (
        <CardWrapper 
            headerLabel="Registrer bedriften din" 
            backButtonLabel="Har du allerede konto?" 
            backButtonHref="/auth/login" 
            showSocial={false}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Personlig informasjon</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="navn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fornavn</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isPending} placeholder="Fornavn" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="etternavn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Etternavn</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isPending} placeholder="Etternavn" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-postadresse</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} type="email" placeholder="din@epost.no" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passord</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} type="password" placeholder="********" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Bedriftsinformasjon</h2>
                        <FormField
                            control={form.control}
                            name="bedriftNavn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bedriftsnavn</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="Bedriftsnavn" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="orgnr"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organisasjonsnummer</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="123 456 789" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="postnr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Postnummer</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isPending} placeholder="0000" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sted"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sted</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isPending} placeholder="Sted" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    
                    {error && <FormError message={error} />}
                    {success && <FormSuccess message={success} />}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        Registrer
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
