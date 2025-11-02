"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const colleges = [
  {
    id: "kiet",
    name: "KIET Group of Institutions",
    logo: "/logos/kiet.png",
  },
  {
    id: "abes",
    name: "ABES Engineering College",
    logo: "/logos/abes.png",
  },
  {
    id: "akg",
    name: "AKG Engineering College",
    logo: "/logos/akg.png",
  },
];

export default function CollegeSelectPage() {
  const router = useRouter();

  const handleSelect = (collegeId) => {
    router.push(`/colleges/${collegeId}/login`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Select Your College</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <button
            key={college.id}
            onClick={() => handleSelect(college.id)}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <Image
              src={college.logo}
              alt={college.name}
              width={80}
              height={80}
              className="mb-3 rounded-full object-contain"
            />
            <span className="text-lg font-semibold text-gray-700">{college.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
