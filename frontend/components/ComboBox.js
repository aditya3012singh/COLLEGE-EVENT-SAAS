"use client"

import React, { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

const colleges = [
  {
    id: 1,
    value: "kiet",
    label: "KIET Group Of Institutions",
    logo: "/kiet.png",
  },
  {
    id: 2,
    value: "srm",
    label: "SRM University",
    logo: "/kiet.png",
  },
  {
    id: 3,
    value: "vit",
    label: "VIT University",
    logo: "/kiet.png",
  },
]

export default function ComboBox({ onValueChange }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const selectedCollege = colleges.find(
    (college) => college.value === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] h-16 justify-between bg-white text-black border border-gray-300"
        >
          {selectedCollege ? (
            <div className="flex items-center gap-2">
              <img
                src={selectedCollege.logo}
                alt={selectedCollege.label}
                className="h-6 w-6 rounded-full object-contain"
              />
              <span>{selectedCollege.label}</span>
            </div>
          ) : (
            "Select Your College"
          )}
          <ChevronsUpDown className="opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0 bg-white border border-gray-300 shadow-lg">
        <Command className="bg-white">
          <CommandInput placeholder="Search your college..." />
          <CommandList>
            <CommandEmpty>No college found.</CommandEmpty>
            <CommandGroup>
              {colleges.map((college) => (
                <CommandItem
                  key={college.id}
                  value={college.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    if (onValueChange) {
                      onValueChange(college.id.toString()) // ✅ send id
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <img
                    src={college.logo}
                    alt={college.label}
                    className="h-5 w-5 rounded-full object-contain"
                  />
                  <span>{college.label}</span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === college.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
