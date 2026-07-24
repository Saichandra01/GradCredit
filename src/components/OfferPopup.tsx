import { useEffect, useState } from "react";

export default function OfferPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showPopup = () => {
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 5000);
    };

    showPopup();

    const interval = setInterval(showPopup, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "360px",
        background: "rgba(28,28,30,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "20px",
        color: "white",
        backdropFilter: "blur(16px)",
        boxShadow: "0 20px 40px rgba(0,0,0,.45)",
        zIndex: 9999,
        animation: "popup .35s ease",
      }}
    >
      <button
        onClick={() => setShow(false)}
        style={{
          position: "absolute",
          right: "14px",
          top: "10px",
          background: "transparent",
          border: "none",
          color: "#999",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <div
        style={{
          display: "inline-block",
          background: "#F59E0B",
          color: "#111",
          padding: "5px 12px",
          borderRadius: "999px",
          fontWeight: "bold",
          marginBottom: "12px",
          fontSize: "13px",
        }}
      >
        ✈ ₹5,000 FLIGHT OFFER
      </div>

      <h3 style={{ margin: 0, fontSize: "22px" }}>
        Fly for Less!
      </h3>

      <p
        style={{
          color: "#d1d5db",
          lineHeight: "1.6",
          marginTop: "10px",
        }}
      >
        Apply for an <b>Education Loan</b> through
        <span style={{ color: "#3B82F6" }}> GradCredit</span> and receive
        <b> ₹5,000 OFF</b> on your international flight ticket.
      </p>

      <button
        style={{
          marginTop: "15px",
          width: "100%",
          background: "#2563EB",
          color: "white",
          border: "none",
          borderRadius: "10px",
          padding: "13px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        Claim Offer
      </button>

      <style>
        {`
          @keyframes popup{
            from{
              opacity:0;
              transform:translateY(25px) scale(.95);
            }
            to{
              opacity:1;
              transform:translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}