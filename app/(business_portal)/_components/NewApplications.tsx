import React from "react"
import Container from "./Container";
import { SquareArrowOutUpRight, } from "lucide-react";
import ApplicationNotification, {ApplicationNotificationProps} from "./ApplicationNotification";
import Link from "next/link";

type NewApplicationsProps = React.HTMLAttributes<HTMLDivElement> & {
    applications: ApplicationNotificationProps[],
};

export default function NewApplications({
    applications,
    ...props
}: NewApplicationsProps) {
    return (
        <Container {...props}>
            <Link href="/portal/ansokningar" className="absolute right-6">
                <SquareArrowOutUpRight className="h-5 w-5 text-muted-foreground cursor-pointer" />
            </Link>
            <div>
                <h3 className="text-sm font-bold">Nya ansökningar</h3>
                <p className="text-xs text-muted-foreground">Du har <span>{applications.length}</span> nya ansökningar</p>
            </div>

            <div className="mt-4" style={{ overflow: 'auto', height: 300 }}>
                {
                    applications.map((application, index) => (
                        <ApplicationNotification 
                            key={index}
                            {...application}
                        />
                    ))
                }
            </div>
        </Container>
    )
}

