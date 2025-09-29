"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ComboboxDemo from "../components/ComboBox";
import { Button } from "./ui/button";

export default function HomePage() {
  const router = useRouter();
  // 1. Create a state to store the selected college ID
const [selectedId, setSelectedId] = useState();

  const goToCollege = () => {
    // 3. Use the ID from the state for navigation
    if (selectedId) {
      router.push(`/college/${selectedId}`);
    } else {
      alert("Please select a college first!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center max-w p-4">
        <h1 className="text-4xl font-bold mb-4 text-white">
          🎓 College Event Platform
        </h1>
        <p className="text-lg text-white mb-8">
          Explore, manage, and register for inter-college events.
        </p>

        <div className="flex flex-col items-center space-y-4">
          {/* 2. Pass the state setter function to the combobox */}
          <ComboboxDemo onValueChange={setSelectedId} />

          <Button
            onClick={goToCollege}
            disabled={!selectedId} // Optional: Disable button if nothing is selected
            className="mt-4 bg-white w-[400px] hover:bg-gray-300 text-xl font-bold text-black py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}