import Image from "next/image";
import { Separator } from "../ui/separator";
import React from "react";

export type ListItem = {
    imageSrc: string;
    imageAlt: string;
    heading: string;
    description: string;
}

type Props = {
    numbered?: boolean;
    listItems: ListItem[];
}

export default function ListWithImage({
    numbered,
    listItems,
}: Props) {
    return (
        <div>
            {listItems.map((item, index) => (
                <React.Fragment key={index}>
                    {index !== 0 && <Separator />}
                    <div className="flex gap-4 py-4">
                        {numbered && 
                            <p className="text-lg text-neutral-800 font-bold">{index + 1}</p>
                        }
                        <div className="flex-1">
                            <h2 className="text-lg text-neutral-800 font-bold">{item.heading}</h2>
                            <p className="text-sm text-neutral-600 mt-px">
                                {item.description}
                            </p>
                        </div>
                        <div>
                            <Image src={item.imageSrc} alt={item.imageAlt} width={64} height={64} className="self-center" />
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    )
}