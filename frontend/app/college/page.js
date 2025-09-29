"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ComboBox from "../../components/ComboBox"
import { Button } from "../../components/ui/button"

export default function College() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(null)

  const goToCollege = () => {
    if (selectedId) {
      router.push(`/college/${selectedId}`)
    } else {
      alert("Please select a college first!")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="text-center p-4">
        <h1 className="text-4xl font-bold mb-4 text-black">
          🎓 College Event Platform
        </h1>
        <p className="text-lg  mb-8">
          Explore, manage, and register for inter-college events.
        </p>

        <div className="flex flex-col items-center space-y-4">
          <ComboBox onValueChange={setSelectedId} />

          <Button
            onClick={goToCollege}
            disabled={!selectedId}
            className="mt-4 bg-black text-white px-46 pt-0.5 pb-0.5  hover:bg-gray-600 text-xl font-bold  py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  )
}
