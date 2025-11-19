
export default function Container(
    {
        children,
        columnSpan = 3,
    }:
    {
        children: React.ReactNode,
        columnSpan?: number,
    }
) {
    return (
        <div style={{"gridColumn": `span ${columnSpan}`}} className="bg-white m-2 p-6 relative rounded-lg border border-slate-100 shadow-sm">
            {children}
        </div>
    )
}