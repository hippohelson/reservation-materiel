import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "./Reservations.css";

const client = generateClient<Schema>();

type ReservationWithDetails = Schema["Reservation"]["type"] & {
    student: Schema["Student"]["type"] | null;
    equipments: (Schema["Equipment"]["type"] | null)[];
  };
  

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await client.models.Reservation.list();
      const all = res.data ?? [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = all.filter((r) => {
        const end = new Date(r.endDate);
        return end >= today;
      });

      const withDetails = await Promise.all(
        filtered.map(async (r) => {
          const student = await client.models.Student.get({ id: r.studentId });
          const equipmentLinks = await client.models.EquipmentReservation.list({
            filter: { reservationId: { eq: r.id } },
          });
          const equipments = await Promise.all(
            equipmentLinks.data.map((link) =>
              client.models.Equipment.get({ id: link.equipmentId })
            )
          );
          return { ...r, student: student.data, equipments: equipments.map((e) => e.data) };
        })
      );

      // Tri par date de début croissante
      withDetails.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      setReservations(withDetails);
    };

    fetchReservations();
  }, []);

  return (
    <div className="reservations-page">
      <h2>📋 Réservations en cours et à venir</h2>
      {reservations.length === 0 ? (
        <p>Aucune réservation à afficher.</p>
      ) : (
        <div className="reservations-list">
          {reservations.map((r) => (
            <div className="reservation-card" key={r.id}>
              <h3>{r.student?.name}</h3>
              <p>📅 {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}</p>
              <ul>
                {r.equipments?.map((eq) =>
                  eq ? <li key={eq.id}>{eq.name}</li> : null
                )}
              </ul>
              <div className="reservation-actions">
                <button>Modifier</button>
                <button>Supprimer</button>
                <button>Mettre fin</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
