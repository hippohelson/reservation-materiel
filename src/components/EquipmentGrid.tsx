import { useEffect, useState } from "react";
import Modal from "react-modal";
import type { Schema } from "../../amplify/data/resource";
import { getUrl } from "aws-amplify/storage";
import "./EquipmentGrid.css";

type EquipmentGridProps = {
  equipmentList: Schema["Equipment"]["type"][];
};

export default function EquipmentGrid({ equipmentList }: EquipmentGridProps) {
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [modalData, setModalData] = useState<Schema["Equipment"]["type"] | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const urls: Record<string, string> = {};
      for (const eq of equipmentList) {
        if (eq.image) {
          const { url } = await getUrl({ path: eq.image });
          urls[eq.id] = url.toString();
        }
      }
      setImageUrls(urls);
    };

    fetchImages();
  }, [equipmentList]);

  const toggleSelection = (id: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1>Équipements disponibles</h1>
      <div className="grid">
        {equipmentList.map((equip) => (
          <div className="card" key={equip.id} onClick={() => setModalData(equip)}>
            {imageUrls[equip.id] && (
              <img src={imageUrls[equip.id]} alt={equip.name} className="thumbnail" />
            )}
            <div className="card-content">
              <h3>{equip.name}</h3>
              <p>{equip.description}</p>
              <label onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedEquipments.includes(equip.id)}
                  onChange={() => toggleSelection(equip.id)}
                />
                Sélectionner
              </label>
            </div>
          </div>
        ))}
      </div>

      {modalData && (
        <Modal
          isOpen={!!modalData}
          onRequestClose={() => setModalData(null)}
          contentLabel="Détails équipement"
          className="modal"
          overlayClassName="overlay"
        >
          <button onClick={() => setModalData(null)}>Fermer</button>
          <h2>{modalData.name}</h2>
          {modalData.image && imageUrls[modalData.id] && (
            <img src={imageUrls[modalData.id]} alt={modalData.name} className="modal-img" />
          )}
          <p><strong>Catégorie:</strong> {modalData.category}</p>
          <p><strong>Description:</strong> {modalData.description}</p>
          <p><strong>Caution:</strong> {modalData.deposit} €</p>
          <p><strong>Quantité:</strong> {modalData.quantity}</p>
        </Modal>
      )}
    </div>
  );
}
