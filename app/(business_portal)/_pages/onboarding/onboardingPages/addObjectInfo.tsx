"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const formSchema = z.object({
    search: z.string().min(2, {
        message: "Vänligen ange en giltig adress.",
    }),
    street: z.string().min(1, { message: "Vänligen ange en giltig gata." }),
    streetnumber: z.string().min(1, { message: "Vänligen ange ett giltigt gatunummer." }),
    postalcode: z.string().min(1, { message: "Vänligen ange en giltig postkod." }),
    city: z.string().min(1, { message: "Vänligen ange en giltig stad." }),
    county: z.string().optional(),
    apartmentnumber: z.string().optional(),
    country: z.string().min(1, { message: "Vänligen ange ett giltigt land." }),
    floor: z.string().optional(),
    floorsinbuilding: z.string().optional(),
})


function InputGroup({ children } : {
    children: React.ReactNode
}) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {children}
        </div>
    )
}

export default function AddObjectInfo() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            search: "",
            street: "",
            streetnumber: "",
            postalcode: "",
            city: "",
            county: "",
            apartmentnumber: "",
            country: "",
            floor: "",
            floorsinbuilding: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        
    }

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg mx-auto">
                    <div>
                        <h2 className="text-xl font-bold">Vilken adress har bostaden?</h2>
                        <p className="text-muted-foreground text-sm mt-2">Endast gatunamnet syns i annonsen.</p>
                    </div>
                    <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative w-full">
                                        <Search size={16} className="absolute top-[50%] translate-[-50%] left-5 text-muted-foreground" />
                                        <Input className="px-10 py-5" placeholder="Sök bostad" {...field} />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    
                    <div className="h-px w-full bg-neutral-100" />
                    
                    <InputGroup>
                        <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem>
                                    {/* If value is optional, add a text saying its optional in formlabel */}

                                    <FormLabel>Gata</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Gatuadress" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="streetnumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gatunummer</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Gatunummer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                    </InputGroup>

                    <InputGroup>
                        <FormField
                            control={form.control}
                            name="postalcode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postnummer</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Postnummer" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Stad" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </InputGroup>

                    <InputGroup>
                        <FormField
                            control={form.control}
                            name="county"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kommun <span className="text-muted-foreground text-xs">(Valfritt)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Kommun" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="apartmentnumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lägenhetsnummer <span className="text-muted-foreground text-xs">(Valfritt)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lägenhetsnummer" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                    </InputGroup>

                    <InputGroup>
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Land</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Land" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="floor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Våning <span className="text-muted-foreground text-xs">(Valfritt)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Våning" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </InputGroup>

                    <InputGroup>
                        <FormField
                            control={form.control}
                            name="floorsinbuilding"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Våningar i byggnaden</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Våningar i byggnaden" {...field} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </InputGroup>
                </form>
            </Form>
        </div>
    )
}