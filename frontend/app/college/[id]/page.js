import Image from "next/image";

// Mock data (later you can fetch from DB/API)
const colleges = {
  "1": { name: "KIET Group of Institutions", logo: "/kiet.png" },
  "2": { name: "IIT Delhi", logo: "/kiet.png" },
  "3": { name: "DTU", logo: "/kiet.png" },
};

export default async function CollegePage({ params }) {
  const { id } = params; // ✅ params is already plain object
  const college = colleges[id] || { name: "Unknown College", logo: "/logos/default.png" };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {/* College Info */}
      <div className="text-center mb-6">
        <Image
          src={college.logo}
          alt={college.name}
          width={120}
          height={120}
          className="mx-auto rounded-full shadow-md"
        />
        <h1 className="text-3xl font-bold mt-4">{college.name}</h1>
      </div>

      {/* Login Form */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
        <form className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="College Email"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
