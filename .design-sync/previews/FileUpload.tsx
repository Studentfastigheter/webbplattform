import { FileUpload } from 'campuslyan';

// UntitledUI dropzone. Its surface tokens (bg-primary, ring-secondary,
// text-tertiary) and the nested FeaturedIcon / link Button rely on colour
// tokens absent from this build, so the raw component renders nearly invisible.
// We give the container a real surface + dashed border and a working text
// colour via className; the nested icon/label inherit it through currentColor.

const DropZone = FileUpload.DropZone;

const surface = 'bg-white text-gray-700 border-2 border-dashed border-gray-300 rounded-xl py-8';

export const Images = () => (
  <div style={{ width: 420 }}>
    <DropZone
      className={surface}
      buttonLabel="Bläddra"
      dragAndDropLabel="eller dra och släpp filer här"
      hint="PNG, JPG eller PDF, max 10 MB"
      accept="image/*,.pdf"
    />
  </div>
);

export const Documents = () => (
  <div style={{ width: 420 }}>
    <DropZone
      className={surface}
      buttonLabel="Ladda upp studieintyg"
      dragAndDropLabel="eller dra och släpp här"
      hint="PDF, max 5 MB"
      accept=".pdf"
      allowsMultiple={false}
    />
  </div>
);
