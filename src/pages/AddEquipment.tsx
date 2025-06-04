import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { uploadData } from "aws-amplify/storage";

const client = generateClient<Schema>();

export default function AddEquipment() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    quantity: 1,
    deposit: 0,
    imageFile: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, imageFile: file }));
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (form.imageFile) {
        const uploadResult = await uploadData({
          path: `equipments/${Date.now()}-${form.imageFile.name}`,
          data: form.imageFile,
        }).result;
        imageUrl = uploadResult.path;
      }

      await client.models.Equipment.create({
        name: form.name,
        category: form.category,
        description: form.description,
        image: imageUrl,
        quantity: Number(form.quantity),
        deposit: Number(form.deposit),
      });

      alert("Matériel ajouté !");
      setForm({ name: "", category: "", description: "", quantity: 1, deposit: 0, imageFile: null });
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
      <h2>Ajouter un matériel</h2>

      <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
      <input name="category" placeholder="Catégorie" value={form.category} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} required />
      <input name="deposit" type="number" min={0} value={form.deposit} onChange={handleChange} required />
      <input type="file" accept="image/*" onChange={handleFileChange} required />

      {previewUrl && <img src={previewUrl} alt="Prévisualisation" style={{ maxWidth: "100%", marginTop: 10 }} />}

      <button type="submit" disabled={loading}>
        {loading ? "Ajout en cours..." : "Ajouter"}
      </button>
    </form>
  );
}
