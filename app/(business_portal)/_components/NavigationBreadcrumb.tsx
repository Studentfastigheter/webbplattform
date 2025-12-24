"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavigationBreadcrumbProps = {
  className?: string;
};

const ROOT_PATH = "/portal";
const ROOT_LABEL = "Portal";

function formatSegmentLabel(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NavigationBreadcrumb({ className }: NavigationBreadcrumbProps) {
  const pathname = usePathname() || ROOT_PATH;

  const subPath = pathname.slice(ROOT_PATH.length); 
  const segments = subPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const segmentData = segments.map((segment, index) => {
    const href = ROOT_PATH + "/" + segments.slice(0, index + 1).join("/");
    return {
      segment,
      label: formatSegmentLabel(segment),
      href,
    };
  });

  const hasEllipsis = segmentData.length > 2;
  const firstAfterRoot = hasEllipsis ? segmentData[0] : null;
  const middleSegments = hasEllipsis ? segmentData.slice(1, -1) : [];
  const lastSegment = segmentData[segmentData.length - 1] ?? null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Always show root when NOT at root */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={ROOT_PATH}>Portal</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Your existing logic remains identical */}
        {!hasEllipsis &&
          segmentData.map((seg, index) => {
            const isLast = index === segmentData.length - 1;
            return (
              <React.Fragment key={seg.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={seg.href}>{seg.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}

        {hasEllipsis && firstAfterRoot && lastSegment && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={firstAfterRoot.href}>{firstAfterRoot.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            {middleSegments.length > 0 && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="size-4" />
                      <span className="sr-only">Toggle breadcrumb menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {middleSegments.map((seg) => (
                        <DropdownMenuItem key={seg.href} asChild>
                          <Link href={seg.href}>{seg.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>

                <BreadcrumbSeparator />
              </>
            )}

            <BreadcrumbItem>
              <BreadcrumbPage>{lastSegment.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
