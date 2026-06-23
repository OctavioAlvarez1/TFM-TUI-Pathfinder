import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'
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

export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <DestinationProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* Sidebar */}
        <ThemeProvider theme={sidebarTheme}>
          <Sidebar />
        </ThemeProvider>

        {/* Main area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>

            {/* Content */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#F1F5F9' }}>
            <TopBar />
            <KPIBar />

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Row 1: Map full width */}
              <Box sx={{ height: 320, flexShrink: 0 }}>
                <HeatmapPanel />
              </Box>

              {/* Row 2: Charts + Opportunities — same height */}
              <Box sx={{ display: 'flex', gap: 2, height: 320, alignItems: 'stretch' }}>
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
