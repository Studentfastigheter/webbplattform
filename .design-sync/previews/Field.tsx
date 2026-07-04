import {
  Field, FieldLabel, FieldDescription, FieldError, FieldContent, FieldTitle, FieldGroup,
  Input, Textarea, Checkbox,
} from 'campuslyan';

export const Basic = () => (
  <Field style={{ width: 340 }}>
    <FieldLabel htmlFor="epost">E-postadress</FieldLabel>
    <Input id="epost" type="email" placeholder="namn@student.lu.se" />
    <FieldDescription>Använd din studentmejl för snabbare verifiering.</FieldDescription>
  </Field>
);

export const WithError = () => (
  <Field data-invalid="true" style={{ width: 340 }}>
    <FieldLabel htmlFor="epostfel">E-postadress</FieldLabel>
    <Input id="epostfel" type="email" defaultValue="elin.student" aria-invalid />
    <FieldError>Ange en giltig e-postadress.</FieldError>
  </Field>
);

export const CheckboxField = () => (
  <Field orientation="horizontal" style={{ width: 360 }}>
    <Checkbox id="notiser" defaultChecked />
    <FieldContent>
      <FieldTitle>Skicka notiser om nya bostäder</FieldTitle>
      <FieldDescription>Vi mejlar dig när något matchar din sökning.</FieldDescription>
    </FieldContent>
  </Field>
);

export const Group = () => (
  <FieldGroup style={{ width: 360 }}>
    <Field>
      <FieldLabel htmlFor="namn">Fullständigt namn</FieldLabel>
      <Input id="namn" defaultValue="Elin Andersson" />
    </Field>
    <Field>
      <FieldLabel htmlFor="motiv">Motivering till hyresvärd</FieldLabel>
      <Textarea id="motiv" placeholder="Presentera dig själv i några meningar…" />
      <FieldDescription>Hyresvärdar väljer ofta hyresgäst utifrån motiveringen.</FieldDescription>
    </Field>
  </FieldGroup>
);
