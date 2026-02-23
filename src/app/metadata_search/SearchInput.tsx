"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-xl"
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Enter search query..."}
        className="w-full sm:w-auto flex-1 p-5 bg-white drop-shadow-md min-w-[280px]"
      />
      <Button
        type="submit"
        className="w-full sm:w-auto py-5"
        disabled={isLoading}
      >
        Search
      </Button>
    </form>
  );
};

export default SearchInput;
