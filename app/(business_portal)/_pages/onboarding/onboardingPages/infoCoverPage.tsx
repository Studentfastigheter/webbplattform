import Columns from "@/components/Dashboard/Columns";
import ListWithImage, { ListItem } from "@/components/Dashboard/ListWithImage";

const listItems: ListItem[] = [
    {
        imageSrc: "/campuslyan-logo.svg",
        imageAlt: "Info image 1",
        heading: "Berätta om ditt boende",
        description: "Dela lite grundläggande information om ditt boende, så som storlek, antal rum och när det är tillgängligt."
    },
    {
        imageSrc: "/campuslyan-logo.svg",
        imageAlt: "Info image 2",
        heading: "Få det sticka ut",
        description: "Lägg till foton och titel - vi hjälper dig."
    },
    {
        imageSrc: "/campuslyan-logo.svg",
        imageAlt: "Info image 3",
        heading: "Avsluta och publicera",
        description: "Välj ett pris, verifiera några detaljer och publicera sedan din annons."
    },

]

export default function InfoCoverPage() {
    return (
        <div className="flex-1 flex flex-col">
            <Columns className="items-center flex-1">
                <div className="px-8">
                    <h1 className="text-4xl/relaxed text-neutral-700 font-semibold ">Det är enkelt att komma igång med CampusLyan</h1>
                </div>
                <div className="flex flex-col items-start gap-4 px-8">
                    <ListWithImage listItems={listItems} numbered />
                </div>

            </Columns>
        </div>
    );
}