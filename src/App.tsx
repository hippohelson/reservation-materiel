import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const client = generateClient<Schema>();

function App() {
  const [equipmentList, setEquipmentList] = useState<Array<Schema["Equipment"]["type"]>>([]);

  useEffect(() => {
    // Liste tous les équipements
    client.models.Equipment.list().then((res) => {
      setEquipmentList(res.data);
    });
  }, []);

  return (
    <main>
      <h1>Équipements disponibles</h1>
      <ul>
        {equipmentList.map((equip) => (
          <li key={equip.id}>
            <strong>{equip.name}</strong>
            {equip.category && ` — ${equip.category}`}
            {equip.description && ` : ${equip.description}`}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
