"use client"

import * as z from "zod"
import { useTransition } from "react";
import { useState } from "react";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginSchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { login } from "@/actions/login"

export const LoginForm =  () => {

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError(undefined);   // Endret fra ""
        setSuccess(undefined); // Endret fra ""

        startTransition(() => {
            login(values).then((data) => {
                if (data) {
                    if (data.error) {
                        setError(data.error);
                        setSuccess(undefined); // Sørg for at success er undefined
                    } else if (data.success) {
                        setSuccess(data.success);
                        setError(undefined);  // Sørg for at error er undefined
                        // Omdiriger til ønsket side etter innlogging
                        window.location.href = "/dashboard";
                    }
                } else {
                    setError("Det oppstod en uventet feil. Prøv igjen senere.");
                    setSuccess(undefined);
                }
            }).catch((error) => {
                console.error("Påloggingsfeil:", error);
                setError("Det oppstod en feil under pålogging. Vennligst prøv igjen.");
                setSuccess(undefined);
            });
        });
    }
    
    return (
        <CardWrapper headerLabel="Velkommen tilbake" backButtonLabel="Har du ikke konto?" backButtonHref="/auth/register" showSocial={true}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Epost</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            disabled={isPending} 
                                            placeholder="din@epost.no" 
                                            autoComplete="username"
                                        />
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
                                        <Input 
                                            {...field} 
                                            disabled={isPending} 
                                            type="password" 
                                            placeholder="********" 
                                            autoComplete="current-password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />  
                    </div>
                    {error && <FormError message={error} />}
                    {success && <FormSuccess message={success} />}
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isPending}
                    >
                        Logg inn
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
}
