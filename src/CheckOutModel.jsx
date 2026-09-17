import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function CheckoutModal({ product, selectedSize, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hdFileToUpload = product?.rawFile || imageFile;

      if (!hdFileToUpload) {
        alert("Por favor selecciona una imagen para el producto.");
        setLoading(false);
        return;
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      
      const fileExt = hdFileToUpload.name ? hdFileToUpload.name.split('.').pop() : 'png';
      const cleanFileNameHD = `${timestamp}_${randomStr}_hd.${fileExt}`;

      const { error: uploadErrorHD } = await supabase.storage
        .from("playmats")
        .upload(cleanFileNameHD, hdFileToUpload, { cacheControl: "3600", upsert: false });

      if (uploadErrorHD) throw new Error(`Supabase HD: ${uploadErrorHD.message}`);

      const { data: publicUrlDataHD } = supabase.storage
        .from("playmats")
        .getPublicUrl(cleanFileNameHD);

      const imageUrl = publicUrlDataHD?.publicUrl;

      let imagePreviewUrl = imageUrl;

      if (product?.screenshotDataUrl) {
        const previewBlob = await (await fetch(product.screenshotDataUrl)).blob();
        const cleanFileNamePreview = `${timestamp}_${randomStr}_encuadre.png`;

        const { error: uploadErrorPreview } = await supabase.storage
          .from("playmats")
          .upload(cleanFileNamePreview, previewBlob, {
            cacheControl: "3600",
            contentType: "image/png",
            upsert: false
          });

        if (!uploadErrorPreview) {
          const { data: publicUrlDataPreview } = supabase.storage
            .from("playmats")
            .getPublicUrl(cleanFileNamePreview);

          if (publicUrlDataPreview?.publicUrl) {
            imagePreviewUrl = publicUrlDataPreview.publicUrl;
          }
        }
      }

      const rawName = (product?.name || "Producto Personalizado").toString();
      const rawCat = (product?.category || "").toString().toLowerCase();
      const isPlaymat = rawCat.includes("playmat") || rawName.toLowerCase().includes("playmat");

      const itemData = {
        producto: rawName,
        tipo: isPlaymat ? "playmat" : "playera",
        talla: selectedSize || product?.size || (isPlaymat ? "Estándar" : "G"),
        color: product?.color || product?.selectedColor || "Estándar",
        precio: Number(product?.price) || (isPlaymat ? 450 : 350),
        imagenUrl: imageUrl,
        imagenPreviewUrl: imagePreviewUrl
      };

      // Construcción limpia del mensaje para Telegram
      let captionHtml = `<b>📦 NUEVO PEDIDO DIRECTO</b>\n`;
      captionHtml += `<b>Cliente:</b> ${name}\n`;
      captionHtml += `<b>Contacto:</b> ${phone} | ${email}\n`;
      captionHtml += `<b>Dirección:</b> ${address}, ${city} (CP ${postalCode})\n\n`;
      captionHtml += `<b>───────────────</b>\n`;
      captionHtml += `📌 <b>Producto:</b> ${itemData.producto}\n`;
      captionHtml += `${itemData.tipo === "playmat" ? "🎴" : "👕"} <b>Talla/Tipo:</b> ${itemData.talla} | <b>Color:</b> ${itemData.color}\n`;
      captionHtml += `💰 <b>Precio:</b> $${itemData.precio} MXN\n`;
      captionHtml += `💾 <a href="${itemData.imagenUrl}">Descargar Archivo HD</a>\n`;

      const payload = {
        items: [itemData],
        totalPrecio: itemData.precio,
        captionHtml: captionHtml,
        imagenPreviewUrl: imagePreviewUrl,
        cliente: {
          name: name,
          email: email,
          phone: phone,
          address: address,
          city: city,
          postalCode: postalCode
        },
        fecha: new Date().toLocaleString()
      };

      const webhookUrl = "https://hook.us2.make.com/1jtkkvp18vp5m5pjwz31ccvthp1kgtu7";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Servidor: ${response.status}`);

      alert("¡Pedido enviado con éxito! 🚀");
      onClose();

    } catch (error) {
      console.error("❌ Error:", error);
      alert(`Error al procesar: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyleModal}>
      <div style={modalContentStyleModal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.25rem" }}>Finalizar Pedido</h2>
          <button onClick={onClose} style={closeButtonStyleModal}>✕</button>
        </div>

        <div style={summaryBoxStyleModal}>
          <p style={{ color: "#a1a1aa", margin: "0 0 4px 0", fontSize: "0.85rem" }}>Producto:</p>
          <p style={{ color: "#fff", margin: 0, fontWeight: "600" }}>{product?.name}</p>
          <p style={{ color: "#16a34a", margin: "8px 0 0 0", fontWeight: "bold" }}>${product?.price} MXN</p>
        </div>

        <form onSubmit={handleProcessPayment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {product?.rawFile ? (
            <div style={{ backgroundColor: "#14532d20", border: "1px solid #16a34a", borderRadius: "8px", padding: "10px", color: "#4ade80", fontSize: "0.85rem" }}>
              ✓ Captura de pantalla e imagen HD adjuntas.
            </div>
          ) : (
            <div>
              <label style={labelStyleModal}>Sube tu diseño:</label>
              <input 
                type="file" 
                accept="image/*"
                required={!product?.rawFile}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                style={{ color: "#fff", fontSize: "0.9rem", marginTop: "4px" }} 
              />
            </div>
          )}

          <div>
            <label style={labelStyleModal}>Nombre Completo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyleModal} placeholder="Juan Pérez" />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyleModal}>Correo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyleModal} placeholder="correo@example.com" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyleModal}>Teléfono / WhatsApp</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyleModal} placeholder="2291234567" />
            </div>
          </div>

          <div>
            <label style={labelStyleModal}>Dirección de Envío</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyleModal} placeholder="Calle y número" />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyleModal}>Ciudad</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} style={inputStyleModal} placeholder="Veracruz" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyleModal}>C.P.</label>
              <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={inputStyleModal} placeholder="91700" />
            </div>
          </div>

          <button type="submit" disabled={loading} style={payButtonStyleModal}>
            {loading ? "Enviando captura y pedido..." : "Enviar Pedido 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}

const modalOverlayStyleModal = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" };
const modalContentStyleModal = { backgroundColor: "#18181b", borderRadius: "16px", padding: "30px", width: "100%", maxWidth: "480px", border: "1px solid #27272a", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" };
const summaryBoxStyleModal = { backgroundColor: "#09090b", padding: "14px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #27272a" };
const labelStyleModal = { display: "block", color: "#d4d4d8", fontSize: "0.85rem", marginBottom: "6px", fontWeight: "500" };
const inputStyleModal = { width: "100%", padding: "10px 12px", backgroundColor: "#09090b", border: "1px solid #3f3f46", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none" };
const payButtonStyleModal = { marginTop: "10px", width: "100%", padding: "12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" };
const closeButtonStyleModal = { background: "transparent", border: "none", color: "#a1a1aa", fontSize: "1.2rem", cursor: "pointer" };