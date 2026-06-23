import { useState, useRef, useEffect } from 'react'
import { Box, Typography, TextField, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { aiMessages } from '../data/mockData'

interface Message { role: 'user' | 'assistant'; text: string }

const RECENT = [
  { label: 'Problemas de accesibilidad', time: 'Hoy, 10:30' },
  { label: 'Mejores rutas sostenibles',  time: 'Ayer, 16:42' },
  { label: 'Transporte nocturno',        time: '12 May, 09:15' },
]

const CANNED = 'He analizado los datos de movilidad del destino. Playa Malvarrosa presenta accesibilidad 54/100 y Cabanyal 42/100. Recomiendo priorizar la conexión ciclista y mejorar el transporte nocturno.'

function formatText(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**'))
      return <Typography key={i} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', mt: 0.5 }}>{line.slice(2,-2)}</Typography>
    if (line.startsWith('• ') || line.startsWith('✅ '))
      return <Typography key={i} sx={{ fontSize: '0.7rem', color: '#475569', pl: 0.5 }}>{line}</Typography>
    if (line === '') return <Box key={i} sx={{ height: 4 }} />
    return <Typography key={i} sx={{ fontSize: '0.72rem', color: '#475569' }}>{line}</Typography>
  })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(aiMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!input.trim()) return
    const txt = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: txt }])
    setTimeout(() => setMessages(prev => [...prev, { role: 'assistant', text: CANNED }]), 700)
  }

  return (
    <Box sx={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', height: '100%',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{
            width: 26, height: 26, borderRadius: '7px',
            background: 'linear-gradient(135deg, #818CF8, #0DD3C5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 13, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>Asistente IA</Typography>
            <Typography sx={{ fontSize: '0.58rem', color: '#94A3B8' }}>TourFlow AI</Typography>
          </Box>
        </Box>
        <MoreHorizIcon sx={{ fontSize: 18, color: '#CBD5E1', cursor: 'pointer' }} />
      </Box>

      {/* Recent */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #F8FAFC' }}>
        <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
          Conversaciones recientes
        </Typography>
        {RECENT.map(r => (
          <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#475569' }}>{r.label}</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8' }}>{r.time}</Typography>
          </Box>
        ))}
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Box sx={{
              maxWidth: '85%', px: 1.2, py: 0.8,
              borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: m.role === 'user' ? '#EEF2FF' : '#F8FAFC',
              border: m.role === 'user' ? '1px solid #E0E7FF' : '1px solid #F1F5F9',
            }}>
              {m.role === 'assistant' ? formatText(m.text) : (
                <Typography sx={{ fontSize: '0.72rem', color: '#1E293B' }}>{m.text}</Typography>
              )}
            </Box>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Box sx={{
          display: 'flex', gap: 0.5, alignItems: 'center',
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: '8px', px: 1.2, py: 0.5,
        }}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Escribe tu pregunta..."
            variant="standard" fullWidth
            slotProps={{ input: { disableUnderline: true, style: { fontSize: '0.72rem', color: '#1E293B' } } }}
            sx={{ '& input::placeholder': { color: '#94A3B8', fontSize: '0.72rem' } }}
          />
          <IconButton size="small" onClick={send} disabled={!input.trim()} sx={{ color: input.trim() ? '#818CF8' : '#CBD5E1', p: 0.3 }}>
            <SendIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
