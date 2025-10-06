"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const colleges = [
  {
    id: 1,
    code: "kiet",
    name: "KIET Group Of Institutions",
    logo: "https://www.kindpng.com/picc/m/464-4645124_kiet-group-of-institutions-logo-hd-png-download.png",
  },
  {
    id: 2,
    code: "abes",
    name: "ABES Engineering College",
    logo: "https://tse1.mm.bing.net/th/id/OIP.b-lEjhcpK22L7jTn0SJEPQHaD1?pid=Api&P=0&h=220",
  },
  {
    id: 3,
    code: "iitd",
    name: "IIT Delhi",
    logo: "https://tse1.mm.bing.net/th/id/OIP.3U9o4Dc8a1euh4XaH2o1AAHaHa?pid=Api&P=0&h=220",
  },
];

export default function CollegeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(colleges[0]);
  const router = useRouter();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const onSelectCollege = (college) => {
    setSelectedCollege(college);
    setIsOpen(false);
  };

  const handleGoClick = () => {
    router.push(`/${selectedCollege.code.toLowerCase()}`);
  };

  return (
    <main
      style={{
        height: "100vh",
        backgroundColor: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
      }}
    >
      <h1 style={{ marginBottom: 32, fontSize: 28, fontWeight: "bold" }}>
        Select Your College
      </h1>

      <div
        style={{
          width: 400,
          borderRadius: 10,
          padding: 15,
          cursor: "pointer",
          position: "relative",
          boxShadow:
            "0 0 15px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.08)",
          backgroundColor: "#1e1e1e",
          border: "1px solid #333",
          userSelect: "none",
        }}
        onClick={toggleDropdown}
        tabIndex={0}
        onBlur={() => setIsOpen(false)}
      >
        {/* Selected college display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.3s ease",
            padding: "6px 10px",
            borderRadius: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#333")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <img
            src={selectedCollege.logo}
            alt={selectedCollege.name}
            width={50}
            height={50}
            style={{ objectFit: "contain", borderRadius: 8 }}
          />
          <span
            style={{
              marginLeft: 18,
              fontWeight: "600",
              fontSize: 20,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
            }}
          >
            {selectedCollege.name}
          </span>
          <span style={{ marginLeft: 12, fontSize: 24 }}>
            {isOpen ? "▲" : "▼"}
          </span>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              backgroundColor: "#222",
              borderRadius: 10,
              maxHeight: 260,
              overflowY: "auto",
              boxShadow:
                "0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0,0,0,0.2)",
              zIndex: 20,
            }}
          >
            {colleges.map((college) => (
              <div
                key={college.id}
                onClick={() => onSelectCollege(college)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    college.id === selectedCollege.id ? "#444" : "transparent",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#555")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    college.id === selectedCollege.id ? "#444" : "transparent")
                }
              >
                <img
                  src={college.logo}
                  alt={college.name}
                  width={40}
                  height={40}
                  style={{ objectFit: "contain", borderRadius: 8 }}
                />
                <span
                  style={{
                    marginLeft: 14,
                    fontWeight: "500",
                    fontSize: 18,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexGrow: 1,
                    color: "#EFEFEF",
                  }}
                >
                  {college.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleGoClick}
        style={{
          marginTop: 36,
          padding: "14px 36px",
          backgroundColor: "#00aaff",
          border: "none",
          borderRadius: 8,
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 5px 15px rgba(0, 170, 255, 0.5)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#008ecc")
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00aaff")}
      >
        Go
      </button>
    </main>
  );
}
