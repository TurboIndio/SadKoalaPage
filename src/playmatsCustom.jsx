import { useState } from "react";
import playmat1 from "./assets/playmat1.png";
import playmat2 from "./assets/playmat2.png";
import playmat3 from "./assets/playmat3.png";
import "./playmatsCustom.css";

export default function Playmat({ onAddToCart }) {
  const [currentBg, setCurrentBg] = useState(playmat1);
  const [customImage, setCustomImage] = useState(null);
  const [fileName, setFileName] = useState("");
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1); 
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomImage(URL.createObjectURL(file));
      setFileName(file.name);
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setRotation(0);
    }
  };

  const handleToggleRotate = () => {
    setRotation((prevRotation) => (prevRotation === 0 ? 90 : 0));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.08;
    setScale((prevScale) => {
      const newScale = e.deltaY < 0 ? prevScale + zoomSpeed : prevScale - zoomSpeed;
      return Math.min(Math.max(0.5, newScale), 4);
    });
  };

  // 🛒 Función que empaqueta el playmat personalizado y lo manda al carrito
  const handleAddPlaymatToCart = () => {
    if (!customImage) {
      alert("Por favor sube una imagen para tu playmat antes de agregarlo al carrito.");
      return;
    }

    if (onAddToCart) {
      const playmatProduct = {
        id: `playmat-${Date.now()}`,
        name: `Playmat Personalizado (${fileName || 'Diseño TCG'})`,
        price: 450, // Precio estándar de playmat personalizado
        image: customImage,
        background: currentBg,
        transform: { position, scale, rotation }
      };

      // Los playmats son de medida única estándar, mandamos "Única" como talla
      onAddToCart(playmatProduct, "Única");
    }
  };

  return (
    <div className="playmat-container">
      {/* Controles de archivo y rotación */}
      <div className="playmat-controls">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="playmat-file-input"
        />
        <button
          onClick={handleToggleRotate}
          disabled={!customImage}
          className={`playmat-btn ${customImage ? "btn-active" : "btn-disabled"}`}
        >
          {rotation === 0 ? "Girar a 90° 🔄" : "Volver a Horizontal 🔄"}
        </button>
      </div>

      {/* Selectores de fondo */}
      <div className="playmat-controls">
        <button 
          onClick={() => setCurrentBg(playmat1)}
          className={`playmat-btn ${currentBg === playmat1 ? "btn-selected" : "btn-dark"}`}
        >
          Playmat 1
        </button>
        <button 
          onClick={() => setCurrentBg(playmat2)}
          className={`playmat-btn ${currentBg === playmat2 ? "btn-selected" : "btn-dark"}`}
        >
          Playmat 2
        </button>
        <button 
          onClick={() => setCurrentBg(playmat3)}
          className={`playmat-btn ${currentBg === playmat3 ? "btn-selected" : "btn-dark"}`}
        >
          Playmat 3
        </button>
      </div>

      {/* Área de previsualización */}
      <div className="playmat-preview-box">
        {customImage && (
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`playmat-drag-area ${isDragging ? "dragging" : ""}`}
          >
            <img
              src={customImage}
              alt="Diseño personalizado"
              draggable={false}
              className="playmat-custom-img"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>
        )}

        <img
          src={currentBg}
          alt="Playmat Base"
          className="playmat-bg-img"
          style={{
            mixBlendMode: customImage ? "multiply" : "normal",
          }}
        />
      </div>

      {/* 🛒 Botón para agregar el playmat al carrito */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          onClick={handleAddPlaymatToCart}
          disabled={!customImage}
          style={{
            backgroundColor: customImage ? "#16a34a" : "#27272a",
            color: customImage ? "#fff" : "#71717a",
            border: "none",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: customImage ? "pointer" : "not-allowed",
            fontSize: "1rem",
            boxShadow: customImage ? "0 4px 12px rgba(22, 163, 74, 0.4)" : "none"
          }}
        >
          Agregar Playmat al Carrito 🛒
        </button>
      </div>
    </div>
  );
}