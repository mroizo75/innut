"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Button } from "@/components/ui/button";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export const CardWrapper = ({ children, headerLabel, backButtonLabel, backButtonHref, showSocial = false }: CardWrapperProps) => {
    return (
        <Card className="w-[800px] max-h-[90vh] overflow-y-auto bg-background">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {showSocial && <CardFooter>
                <Social />
            </CardFooter>}
            <BackButton label={backButtonLabel} href={backButtonHref} />
        </Card>
    )
}
