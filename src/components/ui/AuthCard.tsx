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
  variant?: "split" | "homeq";
};

export function AuthCard({
  title,
  subtitle,
  helper,
  footer,
  aside,
  variant = "split",
  className,
  children,
  ...props
}: AuthCardProps) {
  if (variant === "homeq") {
    return (
      <div
        className={cn("mx-auto flex w-full max-w-[390px] flex-col", className)}
        {...props}
      >
        <div className="rounded-[24px] bg-white px-5 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.14)]">
          <div className="mb-5 flex flex-col gap-1 text-left">
            <h1 className="text-[18px] font-semibold leading-tight text-[#1f1f1f]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm leading-normal text-[#6f6f6f]">{subtitle}</p>
            )}
            {helper && <div className="text-sm text-[#6f6f6f]">{helper}</div>}
          </div>

          {children}

          {footer && (
            <div className="mt-5 text-center text-sm text-[#6f6f6f]">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

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
