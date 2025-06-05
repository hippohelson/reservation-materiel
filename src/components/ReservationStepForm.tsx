// ReservationStepper.tsx
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../amplify/data/resource";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservationStepForm.css";

const client = generateClient<Schema>();

export default function ReservationStepper() {
  const [step, setStep] = useState(0);

  const [students, setStudents] = useState<Array<Schema["Student"]["type"]>>([]);
  const [selectedStudent, setSelectedStudent] = useState<Schema["Student"]["type"] | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [equipmentList, setEquipmentList] = useState<Array<Schema["Equipment"]["type"]>>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [selectedEquipments, setSelectedEquipments] = useState<Schema["Equipment"]["type"][]>([]);

  useEffect(() => {
    client.models.Student.list().then((res) => setStudents(res.data));
  }, []);

  useEffect(() => {
    if (step === 3) {
      client.models.Equipment.list().then(async (res) => {
        const urls: Record<string, string> = {};
        for (const eq of res.data) {
          if (eq.image) {
            const { url } = await getUrl({ path: eq.image });
            urls[eq.id] = url.toString();
          }
        }
        setImageUrls(urls);
        setEquipmentList(res.data);
      });
    }
  }, [step]);

  const totalDeposit = selectedEquipments.reduce((sum, eq) => sum + (eq.deposit ?? 0), 0);

  return (
    <div className="reservation-stepper">
      {step >= 0 && (
        <div className="step">
          <label>Étudiant :</label>
          {step === 0 ? (
            <>
              <Select
                options={students.map((s) => ({ value: s, label: s.name }))}
                value={selectedStudent ? { value: selectedStudent, label: selectedStudent.name } : null}
                onChange={(opt) => setSelectedStudent(opt?.value || null)}
              />
              <button disabled={!selectedStudent} onClick={() => setStep(1)}>Suivant</button>
            </>
          ) : (
            <div className="summary">{selectedStudent?.name}</div>
          )}
        </div>
      )}

      {step >= 1 && (
        <div className="step">
          <label>Date de début :</label>
          {step === 1 ? (
            <>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de début"
              />
              <div className="actions">
                <button onClick={() => setStep(0)}>Précédent</button>
                <button disabled={!startDate} onClick={() => setStep(2)}>Suivant</button>
              </div>
            </>
          ) : (
            <div className="summary">📅 Début : {startDate?.toLocaleDateString()}</div>
          )}
        </div>
      )}

      {step >= 2 && (
        <div className="step">
          <label>Date de retour :</label>
          {step === 2 ? (
            <>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                minDate={startDate ?? undefined}
                placeholderText="Date de retour"
              />
              <div className="actions">
                <button onClick={() => setStep(1)}>Précédent</button>
                <button disabled={!endDate} onClick={() => setStep(3)}>Suivant</button>
              </div>
            </>
          ) : (
            <div className="summary">📅 Retour : {endDate?.toLocaleDateString()}</div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h3>Équipements disponibles :</h3>
          <div className="equipment-list">
            {equipmentList.map((eq) => (
              <div key={eq.id} className={`equip-card ${selectedEquipments.includes(eq) ? "selected" : ""}`} onClick={() => {
                setSelectedEquipments((prev) =>
                  prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
                );
              }}>
                {imageUrls[eq.id] && <img src={imageUrls[eq.id]} alt={eq.name} />}
                <div>{eq.name}</div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button onClick={() => setStep(2)}>Précédent</button>
            <button disabled={selectedEquipments.length === 0} onClick={() => setStep(4)}>Suivant</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <h3>Récapitulatif</h3>
          <p><strong>Étudiant :</strong> {selectedStudent?.name}</p>
          <p><strong>Du :</strong> {startDate?.toLocaleDateString()}</p>
          <p><strong>Au :</strong> {endDate?.toLocaleDateString()}</p>
          <p><strong>Matériel :</strong></p>
          <ul>
            {selectedEquipments.map((eq) => (
              <li key={eq.id}>{eq.name} — {eq.deposit} €</li>
            ))}
          </ul>
          <p><strong>Total caution :</strong> {totalDeposit} €</p>
          <div className="actions">
            <button onClick={() => setStep(3)}>Précédent</button>
            <button onClick={() => alert("Réservation validée !")}>Valider la réservation</button>
          </div>
        </div>
      )}
    </div>
  );
}
