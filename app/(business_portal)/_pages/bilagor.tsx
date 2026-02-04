"use client"

import FileManager from "../_components/FileCard/FileManager";
import { FormGroup, FormShell } from "@/components/Dashboard/Form";
import { FileText, ClipboardList } from "lucide-react";
import FileForm from "../_components/FileCard/FloorplanForm";
import RequirementProfileForm from "../_components/FileCard/RequirementProfileForm";
import { FileCardServerItem } from "@/lib/definitions";
import { submitFloorplan, submitRequirementProfile } from "@/lib/actions";


type SettingsProps = {
    floorplansPromise: Promise<FileCardServerItem[]>;
    requirementProfilesPromise: Promise<FileCardServerItem[]>;
}

export default function Bilagor({
    floorplansPromise,
    requirementProfilesPromise,
}: SettingsProps) {

    return (
        <div>
            <FormShell title="Definiera dina bilagor här" description="Här kan du ladda upp och hantera dina planlösningar och kravprofiler. Redigera din annons för att koppla samman.">
                <FormGroup title="Planlösningar" gap="sm" className="mb-3">
                    <FileManager 
                        itemsPromise={floorplansPromise} 
                        icon={<FileText />}
                        FormComponent={FileForm}
                        onSubmit={submitFloorplan}
                    />
                </FormGroup>
                <FormGroup title="Kravprofiler" gap="sm" className="mb-3">
                    <FileManager 
                        itemsPromise={requirementProfilesPromise}
                        icon={<ClipboardList />}
                        FormComponent={RequirementProfileForm}
                        onSubmit={submitRequirementProfile}
                    />
                </FormGroup>
            </FormShell>
        </div>
    );
}