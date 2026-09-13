import { useState } from "react";

export default function CheckoutModal({ product, selectedSize, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Aquí es donde próximamente conectaremos con Stripe para crear la sesión de pago
    console.log("Datos del cliente:", formData);
    console.log("Producto a comprar:", product, "Talla:", selectedSize);

    // Simulamos un retraso de conexión
    setTimeout(() => {
      alert("¡Próximamente aquí se abrirá la pasarela segura de Stripe!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.25rem" }}>Finalizar Pedido</h2>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        {/* Resumen del producto */}
        <div style={summaryBoxStyle}>
          <p style={{ color: "#a1a1aa", margin: "0 0 4px 0", fontSize: "0.85rem" }}>Producto seleccionado:</p>
          <p style={{ color: "#fff", margin: 0, fontWeight: "600" }}>{product.name} (Talla: {selectedSize})</p>
          <p style={{ color: "#3b82f6", margin: "8px 0 0 0", fontWeight: "bold" }}>${product.price} MXN</p>
        </div>

        {/* Formulario de envío */}
        <form onSubmit={handleProcessPayment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Nombre Completo</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Juan Pérez" />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Correo Electrónico</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} style={inputStyle} placeholder="correo@example.com" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Teléfono / WhatsApp</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="2291234567" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Dirección de Envio (Calle y Número)</label>
            <input type="text" name="address" required value={formData.address} onChange={handleChange} style={inputStyle} placeholder="Av. Independencia #450" />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ciudad / Municipio</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} style={inputStyle} placeholder="Veracruz" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Código Postal</label>
              <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange} style={inputStyle} placeholder="91700" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={payButtonStyle}
          >
            {loading ? "Generando pago..." : "Pagar con Tarjeta (Stripe) 🔒"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos limpios y oscuros acordes a tu diseño
const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000,
  padding: "20px"
};

const modalContentStyle = {
  backgroundColor: "#18181b",
  borderRadius: "16px",
  padding: "30px",
  width: "100%",
  maxWidth: "480px",
  border: "1px solid #27272a",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
};

const summaryBoxStyle = {
  backgroundColor: "#09090b",
  padding: "14px",
  borderRadius: "8px",
  marginBottom: "20px",
  border: "1px solid #27272a"
};

const labelStyle = {
  display: "block",
  color: "#d4d4d8",
  fontSize: "0.85rem",
  marginBottom: "6px",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "#09090b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none"
};

const payButtonStyle = {
  marginTop: "10px",
  width: "100%",
  padding: "12px",
  backgroundColor: "#635bff", // Color característico de Stripe
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background-color 0.2s"
};

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#a1a1aa",
  fontSize: "1.2rem",
  cursor: "pointer"
};