import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservationStepForm.css";

const client = generateClient<Schema>();

export default function ReservationStepForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [students, setStudents] = useState<Schema["Student"]["type"][]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    client.models.Student.list().then((res) => setStudents(res.data));
  }, []);

  const handleStudentSelect = (option: { value: string; label: string } | null) => {
    setSelectedStudent(option?.value || null);
    setStep(2);
  };

  const handleStartDate = (date: Date | null) => {
    setStartDate(date);
    if (date !== null) setStep(3);
  };

  const handleEndDate = (date: Date | null) => {
    setEndDate(date);
    if (date !== null) setStep(4);
  };

  const handleSubmit = () => {
    alert(`Réservation pour ${selectedStudent} du ${startDate?.toLocaleDateString()} au ${endDate?.toLocaleDateString()}`);
  };

  return (
    <div className="step-form">
      <h2>Réserver du matériel</h2>

      {step >= 1 && (
        <div className={`form-step ${step === 1 ? "active" : "hidden"}`}>
          <label>Étudiant :</label>
          <Select
            options={students.map((s) => ({ value: s.id, label: s.name }))}
            onChange={handleStudentSelect}
            placeholder="Choisir un étudiant"
          />
        </div>
      )}

      {step >= 2 && (
        <div className={`form-step ${step === 2 ? "active" : "hidden"}`}>
          <label>Date de début :</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDate}
            placeholderText="Sélectionner une date"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      )}

      {step >= 3 && (
        <div className={`form-step ${step === 3 ? "active" : "hidden"}`}>
          <label>Date de retour :</label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDate}
            placeholderText="Sélectionner une date"
            dateFormat="dd/MM/yyyy"
            minDate={startDate || undefined}
          />
        </div>
      )}

      {step === 4 && (
        <div className="form-step active">
          <button className="submit-btn" onClick={handleSubmit}>
            Valider la réservation
          </button>
        </div>
      )}
    </div>
  );
}
