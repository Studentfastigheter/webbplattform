"use client"

import { FormGroup, FormShell, InputField } from "@/components/Dashboard/Form"
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { UploadButton } from "../_components/UploadButton";

const defaultName = "SGS Studentbostäder";
const defaultEpost = "info@sgs.se";
const defaultTelefon = "123-456 78 90";
const defaultRubrik = "";
const defaultBrodtext = "";
const defaultPolicytext = "";

export default function Profil() {

    const [profilnamn, setProfilnamn] = useState<string>(defaultName);
    const [epost, setEpost] = useState<string>(defaultEpost);
    const [telefon, setTelefon] = useState<string>(defaultTelefon);

    const [rubrik, setRubrik] = useState<string>(defaultRubrik);
    const [brodtext, setBrodtext] = useState<string>(defaultBrodtext);
    const [policytext, setPolicytext] = useState<string>(defaultPolicytext);

    return (
        <div>

            <FormShell className="!max-w-3xl">

                
                <div className="relative mb-24">
                    <Image 
                        src="/logos/sgs-logo.svg" 
                        alt="Företagslogga" 
                        width={100} 
                        height={100} 
                        className="absolute bottom-0 translate-y-1/2 left-8 bg-white aspect-square p-2 rounded-lg shadow-md"
                    />
                    <Image 
                        src="/appartment.jpg" 
                        alt="Företagslogga"
                        width={800}
                        height={450}
                        className="aspect-video rounded-lg"
                    />
                    <div className="flex gap-4 absolute right-0 bottom-0 translate-y-[150%]">
                        <UploadButton variant={"outline"}>
                            Ändra logga
                        </UploadButton>
                        <UploadButton variant={"outline"}>
                            Ändra omslagsbild
                        </UploadButton>
                    </div>
                </div>

                </FormShell>
                <FormShell heading="Profilinställningar">
                    
            
                    <FormGroup heading="Profilnamn" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange profilnamn"
                            type="string"
                            value={profilnamn}
                            onChange={(e) => setProfilnamn(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup heading="E-post" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange e-post"
                            type="string"
                            value={epost}
                            onChange={(e) => setEpost(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup heading="Telefon" gap="sm">
                        <InputField
                            placeholder="Ange telefon"
                            type="string"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                        />
                    </FormGroup>

                    <Button className="cursor-pointer">Spara profilinställningar</Button>
        
        
                    
                </FormShell>

                <FormShell heading="Offentlig profil">
                    <FormGroup heading="Rubrik" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange rubrik"
                            type="text"
                            value={rubrik}
                            onChange={(e) => setRubrik(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup heading="Brödtext" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange brödtext"
                            type="text"
                            value={brodtext}
                            onChange={(e) => setBrodtext(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup heading="Policytext" gap="sm">
                        <InputField
                            placeholder="Ange policytext"
                            type="text"
                            value={policytext}
                            onChange={(e) => setPolicytext(e.target.value)}
                        />
                    </FormGroup>
                    
                    <div className="flex gap-4">
                        <Button className="cursor-pointer"><Eye />Se förhandsvisning</Button>
                        <Button className="cursor-pointer">Spara offentlig profil</Button>
                    </div>
                </FormShell>

        </div>
    )
}