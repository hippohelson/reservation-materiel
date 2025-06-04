import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";

import EquipmentGrid from "./components/EquipmentGrid";
import AddEquipment from "./pages/AddEquipment";
import "./App.css";
import "./components/EquipmentGrid.css"; // si ce n’est pas déjà importé

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
    <div>
      <h1>Équipements disponibles</h1>
      <EquipmentGrid equipmentList={equipmentList} />
    </div>
  );
  
}

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Accueil</Link> | <Link to="/add">Ajouter un équipement</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddEquipment />} />
      </Routes>
    </Router>
  );
}
