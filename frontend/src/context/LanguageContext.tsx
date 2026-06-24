import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Lang, getT } from '../i18n/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: ReturnType<typeof getT>
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem('pathfinder_lang') ?? 'es') as Lang
  const [lang, setLangState] = useState<Lang>(stored)

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('pathfinder_lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
