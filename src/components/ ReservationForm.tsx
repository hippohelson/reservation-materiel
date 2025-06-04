// src/components/ReservationForm.tsx
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { getUrl } from "aws-amplify/storage";
import "./ReservationForm.css";

const client = generateClient<Schema>();

export default function ReservationForm() {
  const [students, setStudents] = useState<Schema["Student"]["type"][]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [borrowDate, setBorrowDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [equipmentList, setEquipmentList] = useState<Schema["Equipment"]["type"][]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    client.models.Student.list().then((res) => {
      setStudents(res.data);
    });
  }, []);

  const fetchEquipments = async () => {
    const res = await client.models.Equipment.list();
    setEquipmentList(res.data);
    const urls: Record<string, string> = {};
    for (const eq of res.data) {
      if (eq.image) {
        const { url } = await getUrl({ path: eq.image });
        urls[eq.id] = url.href;
      }
    }
    setImageUrls(urls);
  };

  useEffect(() => {
    if (borrowDate && returnDate) {
      fetchEquipments(); // TODO : filtrer selon la dispo réelle
    }
  }, [borrowDate, returnDate]);

  const toggleSelection = (id: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      studentId,
      borrowDate,
      returnDate,
      selectedEquipments,
    });
    alert("Réservation enregistrée (simulée)");
  };

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <h2>Réserver du matériel</h2>

      <label>Nom de l’étudiant :</label>
      <select required value={studentId} onChange={(e) => setStudentId(e.target.value)}>
        <option value="">Sélectionner un nom</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <label>Date d’emprunt :</label>
      <input type="date" value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} required />

      <label>Date de retour :</label>
      <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />

      {equipmentList.length > 0 && (
        <>
          <h3>Équipements disponibles</h3>
          <div className="grid">
            {equipmentList.map((eq) => (
              <div key={eq.id} className="card">
                {imageUrls[eq.id] && (
                  <img src={imageUrls[eq.id]} alt={eq.name} className="thumbnail" />
                )}
                <h4>{eq.name}</h4>
                <p>{eq.description}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedEquipments.includes(eq.id)}
                    onChange={() => toggleSelection(eq.id)}
                  />
                  Réserver
                </label>
              </div>
            ))}
          </div>
        </>
      )}

      <button type="submit" disabled={!borrowDate || !returnDate || !studentId}>
        Valider la réservation
      </button>
    </form>
  );
}
