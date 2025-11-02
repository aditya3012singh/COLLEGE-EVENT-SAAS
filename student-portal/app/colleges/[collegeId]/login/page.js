"use client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const collegeData = {
  kiet: {
    name: "KIET Group of Institutions",
    logo: "/logos/kiet.png",
  },
  abes: {
    name: "ABES Engineering College",
    logo: "/logos/abes.png",
  },
  akg: {
    name: "AKG Engineering College",
    logo: "/logos/akg.png",
  },
};

export default function CollegeLoginPage() {
  const { collegeId } = useParams();
  const router = useRouter();

  const college = collegeData[collegeId ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle login logic here (API call)
    router.push(`/dashboard`);
  };

  if (!college) return <div>College not found</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image
            src={college.logo}
            alt={college.name}
            width={80}
            height={80}
            className="rounded-full mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800">{college.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link
            href={`/colleges/${collegeId}/register`}
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
