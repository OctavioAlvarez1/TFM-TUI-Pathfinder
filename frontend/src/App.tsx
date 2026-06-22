import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { darkTheme } from './theme/darkTheme'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import KPIBar from './components/KPIBar'
import MainMap from './components/MainMap'
import EvolutionChart from './components/EvolutionChart'
import ModalDonut from './components/ModalDonut'
import OpportunitiesTable from './components/OpportunitiesTable'
import HeatmapPanel from './components/HeatmapPanel'
import AIAssistant from './components/AIAssistant'
import RecommendationCards from './components/RecommendationCards'
import TouristMode from './components/TouristMode'
import ExecutiveView from './components/ExecutiveView'
import './index.css'

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0B1220' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Top bar */}
          <TopBar />

          {/* KPI strip */}
          <KPIBar />

          {/* Scrollable body */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Row 1: Map + Right column */}
            <Box sx={{ display: 'flex', gap: 1.5, height: 420 }}>
              {/* Main map — takes most of the space */}
              <Box sx={{ flex: '0 0 58%', display: 'flex', flexDirection: 'column' }}>
                <MainMap />
              </Box>

              {/* Right column: heatmap + AI */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
                <Box sx={{ flex: '0 0 55%' }}>
                  <HeatmapPanel />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <AIAssistant />
                </Box>
              </Box>
            </Box>

            {/* Row 2: Evolution + Donut + Opportunities */}
            <Box sx={{ display: 'flex', gap: 1.5, height: 230 }}>
              <EvolutionChart />
              <ModalDonut />
              <OpportunitiesTable />
            </Box>

            {/* Row 3: IA Recommendations */}
            <RecommendationCards />

            {/* Row 4: Tourist mode + Executive view */}
            <Box sx={{ display: 'flex', gap: 1.5, height: 340 }}>
              <Box sx={{ flex: '0 0 38%' }}>
                <TouristMode />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ExecutiveView />
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
