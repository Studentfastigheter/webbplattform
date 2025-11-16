import { House, ScrollText, Wallet } from "lucide-react";
import Container from "../_components/Container";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-full grid grid-cols-12">
      <Container background="#C9D9C2" columnSpan={3} icon={<Wallet color="#0F2A14" />} label="Intäkter förra månaden" data="30" unit="kkr" />
      <Container background="#F4D8E4" columnSpan={3} icon={<House color="#2A0F1A" />} label="Uthyrda lägenheter" data="30" unit="st" />
      <Container background="#C7D8EB" columnSpan={3} icon={<ScrollText color="#0B1F2A" />} label="Annonser" data="4" unit="st" />
    </div>
  )
}
