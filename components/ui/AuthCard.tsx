"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type AuthCardProps = React.ComponentProps<"div"> & {
  title: string;
  subtitle?: string;
  helper?: React.ReactNode;
  footer?: React.ReactNode;
  aside?: React.ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  helper,
  footer,
  aside,
  className,
  children,
  ...props
}: AuthCardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 md:[&>*]:h-full">
          <div className="flex h-full flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-balance">{subtitle}</p>
              )}
              {helper && (
                <div className="text-sm text-muted-foreground">{helper}</div>
              )}
            </div>

            {children}

            {footer && (
              <div className="text-muted-foreground text-center text-sm">
                {footer}
              </div>
            )}
          </div>

          <div className="bg-muted relative hidden h-full md:block">
            {aside ?? (
              <Image
                src="/appartment.jpg"
                alt="Studentbostäder"
                fill
                priority={false}
                className="object-cover object-center dark:brightness-[0.2] dark:grayscale"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
