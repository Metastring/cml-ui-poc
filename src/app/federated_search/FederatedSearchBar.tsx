'use client';

import React, { useRef } from 'react';
import { Input } from '@/components/ui/input'; // ShadCN Input
import { Button } from '@/components/ui/button';
import { useFederatedSearchStore } from '@/store/useFederatedSearchStore';

const FederatedSearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {  setQuery } = useFederatedSearchStore();

  const handleSearch = () => {
    const value = inputRef.current?.value.trim();
    if (value) {
      setQuery(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef} 
        type="text"
        placeholder="Search for species, location, etc."
        className="w-full max-w-md bg-white"
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
};

export default FederatedSearchBar;
