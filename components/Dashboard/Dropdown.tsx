import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Root } from "@radix-ui/react-select"

type DropdownOptionProps = {
    value: string;
    label: string;
};

type DropdownProps = React.ComponentProps<typeof Root> & {
    placeholder: string;
    children?: React.ReactNode;
};



export function Dropdown({
    placeholder,
    children,
    ...props
}: DropdownProps) {
    return (
        <Select {...props}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {children ? 
                    children : 
                    <SelectItem disabled value="default">No options available</SelectItem>
                }
            </SelectContent>
        </Select>
    )
}

export function DropdownOption({
    value, 
    label
}: DropdownOptionProps) {
    return (
        <SelectItem value={value}>
            {label}
        </SelectItem>
    )
}