"use client";

import { CircleQuestionMark, Upload } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import Container from "@/app/(business_portal)/_components/Container";


type FormGroupProps = React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    children: React.ReactNode;
    gap?: "sm" | "md" | "lg";
    optional?: boolean;
    comment?: string;
};

export function FormGroup({
    title,
    children,
    gap = "lg",
    optional = false,
    comment,
    ...props
}: FormGroupProps) {
    return (
        <div className="mb-8" {...props}>
            <div className={`flex items-center gap-2 align-middle  ${gap === "sm" ? "mb-1" : gap === "md" ? "mb-2" : "mb-4"}`}>
                {title && <h2 className={`text-sm font-medium text-neutral-800`}>{title}</h2>}
                {optional && <p className="text-xs text-neutral-500">(valfritt)</p>}
            </div>
            <div className="flex flex-col gap-3">
                {children}
            </div>
            {comment && <p className="mt-2 text-xs text-neutral-500">{comment}</p>}
        </div>
    );
}


type MultiselectButtonProps = React.HTMLAttributes<HTMLLabelElement> & {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: () => void;
    defaultChecked?: boolean;
    className?: string;
};


export function MultiselectButton({
    
    id,
    label,
    description,
    checked,
    onCheckedChange,
    defaultChecked,
    className,
    ...props

}: MultiselectButtonProps) {


    return (
        <Label
         {...props}
         className={cn("hover:bg-accent/50 cursor-pointer flex items-start gap-2 justify-between rounded-lg border p-4 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950", className)}>
            <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">
                    {label}
                </p>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
            <Checkbox
                id={id}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={() => onCheckedChange()}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
            />
        </Label>
    )
}

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    suffix?: string;
};

export function InputField({
    ...props
}: InputFieldProps) {
    return (
        <div className="relative">
            <Input {...props} style={{paddingRight: "40px"}} />
            {props.suffix && <p className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">{props.suffix}</p>}
        </div>
    )
}

type DragAndDropProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string,
  title: string,
  maxSize: string,
  supportedFileTypes: string[],
};

export function ImageUploadField({
  className,
  title,
  maxSize,
  supportedFileTypes,
  ...props
}: DragAndDropProps) {


    function handleUploadClick(e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) {
        e.stopPropagation();
    }


    return (
        <Container {...props} borderStyle="dashed" className={cn(`border-neutral-400`, className)} onClick={handleUploadClick}>
            {/* <div className="absolute top-3 right-4 p-2 group">
                <CircleQuestionMark onClick={handleUploadClick} size={24} className="group-hover:text-neutral-700 transition-all duration-75" />
            </div> */}
            <div className="flex items-center justify-center flex-col gap-6 py-6">
                <Upload size={48} />
                <div>
                    <p className="text-xl font-bold mb-1 text-center">{title}</p>
                    <p className="text-sm text-neutral-600 text-center">Maxstorlek: <span className="font-medium">{maxSize}</span></p>
                    <p className="text-sm text-neutral-600 text-center">Stödda filtyper: <span className="font-medium">{supportedFileTypes.join(", ")}</span></p>
                </div>
            </div>
        </Container>
    )
}





export function FormSkeleton() {
    return (
        <FormShell>
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                <div className="space-y-2">
                    <div className="h-10 w-full bg-gray-300 rounded"></div>
                    <div className="h-10 w-full bg-gray-300 rounded"></div>
                    <div className="h-10 w-full bg-gray-300 rounded"></div>
                </div>
            </div>
        </FormShell>
    )
}


type FormShellProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    title?: string;
    className?: string;
};

export function FormShell({ 
    children,
    title,
    className,
    ...props
}: FormShellProps) {
    return (
        <div className={cn("max-w-lg mx-auto mt-12", className)} {...props}>
            {title && <p className="text-xl font-semibold mb-8">{title}</p>}
            {children}
        </div>
    );
}