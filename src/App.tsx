import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";

import EquipmentGrid from "./components/EquipmentGrid";
import AddEquipment from "./pages/AddEquipment";
import "./App.css";
import "./components/EquipmentGrid.css";

Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

function Home() {
  const [students, setStudents] = useState<Array<Schema["Student"]["type"]>>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [equipmentList, setEquipmentList] = useState<Array<Schema["Equipment"]["type"]>>([]);

  useEffect(() => {
    client.models.Student.list().then((res) => {
      setStudents(res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedStudent && startDate && endDate) {
      client.models.Equipment.list().then((res) => {
        setEquipmentList(res.data); // plus tard, on filtrera selon les dispos
      });
    }
  }, [selectedStudent, startDate, endDate]);

  return (
    <div>
      <h1>Réserver du matériel</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Étudiant :
          <select
            value={selectedStudent ?? ""}
            onChange={(e) => setSelectedStudent(e.target.value || null)}
          >
            <option value="">-- Sélectionner un nom --</option>
            {students.map((student) => (
              <option key={student.id} value={student.name}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Date d’emprunt :
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          Date de retour :
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {selectedStudent && startDate && endDate && (
        <EquipmentGrid equipmentList={equipmentList} />
      )}
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
