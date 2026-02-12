import { useState } from "react";
import { seedBooks } from "../config/seedFirestore";

function SeedDatabase() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState("");

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setResult("Seeding...");
      await seedBooks();
      setResult("✅ Successfully seeded 30 books to Firestore!");
    } catch (error) {
      console.error("Error seeding:", error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Seed Database</h2>
      <p>Click the button below to add 30 sample books to your Firestore database.</p>
      
      <button 
        onClick={handleSeed}
        disabled={seeding}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: seeding ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: seeding ? "not-allowed" : "pointer"
        }}
      >
        {seeding ? "Seeding..." : "Seed Books"}
      </button>
      
      {result && (
        <p style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          {result}
        </p>
      )}
    </div>
  );
}

export default SeedDatabase;
