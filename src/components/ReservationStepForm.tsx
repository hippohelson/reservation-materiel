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
  const [selectedStudent, setSelectedStudent] = useState<{ value: string; label: string } | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    client.models.Student.list().then((res) => setStudents(res.data));
  }, []);

  const goNext = () => setStep((s) => (s < 4 ? (s + 1) as typeof s : s));
  const goPrev = () => setStep((s) => (s > 1 ? (s - 1) as typeof s : s));

  const handleSubmit = () => {
    alert(`Réservation pour ${selectedStudent?.label} du ${startDate?.toLocaleDateString()} au ${endDate?.toLocaleDateString()}`);
  };

  return (
    <div className="step-form">
      <h2>Réserver du matériel</h2>

      {step > 1 && (
        <div className="recap">
          <p><strong>Étudiant :</strong> {selectedStudent?.label}</p>
          {step > 2 && startDate && <p><strong>Début :</strong> {startDate.toLocaleDateString()}</p>}
          {step > 3 && endDate && <p><strong>Retour :</strong> {endDate.toLocaleDateString()}</p>}
        </div>
      )}

      {step === 1 && (
        <div className="form-step active">
          <label>Étudiant :</label>
          <Select
            options={students.map((s) => ({ value: s.id, label: s.name }))}
            value={selectedStudent}
            onChange={(option) => setSelectedStudent(option)}
            placeholder="Choisir un étudiant"
          />
          <button disabled={!selectedStudent} onClick={goNext}>Suivant</button>
        </div>
      )}

      {step === 2 && (
        <div className="form-step active">
          <label>Date de début :</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Sélectionner une date"
            dateFormat="dd/MM/yyyy"
          />
          <div className="step-nav">
            <button onClick={goPrev}>Précédent</button>
            <button disabled={!startDate} onClick={goNext}>Suivant</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step active">
          <label>Date de retour :</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="Sélectionner une date"
            dateFormat="dd/MM/yyyy"
            minDate={startDate || undefined}
          />
          <div className="step-nav">
            <button onClick={goPrev}>Précédent</button>
            <button disabled={!endDate} onClick={goNext}>Suivant</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="form-step active">
          <p>Tout est bon ?</p>
          <div className="step-nav">
            <button onClick={goPrev}>Précédent</button>
            <button onClick={handleSubmit}>Valider la réservation</button>
          </div>
        </div>
      )}
    </div>
  );
}
