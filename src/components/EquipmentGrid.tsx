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
            urls[eq.id] = url.href;            
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories: string[] = Array.from(
    new Set(equipmentList.map((e) => e.category).filter((c): c is string => !!c))
  );
  

  return (
    <div>
      <div>
        <label>Filtrer par catégorie :</label>
        <select value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value || null)}>
            <option value="">Toutes</option>
            {categories.map((cat) => (
            <option key={cat as string} value={cat ?? ""}>
                {cat}
            </option>
            ))}
        </select>
      </div>

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
