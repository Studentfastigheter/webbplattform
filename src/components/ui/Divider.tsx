type DividerProps = {
    variant?: "full" | "inset";
    type?: "dark" | "light";
};


export default function Divider({
    variant="full",
    type="light"
}: DividerProps) {
    return (
        <div className={`h-px ${variant=="full" ? "w-full" : variant=="inset" ? "mx-4" : "mx-auto w-1/2"} ${type=="light" ? "bg-neutral-100" : "bg-neutral-800"}`} />
    )
}