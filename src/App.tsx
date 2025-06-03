import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddEquipment from "./pages/AddEquipment";

Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

function Home() {
  const [equipmentList, setEquipmentList] = useState<Array<Schema["Equipment"]["type"]>>([]);

  useEffect(() => {
    client.models.Equipment.list().then((res) => {
      setEquipmentList(res.data);
    });
  }, []);

  return (
    <main>
      <h1>Équipements disponibles</h1>
      <Link to="/add">➕ Ajouter un matériel</Link>
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddEquipment />} />
      </Routes>
    </Router>
  );
}
