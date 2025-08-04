"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  label: string
  value: string
}

interface MultiSelectComboboxProps {
  options: Option[]
  placeholder?: string
  onChange: (selectedValues: string[]) => void
  defaultValues?: string[]
  className?: string
}

export function MultiSelectCombobox({
  options,
  placeholder = "Select options",
  onChange,
  defaultValues = [],
  className = "w-[400px]",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValues)

  const toggleValue = (val: string) => {
    let updatedValues: string[]

    if (selectedValues.includes(val)) {
      updatedValues = selectedValues.filter((v) => v !== val)
    } else {
      updatedValues = [...selectedValues, val]
    }

    setSelectedValues(updatedValues)
    onChange(updatedValues)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <span className="truncate">
            {selectedValues.length > 0
              ? options
                  .filter((opt) => selectedValues.includes(opt.value))
                  .map((opt) => opt.label)
                  .join(", ")
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)}>
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleValue(option.value)}
                  value={option.value}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
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
