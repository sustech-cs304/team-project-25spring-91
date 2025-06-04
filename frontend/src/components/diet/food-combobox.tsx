"use client"

import React, { useState, useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ComboboxItem {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

export function SearchableCombobox({
  items,
  value,
  onValueChange,
  placeholder = "Search...",
  emptyText = "No items found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Track the last matched value to detect changes
  const [, setLastMatchedValue] = useState("")
  // Add this flag to track mousedown events inside the component
  const [isMouseDown, setIsMouseDown] = useState(false)

  // Initialize or update input value when selected value changes externally
  useEffect(() => {
    if (value) {
      const selectedItem = items.find(item => item.value === value)
      if (selectedItem) {
        setInputValue(selectedItem.label)
        setLastMatchedValue(value)
      }
    } else if (!document.activeElement || document.activeElement !== inputRef.current) {
      // Only clear input if it's not focused to prevent clearing during typing
      setInputValue("")
      setLastMatchedValue("")
    }
  }, [value, items])

  // Filter items based on input
  const filteredItems = inputValue.trim() === ""
    ? items
    : items.filter(item => 
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      )

  // Find best match for current input
  const findBestMatch = (input: string) => {
    if (!input.trim()) return null
    
    // Try exact match first
    const exactMatch = filteredItems.find(
      item => item.label.toLowerCase() === input.toLowerCase()
    )
    if (exactMatch) return exactMatch
    
    // Then try starts-with match
    const startsWithMatch = filteredItems.find(
      item => item.label.toLowerCase().startsWith(input.toLowerCase())
    )
    if (startsWithMatch) return startsWithMatch
    
    // Then try contains match
    const containsMatch = filteredItems.find(
      item => item.label.toLowerCase().includes(input.toLowerCase())
    )
    if (containsMatch) return containsMatch
    
    // No match found
    return null
  }

  // Handle clicks outside the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
        selectBestMatch()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filteredItems, inputValue])

  // Helper to select the best match for current input
  const selectBestMatch = () => {
    // Only attempt match if we have input text and either no value or value has changed
    if (inputValue.trim() !== "") {
      const bestMatch = findBestMatch(inputValue)
      
      if (bestMatch) {
        setInputValue(bestMatch.label)
        onValueChange(bestMatch.value)
        setLastMatchedValue(bestMatch.value)
      } else if (filteredItems.length > 0) {
        // Fall back to first filtered item
        const firstItem = filteredItems[0]
        setInputValue(firstItem.label)
        onValueChange(firstItem.value)
        setLastMatchedValue(firstItem.value)
      } else {
        // No matches, clear everything
        setInputValue("")
        onValueChange("")
        setLastMatchedValue("")
      }
    } else {
      // Empty input, clear everything
      setInputValue("")
      onValueChange("")
      setLastMatchedValue("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // When input changes, we should reset the selection if it doesn't match current input
    // This fixes the issue where changing from "Chicken" to "Chicken B" still kept "Chicken" selected
    const currentSelection = items.find(item => item.value === value)
    if (currentSelection && !newValue.toLowerCase().includes(currentSelection.label.toLowerCase())) {
      onValueChange("") // Clear selection when input no longer matches
    }
    
    if (newValue.trim() === "") {
      onValueChange("")
      setLastMatchedValue("")
    }
    
    setOpen(newValue.trim() !== "")
  }

  const handleItemSelect = (selectedValue: string) => {
    const selectedItem = items.find(item => item.value === selectedValue)
    if (selectedItem) {
      setInputValue(selectedItem.label)
      onValueChange(selectedItem.value)
      setLastMatchedValue(selectedItem.value)
    }
    setOpen(false)
  }

  const clearInput = () => {
    setInputValue("")
    onValueChange("")
    setLastMatchedValue("")
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleInputBlur = () => {
    // Only close if we're not in the middle of a mousedown inside the component
    if (!isMouseDown) {
      setTimeout(() => {
        selectBestMatch()
        setOpen(false)
      }, 150)
    }
  }

  return (
    <div 
      ref={wrapperRef} 
      className={cn("relative w-full", className)}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      <div className="flex items-center relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(inputValue.trim() !== "")}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pr-8"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full px-3 py-0"
            onClick={clearInput}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {open && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
          <ScrollArea className="max-h-60 overflow-auto" type="auto">
            <div className="p-1">
              {filteredItems.map((item) => (
                <div
                  key={item.value}
                  onClick={() => handleItemSelect(item.value)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    value === item.value ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {open && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
          <div className="p-2 text-sm text-center text-muted-foreground">
            {emptyText}
          </div>
        </div>
      )}
    </div>
  )
}