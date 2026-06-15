import { createContext, useContext, type ReactNode } from "react"
import { t as translate, getDir, type TKey } from "../lib/i18n"

interface I18nContextValue {
  lang: string
  t: (key: string, vars?: Record<string, string | number>) => string
  dir: "ltr" | "rtl"
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (key) => key,
  dir: "ltr",
})

export function I18nProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const dir = getDir(lang)
  const tFn = (key: string, vars?: Record<string, string | number>) =>
    translate(key, lang, vars)

  return (
    <I18nContext.Provider value={{ lang, t: tFn, dir }}>
      <div dir={dir} style={{ minHeight: "100%" }}>
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
