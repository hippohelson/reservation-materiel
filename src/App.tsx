import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EquipmentGrid from "./components/EquipmentGrid";
import AddEquipment from "./pages/AddEquipment";
import "./App.css";
import "./components/EquipmentGrid.css";

Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

function Home() {
  const [students, setStudents] = useState<Array<Schema["Student"]["type"]>>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);


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

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
          <div style={{ minWidth: "250px" }}>
            <label>Étudiant :</label>
            <Select
              options={students.map((s) => ({ value: s.id, label: s.name }))}
              value={students.map((s) => ({ value: s.id, label: s.name })).find((opt) => opt.value === selectedStudent)}
              onChange={(option) => setSelectedStudent(option?.value || "")}
              placeholder="Choisir un étudiant"
              isClearable
            />
          </div>

          <div>
            <label>Du :</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => {
                setStartDate(date);
                if (endDate && date > endDate) setEndDate(null);
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Date de début"
            />
          </div>

          <div>
            <label>Au :</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              dateFormat="dd/MM/yyyy"
              placeholderText="Date de retour"
            />
          </div>
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
