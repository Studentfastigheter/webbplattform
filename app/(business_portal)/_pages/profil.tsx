"use client"

import { FormGroup, FormShell, InputField } from "@/components/Dashboard/Form"
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";

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

            <FormShell title="Profilinställningar">
            
                    <FormGroup title="Profilnamn" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange profilnamn"
                            type="string"
                            value={profilnamn}
                            onChange={(e) => setProfilnamn(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup title="E-post" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange e-post"
                            type="string"
                            value={epost}
                            onChange={(e) => setEpost(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup title="Telefon" gap="sm">
                        <InputField
                            placeholder="Ange telefon"
                            type="string"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                        />
                    </FormGroup>

                    <Button className="cursor-pointer">Spara profilinställningar</Button>
        
        
                    
                </FormShell>

                <FormShell title="Offentlig profil">
                    <FormGroup title="Rubrik" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange rubrik"
                            type="text"
                            value={rubrik}
                            onChange={(e) => setRubrik(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup title="Brödtext" gap="sm" className="mb-4">
                        <InputField
                            placeholder="Ange brödtext"
                            type="text"
                            value={brodtext}
                            onChange={(e) => setBrodtext(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup title="Policytext" gap="sm">
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