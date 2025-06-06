import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../amplify_outputs.json";
import "react-datepicker/dist/react-datepicker.css";
import ReservationStepForm from "./components/ReservationStepForm";
import AddEquipment from "./pages/AddEquipment";
import Reservations from "./pages/Reservations";
import "./App.css";
import "./components/EquipmentGrid.css";

Amplify.configure(amplifyOutputs);

function Home() {
  return (
    <div className="home">
      <h1>🎥 Site de réservation de matériel</h1>
      <h2>MJM Nantes</h2>
      <div className="menu">
        <Link className="menu-button" to="/reserve">📅 Faire une réservation</Link>
        <Link className="menu-button" to="/reservations">📋 Voir les réservations</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserve" element={<ReservationStepForm />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/add" element={<AddEquipment />} />
      </Routes>
    </Router>
  );
}
