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

interface ComboboxProps {
  options: Option[]
  placeholder?: string
  onSelect: (value: string) => void
  defaultValue?: string
}

export function Combobox({
  options,
  placeholder = "Select an option",
  onSelect,
  defaultValue = "",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  const handleSelect = (selected: string) => {
    const newValue = selected === value ? "" : selected
    setValue(newValue)
    setOpen(false)
    onSelect(newValue) // 🔥 pass selected value to parent
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
        >
          {value
            ? options.find((val) => val.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((val) => (
                <CommandItem
                  key={val.value}
                  value={val.value}
                  onSelect={() => handleSelect(val.value)}
                >
                  {val.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === val.value ? "opacity-100" : "opacity-0"
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
