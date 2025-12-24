import NewApplications from "../_components/NewApplications";
import StatisticsContainer from "../_components/StatisticsContainer";

const applications = [
    { name: "Karl Karlsson", age: 18, address: "Chalmers tvärgata 2" },
    { name: "Johan Johansson", age: 18, address: "Chalmers tvärgata 3" },
    { name: "Anna Andersson", age: 22, address: "Chalmers tvärgata 4" },
];

export default function Ansokningar() {
  return (
    <div>
      
      <StatisticsContainer />

        
        
      <div className="grid grid-cols-12 md:grid-cols-9">
      
        <NewApplications className="col-span-3" applications={applications} />

      </div>
        
    </div>
  )
}
