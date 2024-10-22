import Image from "next/image"


interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <Image src="/images/logo_innut.png" alt="InnUt Timereg" width={200} height={100} />
            <p className="text-sm text-muted-foreground">
                {label}
            </p>
        </div>
    )
}


