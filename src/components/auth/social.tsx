"use client"

import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { FaFacebook } from "react-icons/fa"
import { Button } from "@/components/ui/button"

export const Social = () => {
    return (
        <div className="w-full flex items-center justify-center gap-x-2">
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
                console.log("Google")
            }}>
                <FaGithub className="h-5 w-5"/>
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
                console.log("Facebook")
            }}>
                <FaFacebook className="h-5 w-5"/>
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
                console.log("Google")
            }}>
                <FcGoogle className="h-5 w-5"/>
            </Button>
        </div>
    )
}
