import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import playmat1 from "./assets/playmat1.webp";
import playmat2 from "./assets/playmat2.webp";
import playmat3 from "./assets/playmat3.webp";
import "./playmatsCustom.css";

export default function Playmat({ onAddToCart }) {
  const [currentBg, setCurrentBg] = useState(playmat1);
  const [customImage, setCustomImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [fileName, setFileName] = useState("");
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1); 
  const [rotation, setRotation] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const previewRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawFile(file);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
      };
      reader.readAsDataURL(file);

      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  };

  const handleToggleRotate = () => {
    setRotation((prevRotation) => (prevRotation === 0 ? 90 : 0));
    setPosition({ x: 0, y: 0 }); // Reseteamos posición al rotar para evitar desajustes
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

  const handleAddPlaymatToCart = async () => {
    if (!customImage) {
      alert("Por favor sube una imagen para tu playmat antes de agregarlo al carrito.");
      return;
    }

    let screenshotDataUrl = null;
    if (previewRef.current) {
      try {
        // Tomamos la captura exacta respetando las dimensiones reales de la caja (horizontal o vertical)
        screenshotDataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
      } catch (error) {
        console.error("Error al tomar la foto del playmat:", error);
      }
    }

    if (onAddToCart) {
      const playmatProduct = {
        id: `playmat-${Date.now()}`,
        name: `Playmat Personalizado (${fileName || 'Diseño TCG'})`,
        price: 450,
        image: customImage,
        rawFile: rawFile,
        screenshotDataUrl: screenshotDataUrl, 
        // Indicamos las propiedades de vista para que el carrito sepa si es vertical u horizontal
        isVertical: rotation === 90,
      };

      onAddToCart(playmatProduct, "Única");
    }
  };

  const isVertical = rotation === 90;

  return (
    <div className="playmat-main-layout">
      <div className="playmat-preview-column">
        <div 
          ref={previewRef}
          className={`playmat-preview-box ${isVertical ? "preview-vertical" : "preview-horizontal"}`}
        >
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
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
              />
            </div>
          )}

          <img
            src={currentBg}
            alt="Playmat Base"
            className={`playmat-bg-img ${isVertical ? "bg-vertical" : "bg-horizontal"}`}
            style={{
              mixBlendMode: customImage ? "multiply" : "normal",
            }}
          />
        </div>
      </div>

      <div className="playmat-sidebar-column">
        <div className="playmat-controls-group">
          <label className="playmat-btn btn-active playmat-full-width playmat-upload-label">
            📁 Subir Imagen ⚡
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="playmat-hidden-input"
            />
          </label>

          <button
            onClick={handleToggleRotate}
            className="playmat-btn btn-active playmat-full-width"
          >
            {rotation === 0 ? "Girar Playmat a Vertical 🔄" : "Playmat Horizontal 🔄"}
          </button>
        </div>

        <div className="playmat-selectors-group">
          <button 
            onClick={() => setCurrentBg(playmat1)}
            className={`playmat-btn playmat-flex-1 ${currentBg === playmat1 ? "btn-selected" : "btn-dark"}`}
          >
            Playmat 1
          </button>
          <button 
            onClick={() => setCurrentBg(playmat2)}
            className={`playmat-flex-1 ${currentBg === playmat2 ? "btn-selected" : "btn-dark"}`}
          >
            Playmat 2
          </button>
          <button 
            onClick={() => setCurrentBg(playmat3)}
            className={`playmat-btn playmat-flex-1 ${currentBg === playmat3 ? "btn-selected" : "btn-dark"}`}
          >
            Playmat 3
          </button>
        </div>

        <div>
          <button 
            onClick={handleAddPlaymatToCart}
            disabled={!customImage}
            className={`playmat-cart-btn ${customImage ? "cart-enabled" : "cart-disabled"}`}
          >
            Agregar Playmat al Carrito 🛒
          </button>
        </div>
      </div>
    </div>
  );
}