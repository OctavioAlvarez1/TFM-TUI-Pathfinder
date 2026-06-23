import { useState, useEffect } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { motion } from 'framer-motion'

interface RecCard {
  title: string
  desc: string
  tag: string
  tagColor: string
  wikiPage: string
  fallbackGradient: string
  emoji: string
}

const CARDS: RecCard[] = [
  {
    title:    'Accesibilidad en Ciutat Vella',
    desc:     'Señalética inclusiva y rampas en el casco histórico de Valencia.',
    tag:      'Accesibilidad',
    tagColor: '#818CF8',
    wikiPage: 'Torres_de_Serranos',
    fallbackGradient: 'linear-gradient(135deg,#312E81 0%,#4F46E5 50%,#6366F1 100%)',
    emoji: '🏰',
  },
  {
    title:    'Ruta patrimonial La Lonja',
    desc:     'Itinerario accesible conectando Patrimonio UNESCO de la ciudad.',
    tag:      'Turismo cultural',
    tagColor: '#F97316',
    wikiPage: 'La_Lonja_de_la_Seda',
    fallbackGradient: 'linear-gradient(135deg,#7C2D12 0%,#EA580C 50%,#B45309 100%)',
    emoji: '🏛️',
  },
  {
    title:    'Movilidad sostenible Ruzafa',
    desc:     'Ampliar Valenbisi y peatonalizar el entorno del Mercado de Colón.',
    tag:      'Sostenibilidad',
    tagColor: '#10B981',
    wikiPage: 'Mercado_de_Col%C3%B3n_(Valencia)',
    fallbackGradient: 'linear-gradient(135deg,#064E3B 0%,#059669 50%,#065F46 100%)',
    emoji: '🏗️',
  },
  {
    title:    'Conectar Bioparc con el centro',
    desc:     'Nueva lanzadera y carril bici hacia el Bioparc Valencia.',
    tag:      'Transporte',
    tagColor: '#0DD3C5',
    wikiPage: 'Bioparc_Valencia',
    fallbackGradient: 'linear-gradient(135deg,#0C4A6E 0%,#0EA5E9 50%,#06B6D4 100%)',
    emoji: '🦁',
  },
]

function WikiCard({ card, index }: { card: RecCard; index: number }) {
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${card.wikiPage}`)
      .then(r => r.json())
      .then(data => setPhoto(data.thumbnail?.source ?? null))
      .catch(() => setPhoto(null))
  }, [card.wikiPage])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ height: '100%' }}
    >
      <Box sx={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
          transform: 'translateY(-3px)',
        },
      }}>
        {/* Photo area */}
        <Box sx={{
          height: 140,
          position: 'relative',
          overflow: 'hidden',
          background: card.fallbackGradient,
          flexShrink: 0,
        }}>
          {photo ? (
            <img
              src={photo}
              alt={card.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.2rem', opacity: 0.4,
            }}>
              {card.emoji}
            </Box>
          )}

          {/* Dark overlay at bottom for readability */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
          }} />

          {/* Tag chip over photo */}
          <Chip
            label={card.tag}
            size="small"
            sx={{
              position: 'absolute', bottom: 8, left: 10,
              height: 22, fontSize: '0.62rem', fontWeight: 700,
              color: '#fff',
              background: `${card.tagColor}dd`,
              border: `1px solid ${card.tagColor}`,
              backdropFilter: 'blur(4px)',
            }}
          />
        </Box>

        {/* Text content */}
        <Box sx={{ p: 1.6, flex: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', mb: 0.5, lineHeight: 1.3 }}>
            {card.title}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.5 }}>
            {card.desc}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  )
}

export default function RecommendationCards() {
  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
          Recomendaciones IA
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
          Oportunidades identificadas por el análisis geoespacial
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
        {CARDS.map((c, i) => <WikiCard key={c.title} card={c} index={i} />)}
      </Box>
    </Box>
  )
}
