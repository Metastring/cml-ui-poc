'use client'

import { useEffect, useState } from 'react'

// Define the species type
interface Species {
  id: number
  common_name: string
  scientific_name: string
  location: string
  category: string
  status: string
}

export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([])
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await fetch('/species.json')
        const data: Species[] = await res.json()
        setSpecies(data)
      } catch (err) {
        console.error('Failed to fetch species:', err)
      }
    }

    fetchSpecies()
  }, [])

  const filtered = species.filter((s) =>
    s.common_name.toLowerCase().includes(search.toLowerCase())
  )

  return { search, setSearch, filtered }
}
