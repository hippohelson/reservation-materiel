import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "./Reservations.css";

const client = generateClient<Schema>();

export default function Reservations() {
  const [reservations, setReservations] = useState<Schema["Reservation"]["type"][]>([]);
  const [students, setStudents] = useState<Record<string, string>>({});
  const [equipments, setEquipments] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [resList, studentList, equipmentList, linkList] = await Promise.all([
        client.models.Reservation.list(),
        client.models.Student.list(),
        client.models.Equipment.list(),
        client.models.EquipmentReservation.list()
      ]);

      const now = new Date();
      const futureRes = resList.data.filter((r) => new Date(r.endDate) >= now);

      const studentMap = Object.fromEntries(studentList.data.map((s) => [s.id, s.name]));
      const equipmentMap = Object.fromEntries(equipmentList.data.map((e) => [e.id, e.name]));
      
      const linkMap: Record<string, string[]> = {};
      for (const link of linkList.data) {
        if (!linkMap[link.reservationId]) linkMap[link.reservationId] = [];
        linkMap[link.reservationId].push(link.equipmentId);
      }

      setReservations(
        futureRes.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      );
      setStudents(studentMap);
      setEquipments(equipmentMap);
      setLinks(linkMap);
    };

    fetchData();
  }, []);

  return (
    <div className="reservation-list">
      <h2>Réservations à venir</h2>
      {reservations.map((r) => (
        <div key={r.id} className="reservation-card">
          <p><strong>Étudiant :</strong> {students[r.studentId]}</p>
          <p><strong>Du :</strong> {new Date(r.startDate).toLocaleDateString()}</p>
          <p><strong>Au :</strong> {new Date(r.endDate).toLocaleDateString()}</p>
          <p><strong>Matériel :</strong></p>
          <ul>
            {(links[r.id] || []).map((eid) => (
              <li key={eid}>{equipments[eid]}</li>
            ))}
          </ul>
          <button onClick={() => alert("À implémenter : modifier / supprimer / terminer")}>
            Gérer la réservation
          </button>
        </div>
      ))}
    </div>
  );
}
