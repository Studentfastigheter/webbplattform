import React from "react"
import Container from "./Container";
import Image from "next/image";
import { Check, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Favorite from "./Favorite";
import ApplicationNotification, {ApplicationNotificationProps} from "./ApplicationNotification";



type NewApplicationsProps = React.HTMLAttributes<HTMLDivElement> & {
    applications: ApplicationNotificationProps[],
};

export default function NewApplications({
    applications,
    ...props
}: NewApplicationsProps) {
    return (
        <Container {...props}>
            <div>
                <h3 className="text-sm font-bold">Nya ansökningar</h3>
                <p className="text-xs text-muted-foreground">Du har <span>3</span> nya ansökningar</p>
            </div>

            <div className="mt-4">
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

