import { useState, useRef, useEffect } from 'react'
import { Box, Typography, TextField, IconButton, Divider } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { aiMessages } from '../data/mockData'

interface Message { role: 'user' | 'assistant'; text: string }

const CANNED_RESPONSES: Record<string, string> = {
  default: 'He analizado los datos de movilidad del destino. Las zonas con mayor prioridad de mejora son Playa Malvarrosa (accesibilidad 54/100) y Cabanyal (42/100). Recomiendo priorizar la conexión ciclista y la mejora de transporte nocturno.',
}

const RECENT = [
  { label: 'Problemas de accesibilidad', time: 'Hoy, 10:30' },
  { label: 'Mejores rutas sostenibles',   time: 'Ayer, 16:42' },
  { label: 'Transporte nocturno',         time: '12 May, 09:15' },
]

function formatText(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**'))
      return <Typography key={i} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#F1F5F9', mt: 0.5 }}>{line.slice(2, -2)}</Typography>
    if (line.startsWith('• ') || line.startsWith('✅ '))
      return <Typography key={i} sx={{ fontSize: '0.7rem', color: '#CBD5E1', pl: 0.5 }}>{line}</Typography>
    if (line === '') return <Box key={i} sx={{ height: 4 }} />
    return <Typography key={i} sx={{ fontSize: '0.72rem', color: '#CBD5E1' }}>{line}</Typography>
  })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(aiMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: CANNED_RESPONSES.default }])
    }, 800)
  }

  return (
    <Box sx={{
      background: 'linear-gradient(158deg, rgba(5,62,78,0.97) 0%, rgba(3,44,58,0.95) 100%)',
      border: '1px solid rgba(129,140,248,0.15)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1.2, pb: 0.8, borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{
            width: 24, height: 24, borderRadius: '6px',
            background: 'linear-gradient(135deg, #818CF8, #0DD3C5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 12, color: '#0B1220' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>Asistente IA</Typography>
            <Typography sx={{ fontSize: '0.58rem', color: '#475569' }}>TourFlow AI</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" sx={{
              color: '#818CF8',
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.15)',
              p: 0.3,
            }}>
              <AddIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Recent conversations */}
      <Box sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid rgba(129,140,248,0.06)' }}>
        <Typography sx={{ fontSize: '0.58rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
          Conversaciones recientes
        </Typography>
        {RECENT.map(r => (
          <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>{r.label}</Typography>
            <Typography sx={{ fontSize: '0.58rem', color: '#475569' }}>{r.time}</Typography>
          </Box>
        ))}
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Box sx={{
              maxWidth: '85%',
              px: 1.2, py: 0.8,
              borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: m.role === 'user'
                ? 'linear-gradient(135deg, rgba(129,140,248,0.25), rgba(129,140,248,0.15))'
                : 'rgba(3,20,40,0.8)',
              border: m.role === 'user'
                ? '1px solid rgba(129,140,248,0.3)'
                : '1px solid rgba(255,255,255,0.06)',
            }}>
              {m.role === 'assistant' ? formatText(m.text) : (
                <Typography sx={{ fontSize: '0.72rem', color: '#F1F5F9' }}>{m.text}</Typography>
              )}
            </Box>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ px: 1.2, pb: 1.2 }}>
        <Box sx={{
          display: 'flex', gap: 0.5, alignItems: 'center',
          background: 'rgba(3,15,30,0.8)',
          border: '1px solid rgba(129,140,248,0.18)',
          borderRadius: '8px',
          px: 1, py: 0.4,
        }}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Escribe tu pregunta..."
            variant="standard"
            fullWidth
            slotProps={{ input: { disableUnderline: true, style: { fontSize: '0.72rem', color: '#F1F5F9' } } }}
            sx={{ '& input::placeholder': { color: '#475569', fontSize: '0.72rem' } }}
          />
          <IconButton size="small" onClick={send} disabled={!input.trim()} sx={{
            color: input.trim() ? '#818CF8' : '#2D3748',
            p: 0.3,
          }}>
            <SendIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
