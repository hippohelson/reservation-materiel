import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../amplify/data/resource";
import "react-datepicker/dist/react-datepicker.css";
import "./ReservationStepForm.css";

const client = generateClient<Schema>();

export default function ReservationStepForm() {
  const [step, setStep] = useState(0);
  const [students, setStudents] = useState<Schema["Student"]["type"][]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Schema["Student"]["type"] | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [equipmentList, setEquipmentList] = useState<Schema["Equipment"]["type"][]>([]);
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

  const handleSubmit = async () => {
    if (!selectedStudent || !startDate || !endDate || selectedEquipments.length === 0) return;

    try {
      for (const eq of selectedEquipments) {
        await client.models.Reservation.create({
          studentId: selectedStudent.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          equipmentId: eq.id,
          totalDeposit,
        });
      }

      alert("Réservation enregistrée !");
      setTimeout(() => {
        setStep(0);
        setSelectedStudent(null);
        setStartDate(null);
        setEndDate(null);
        setSelectedEquipments([]);
      }, 600);
    } catch (err) {
      console.error("Erreur lors de la création :", err);
      alert("Une erreur est survenue lors de la réservation.");
    }
  };

  return (
    <div className="reservation-form">
      {/* Étape 0 */}
      {step === 0 && (
        <div className="step">
          <label>Étudiant :</label>
          <Select
            options={students.map((s) => ({ value: s, label: s.name }))}
            value={selectedStudent ? { value: selectedStudent, label: selectedStudent.name } : null}
            onChange={(opt) => setSelectedStudent(opt?.value || null)}
            placeholder="Choisir un étudiant"
          />
          <div className="actions end">
            <button disabled={!selectedStudent} onClick={() => setStep(1)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 1 */}
      {step === 1 && (
        <div className="step">
          <label>Étudiant :</label>
          <div className="summary">{selectedStudent?.name}</div>

          <label>Date de début :</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Date de début"
          />
          <div className="actions between">
            <button onClick={() => setStep(0)}>Précédent</button>
            <button disabled={!startDate} onClick={() => setStep(2)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div className="step">
          <label>Étudiant :</label>
          <div className="summary">{selectedStudent?.name}</div>
          <label>Date de début :</label>
          <div className="summary">{startDate?.toLocaleDateString()}</div>

          <label>Date de retour :</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            minDate={startDate ?? undefined}
            placeholderText="Date de retour"
          />
          {endDate && startDate && endDate <= startDate && (
            <p className="error">La date de retour doit être après la date de début.</p>
          )}
          <div className="actions between">
            <button onClick={() => setStep(1)}>Précédent</button>
            <button
              disabled={!endDate || !startDate || endDate <= startDate}
              onClick={() => {
                setSelectedEquipments([]); // reset si retour
                setStep(3);
              }}
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div className="step">
          <label>Équipements disponibles :</label>
          <div className="equipment-list">
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                className={`equip-card ${selectedEquipments.includes(eq) ? "selected" : ""}`}
                onClick={() =>
                  setSelectedEquipments((prev) =>
                    prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
                  )
                }
              >
                {imageUrls[eq.id] && <img src={imageUrls[eq.id]} alt={eq.name} />}
                <div>{eq.name}</div>
              </div>
            ))}
          </div>
          <div className="actions between">
            <button onClick={() => setStep(2)}>Précédent</button>
            <button disabled={selectedEquipments.length === 0} onClick={() => setStep(4)}>Suivant</button>
          </div>
        </div>
      )}

      {/* Étape 4 */}
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
          <div className="actions between">
            <button onClick={() => {
              setSelectedEquipments([]); // reset si retour
              setStep(3);
            }}>Précédent</button>
            <button onClick={handleSubmit}>Valider la réservation</button>
          </div>
        </div>
      )}
    </div>
  );
}
