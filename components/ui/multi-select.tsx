// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const MultiSelect = ({ options, onChange, placeholder, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(option.value)
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  const removeOption = (optionValue) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[80px] max-h-[200px] overflow-y-auto">
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center max-w-[600px] group"
            title={option.label}
          >
            <span className="truncate mr-1">{truncateText(option.label, 80)}</span>
            <button
              type="button"
              onClick={() => removeOption(option.value)}
              className="ml-1 text-secondary-foreground hover:text-primary focus:outline-none flex-shrink-0 opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="absolute right-0 top-0 h-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-1">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange([...value, option.value]);
                  setSearch("");
                }}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};