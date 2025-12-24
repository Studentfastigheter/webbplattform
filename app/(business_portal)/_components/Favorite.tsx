"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star } from "lucide-react";
import { useState } from "react";


type FavoriteProps = {
    defaultFavorite?: boolean,
};

export default function Favorite({
    defaultFavorite = false,
}: FavoriteProps) {

    const [favorite, setFavorite] = useState(defaultFavorite);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Star fill={favorite ? "currentColor" : "none"} width={16} className={`cursor-pointer ${favorite ? "text-brand" : ""}`} onClick={() => setFavorite(!favorite)} />
            </TooltipTrigger>
            <TooltipContent className="pointer-events-none">
                <p>{favorite ? "Ta bort favorit" : "Lägg till favorit"}</p>
            </TooltipContent>
        </Tooltip>
    )
}