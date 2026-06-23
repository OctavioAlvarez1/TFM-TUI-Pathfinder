import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { keyframes } from '@emotion/react'
import { lightTheme } from './theme/lightTheme'
import { DestinationProvider } from './context/DestinationContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import KPIBar from './components/KPIBar'
import HeatmapPanel from './components/HeatmapPanel'
import EvolutionChart from './components/EvolutionChart'
import ModalDonut from './components/ModalDonut'
import OpportunitiesPanel from './components/OpportunitiesPanel'
import './index.css'

const sidebarTheme = createTheme({
  palette: {
    mode: 'dark',
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    background: { default: '#0F172A', paper: '#0F172A' },
  },
  typography: { fontFamily: '"Inter","Roboto",sans-serif' },
})

const waveForward = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`
const waveBack = keyframes`
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
`

export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <DestinationProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        <ThemeProvider theme={sidebarTheme}>
          <Sidebar />
        </ThemeProvider>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Background + content wrapper */}
          <Box sx={{
            position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
            background: 'linear-gradient(170deg, #C6DCF0 0%, #D5E8F5 30%, #E2EFF8 60%, #EDF5FB 100%)',
          }}>

            {/* Wave layer 1 — slowest, deepest */}
            <Box sx={{
              position: 'absolute', bottom: -10, left: 0,
              width: '200%', height: 110,
              animation: `${waveForward} 22s linear infinite`,
              pointerEvents: 'none', zIndex: 0,
            }}>
              <svg viewBox="0 0 2880 110" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0,55 C240,100 480,10 720,55 C960,100 1200,10 1440,55 C1680,100 1920,10 2160,55 C2400,100 2640,10 2880,55 L2880,110 L0,110 Z"
                  fill="rgba(255,255,255,0.22)" />
              </svg>
            </Box>

            {/* Wave layer 2 — medium, opposite direction */}
            <Box sx={{
              position: 'absolute', bottom: -6, left: 0,
              width: '200%', height: 75,
              animation: `${waveBack} 15s linear infinite`,
              pointerEvents: 'none', zIndex: 0,
            }}>
              <svg viewBox="0 0 2880 75" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0,38 C360,75 720,0 1080,38 C1440,75 1800,0 2160,38 C2520,75 2880,0 2880,38 L2880,75 L0,75 Z"
                  fill="rgba(255,255,255,0.30)" />
              </svg>
            </Box>

            {/* Wave layer 3 — fastest, front */}
            <Box sx={{
              position: 'absolute', bottom: -4, left: 0,
              width: '200%', height: 48,
              animation: `${waveForward} 10s linear infinite`,
              pointerEvents: 'none', zIndex: 0,
            }}>
              <svg viewBox="0 0 2880 48" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0,24 C480,48 960,0 1440,24 C1920,48 2400,0 2880,24 L2880,48 L0,48 Z"
                  fill="rgba(255,255,255,0.20)" />
              </svg>
            </Box>

            {/* UI */}
            <Box sx={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <TopBar />
              <KPIBar />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>

              <Box sx={{ height: 320, flexShrink: 0 }}>
                <HeatmapPanel />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, height: 260, alignItems: 'stretch' }}>
                <Box sx={{ flex: '0 0 45%', height: '100%' }}>
                  <EvolutionChart />
                </Box>
                <Box sx={{ flex: '0 0 200px', height: '100%' }}>
                  <ModalDonut />
                </Box>
                <Box sx={{ flex: 1, height: '100%' }}>
                  <OpportunitiesPanel />
                </Box>
              </Box>

            </Box>
          </Box>
        </Box>
      </Box>
      </DestinationProvider>
    </ThemeProvider>
  )
}
