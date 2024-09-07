"use client"

import { type ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SessionProvider } from "next-auth/react";


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Provider({
    children
} : {
    children : React.ReactNode
}) {

    return (
        <SessionProvider>
                {children}
        </SessionProvider>
    )
}
