// WhatsAppButton.jsx (or paste at bottom of same file)
const WhatsAppButton = ({ phoneNumber }) => {
    if (!phoneNumber) return null;
  
    const whatsappLink = `https://wa.me/${phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber}`;
  
    return (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          width="28px"
          height="28px"
        >
          <path d="M12 0C5.373 0 0 5.372 0 12c0 2.118.553 4.154 1.605 5.96L0 24l6.278-1.634A11.96 11.96 0 0 0 12 24c6.627 0 12-5.372 12-12S18.627 0 12 0zm6.29 17.29a1.002 1.002 0 0 1-1.09.247c-1.464-.596-3.064-1.06-4.35-2.177-1.128-.968-1.91-2.018-2.404-3.273a8.52 8.52 0 0 1-.546-2.685c-.036-.556.39-1.038.95-1.074a1.002 1.002 0 0 1 1.049.957c.036.524.174 1.048.412 1.544.328.692.892 1.412 1.522 1.956.73.622 1.62 1.157 2.545 1.44.612.184 1.287-.035 1.62-.594a1 1 0 0 1 1.705.96c-.5.907-1.315 1.65-2.208 2.098z" />
        </svg>
      </a>
    );
  };


  export default WhatsAppButton;