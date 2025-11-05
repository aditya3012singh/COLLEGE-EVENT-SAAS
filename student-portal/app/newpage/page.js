"use client"
import React from "react";
import { useState } from "react";
export default function NewPage() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    function toggleDropdown() {
        setDropdownOpen(!dropdownOpen);
    }
    const [seconddropdownOpen, setsecondDropdownOpen] = useState(false);
    function secondtoggleDropdown() {
        setsecondDropdownOpen(!seconddropdownOpen);
    }
    const [thirddropdownOpen, setthirdDropdownOpen] = useState(false);
    function thirdtoggleDropdown() {
        setthirdDropdownOpen(!thirddropdownOpen);
    }
    return (
        <div className=" w-xl border m-4 p-6">
            <div className="border  hover:bg-blue-100">
                <button type="button " onClick={toggleDropdown} className="py-  "><div className="text-start px-2 py-2">Accordion Item #1</div>
                    <div>
                        {dropdownOpen && (
                        <div className=" p-2 border-t bg-white    ">
                            <p className="text-sm text-start"> <span className="font-bold ">This is the first item's accordion body.</span> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the .accordion-body, though the transition does limit overflow</p>
                        </div>
                        )}
                    </div>
                </button>
                
            </div>
            
            <div className="border p- hover:bg-blue-100" >
                <button  onClick={secondtoggleDropdown} className=" "><div className="text-start px-2 py-2">Accordion Item #2</div>
                     <div>
                        {seconddropdownOpen && (
                        <div className="  p-2 border-t bg-white">
                            <p className="text-sm text-start"> <span className="font-bold ">This is the first item's accordion body.</span> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the .accordion-body, though the transition does limit overflow</p>
                        </div>
                        )}
                    </div>
                </button>
            </div>
            <div className="border p- hover:bg-blue-100">
                <button onClick={thirdtoggleDropdown} className=" "><div className="text-start px-2 py-2">Accordion Item #3</div>
                     <div>
                        {thirddropdownOpen && (
                        <div className=" p-2 border-t bg-white">
                            <p className="text-sm text-start"> <span className="font-bold text-start">This is the first item's accordion body.</span> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the .accordion-body, though the transition does limit overflow</p>
                        </div>
                        )}
                    </div>
                </button>
            </div>

        </div>
    );
}   