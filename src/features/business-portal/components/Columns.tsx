import { cn } from "@/lib/utils";

type Props = {
    columns?: number;
    mdColumns?: number;
    lgColumns?: number;
    children: React.ReactNode;
    className?: string;
    props?: React.HTMLAttributes<HTMLDivElement>;
}

export default function Columns({
    columns=2,
    mdColumns=2,
    lgColumns=2,
    children,
    className,
    props
}: Props) {
    return (
        <div {...props} className={cn(`grid grid-cols-${columns} md:grid-cols-${mdColumns} lg:grid-cols-${lgColumns}`, className)}>
            {children}
        </div>
    )
}