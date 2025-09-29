"use client"
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  function gotoHome() {
    router.push(`/college`)
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <button onClick={gotoHome} className="text-black rounded-2xl p-2 bg-white hover:bg-gray-200">Home Page</button> 
    </div>
  )
}
