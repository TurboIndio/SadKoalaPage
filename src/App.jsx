import { useState, useEffect, useRef } from 'react';
import { createClient } from "@supabase/supabase-js";
import { animate } from 'animejs';
import './App.css';
import Nav from "./navMain.jsx";
import ShirtCatalog from "./shirtCatalog.jsx";
import ShirtCustom from "./shirtCustomScript.jsx";
import Playmat from "./playmatsCustom.jsx";
import MainView from "./mainPage.jsx"; 

const supabase = createClient("https://wnezxpgkymojzotrzcmc.supabase.co", "sb_publishable_GWwMGvh0jiuJKxlV_EXnrA_q-yk3899");

export default function App() {
  const [currentView, setCurrentView] = useState("main");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [shirtModels, setShirtModels] = useState([]);
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const viewPanelRef = useRef(null);

  useEffect(() => {
    async function fetchInitialCatalog() {
      try {
        const { data, error } = await supabase.from("Shirts").select("*");
        if (!error && data) {
          setShirtModels(data);
          setIsCatalogLoaded(true);
        }
      } catch (err) {
        console.error("Error cargando catálogo global:", err);
      }
    }
    fetchInitialCatalog();
  }, []);

  useEffect(() => {
    if (viewPanelRef.current) {
      animate(viewPanelRef.current, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 500,
        ease: 'outExpo'
      });
    }
  }, [currentView]);

  const handleNavChange = (newView) => {
    if (currentView === newView) return;

    if (viewPanelRef.current) {
      animate(viewPanelRef.current, {
        opacity: [1, 0],
        translateY: [0, 20],
        duration: 200,
        ease: 'inQuad',
        onComplete: () => {
          setSelectedProduct(null);
          setCurrentView(newView);
        }
      });
    } else {
      setSelectedProduct(null);
      setCurrentView(newView);
    }
  };

  const handleAddToCart = (product, size = "G") => {
    const newItem = {
      cartId: Date.now() + Math.random(),
      product: product,
      size: size,
      quantity: 1
    };
    
    setCart((prevCart) => [...prevCart, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter(item => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((total, item) => total + ((item.product.price || 350) * item.quantity), 0);

  return (
    <div className="main-background" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <Nav 
        onGoHome={() => handleNavChange("catalog")}
        onGoMain={() => handleNavChange("main")}
        onGoPlaymats={() => handleNavChange("playmats")}
        onGoContact={() => handleNavChange("contact")}
        onGoOrders={() => handleNavChange("orders")}
      />

      <button 
        onClick={() => setIsCartOpen(true)} 
        style={floatingCartButtonStyle}
      >
        🛒 Carrito ({cart.length})
      </button>

      <div 
        ref={viewPanelRef} 
        style={{ 
          flex: 1, 
          width: "100%", 
          display: "flex", 
          flexDirection: "column", 
          opacity: 0,
          position: "relative",
          zIndex: 1 
        }}
      >
        {currentView === "catalog" && (
          <ShirtCatalog 
            shirts={shirtModels} 
            isLoaded={isCatalogLoaded}
            onSelectShirt={(product) => { setSelectedProduct(product); setCurrentView("customizer"); }} 
          />
        )}

        {currentView === "customizer" && (
          <ShirtCustom 
            initialProduct={selectedProduct} 
            onBackToCatalog={() => handleNavChange("catalog")}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === "main" && (
          <MainView 
            onGoCatalog={() => handleNavChange("catalog")} 
            onSelectShirt={(product) => {
              setSelectedProduct(product);
              setCurrentView("customizer");
            }}
          />
        )}

        {currentView === "playmats" && (
          <Playmat 
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === "contact" && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#fff" }}>
            <h2>Contacto</h2>
            <p>Comunícate con nosotros para cotizaciones de mayoreo y diseños personalizados.</p>
          </div>
        )}

        {currentView === "orders" && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#fff" }}>
            <h2>Seguimiento de Pedidos</h2>
            <p>Ingresa tu número de folio para consultar el estatus de impresión.</p>
          </div>
        )}
      </div>

      {isCartOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: "1.25rem" }}>Tu Carrito 🛒</h2>
              <button onClick={() => setIsCartOpen(false)} style={closeButtonStyle}>✕</button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: "#a1a1aa", textAlign: "center", padding: "20px 0" }}>Tu carrito está vacío.</p>
            ) : (
              <>
                <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", paddingRight: "4px" }}>
                  {cart.map((item) => (
                    <div key={item.cartId} style={cartItemStyle}>
                      {/* 🖼️ Miniatura del producto comprado */}
                      <div style={{ 
                        width: "50px", 
                        height: "50px", 
                        borderRadius: "6px", 
                        overflow: "hidden", 
                        backgroundColor: item.product.selectedColor || "#27272a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid #3f3f46"
                      }}>
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#fff", margin: 0, fontWeight: "600", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.product.name}
                        </p>
                        <p style={{ color: "#a1a1aa", margin: "3px 0 0 0", fontSize: "0.75rem" }}>
                          Talla: {item.size} {item.product.selectedColor && `• Color`}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        <span style={{ color: "#3b82f6", fontWeight: "bold", fontSize: "0.9rem" }}>${item.product.price || 350}</span>
                        <button onClick={() => handleRemoveFromCart(item.cartId)} style={removeButtonStyle}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #27272a", paddingTop: "12px", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "#d4d4d8", fontWeight: "600" }}>Total:</span>
                  <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>${cartTotal} MXN</span>
                </div>

                <button 
                  onClick={() => alert("Próximamente aquí conectaremos el flujo de pago que elijas.")}
                  style={checkoutButtonStyle}
                >
                  Continuar Pedido ⚡
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const floatingCartButtonStyle = {
  position: "fixed", bottom: "20px", right: "20px",
  backgroundColor: "#2563eb", color: "#fff", border: "none",
  borderRadius: "30px", padding: "12px 20px", fontWeight: "bold",
  cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 999
};

const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex",
  justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
};

const modalContentStyle = {
  backgroundColor: "#18181b", borderRadius: "16px", padding: "30px",
  width: "100%", maxWidth: "480px", border: "1px solid #27272a",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
};

const cartItemStyle = {
  backgroundColor: "#09090b", padding: "10px", borderRadius: "8px",
  border: "1px solid #27272a", display: "flex", alignItems: "center", gap: "12px"
};

const removeButtonStyle = {
  background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: "4px"
};

const checkoutButtonStyle = {
  width: "100%", padding: "12px", backgroundColor: "#16a34a",
  color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold",
  fontSize: "1rem", cursor: "pointer"
};

const closeButtonStyle = {
  background: "transparent", border: "none", color: "#a1a1aa", fontSize: "1.2rem", cursor: "pointer"
};