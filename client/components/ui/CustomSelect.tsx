"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  multiple?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, className, size = 'md', placeholder, multiple = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSelectedOptions = () => {
    if (multiple && Array.isArray(value)) {
      return options.filter(opt => value.includes(opt.value));
    }
    return options.filter(opt => opt.value === value);
  };

  const selectedOptions = getSelectedOptions();
  const displayLabel = multiple 
    ? (selectedOptions.length > 0 ? selectedOptions.map(o => o.label).join(', ') : placeholder || "Select...")
    : (selectedOptions[0]?.label || placeholder || options[0]?.label || "Select...");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = options.length * 40 + 20; // Rough estimate
      setOpenUp(spaceBelow < menuHeight);
    }
  }, [isOpen, options.length]);

  const sizeClasses = {
    sm: "py-1.5 px-3 text-[10px] rounded-lg",
    md: "py-4 px-4 text-sm rounded-2xl",
    lg: "py-4 px-6 md:px-8 text-base rounded-[1.25rem]"
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-secondary/20 backdrop-blur-md border border-border flex items-center justify-between transition-all group focus:ring-2 focus:ring-primary/30 outline-none",
          sizeClasses[size],
          isOpen ? "border-primary/50 ring-2 ring-primary/20" : "hover:border-border/80",
          className
        )}
      >
        <span className={cn("font-bold text-foreground truncate mr-2", className?.includes('pl-') ? "" : "")}>{displayLabel}</span>
        <ChevronDown 
          className={cn("text-muted-foreground transition-transform duration-300", isOpen ? "rotate-180 text-primary" : "group-hover:text-foreground")} 
          size={20} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUp ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: openUp ? -5 : 5, scale: 1 }}
            exit={{ opacity: 0, y: openUp ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute z-100 w-full bg-background border border-border shadow-2xl shadow-black/10 dark:shadow-black/50 py-2 max-h-60 overflow-y-auto custom-scrollbar",
              openUp ? "bottom-full mb-2" : "top-full mt-2",
              size === 'sm' ? "rounded-xl" : "rounded-2xl"
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (multiple) {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValue = currentValues.includes(option.value)
                      ? currentValues.filter(v => v !== option.value)
                      : [...currentValues, option.value];
                    onChange(newValue);
                  } else {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors text-left",
                  (multiple && Array.isArray(value) ? value.includes(option.value) : option.value === value)
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {(multiple && Array.isArray(value) ? value.includes(option.value) : option.value === value) && <Check size={14} className="text-primary ml-2 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
