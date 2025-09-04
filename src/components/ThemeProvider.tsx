'use client'

import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#004225',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
})

interface ThemeProviderProps
{
  children: ReactNode
}

export function ThemeProvider ({ children }: ThemeProviderProps)
{
  return (
    <MUIThemeProvider theme={ theme }>
      <CssBaseline />
      { children }
    </MUIThemeProvider>
  )
}
