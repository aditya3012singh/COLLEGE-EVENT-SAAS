"use client";
import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";

const colleges = [
  {
    id: 1,
    code: "kiet",
    name: "KIET Group Of Institutions",
    logo:
      "https://www.kindpng.com/picc/m/464-4645124_kiet-group-of-institutions-logo-hd-png-download.png",
  },
  {
    id: 2,
    code: "abes",
    name: "ABES Engineering College",
    logo:
      "https://tse1.mm.bing.net/th/id/OIP.b-lEjhcpK22L7jTn0SJEPQHaD1?pid=Api&P=0&h=220",
  },
  {
    id: 3,
    code: "iitd",
    name: "IIT Delhi",
    logo:
      "https://tse1.mm.bing.net/th/id/OIP.3U9o4Dc8a1euh4XaH2o1AAHaHa?pid=Api&P=0&h=220",
  },
];

const loginTypes = [
  { id: "student", label: "Student Login", registerPath: "studentRegister" },
  { id: "college", label: "College Login", registerPath: "collegeRegister" },
  { id: "club", label: "Club Login", registerPath: "clubRegister" },
];

export default function CollegeHomePage() {
  const router = useRouter();
  const params = useParams();
  const collegeCode = params.collegeCode;

  const college =
    colleges.find((c) => c.code === collegeCode) || {
      name: "Unknown College",
      logo: "",
    };

  const [selectedLogin, setSelectedLogin] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Logging in as ${selectedLogin} with email: ${form.email} and password: ${form.password}`
    );
  };

  const registerPath = loginTypes.find((l) => l.id === selectedLogin)
    ?.registerPath;

  return (
    <div className="bg-black min-h-screen p-5 flex justify-center items-center">
      <main className="max-w-xl w-full text-center font-sans text-gray-200">
        <div className="flex items-center justify-center mb-6">
          {college.logo && (
            <img
              src={college.logo}
              alt={college.name}
              className="max-w-[140px] max-h-[70px] object-contain mr-5 rounded-lg shadow-lg bg-gray-900"
            />
          )}
          <h1 className="text-3xl font-extrabold">{college.name}</h1>
        </div>

        <div className="flex justify-center mb-6 space-x-4">
          {loginTypes.map((login) => (
            <button
              key={login.id}
              onClick={() => {
                setSelectedLogin(login.id);
                setForm({ email: "", password: "" });
              }}
              className={`flex-1 py-3 rounded-md font-semibold border transition-colors duration-300 ${
                selectedLogin === login.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-transparent border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {login.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-xl shadow-md p-6 text-left"
        >
          <label
            htmlFor="email"
            className="block mb-2 font-semibold text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder={`${selectedLogin} email`}
            required
            className="w-full px-4 py-2 text-gray-200 bg-black rounded-md border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none mb-4"
          />
          <label
            htmlFor="password"
            className="block mb-2 font-semibold text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 text-gray-200 bg-black rounded-md border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none mb-6"
          />
          <button 
            type="submit"
            className="w-full py-3 rounded-md bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Login
          </button>

          <p className="mt-4 text-center text-blue-400 text-sm">
            Don't have an account?{" "}
            <a
              href={`/${collegeCode}/${registerPath}`}
              className="underline cursor-pointer"
            >
              Register here
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}
