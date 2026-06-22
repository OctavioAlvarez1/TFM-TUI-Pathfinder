import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#818CF8' },
    secondary: { main: '#0DD3C5' },
    error:     { main: '#EF4444' },
    warning:   { main: '#F97316' },
    success:   { main: '#10B981' },
    background: { default: '#0B1220', paper: '#0D1627' },
    text: { primary: '#F1F5F9', secondary: '#64748B' },
    divider: 'rgba(129,140,248,0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
          border: '1px solid rgba(129,140,248,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})
