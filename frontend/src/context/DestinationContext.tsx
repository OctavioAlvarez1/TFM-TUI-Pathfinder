import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { SPANISH_DESTINATIONS } from '../data/destinations'
import type { SpanishDestination } from '../data/destinations'

interface DestinationContextType {
  destination: SpanishDestination
  setDestination: (d: SpanishDestination) => void
}

const DestinationContext = createContext<DestinationContextType>({
  destination:    SPANISH_DESTINATIONS.find(d => d.id === 'valencia')!,
  setDestination: () => undefined,
})

export function DestinationProvider({ children }: { children: ReactNode }) {
  const [destination, setDestination] = useState<SpanishDestination>(
    SPANISH_DESTINATIONS.find(d => d.id === 'valencia')!
  )
  return (
    <DestinationContext.Provider value={{ destination, setDestination }}>
      {children}
    </DestinationContext.Provider>
  )
}

export function useDestination() {
  return useContext(DestinationContext)
}
