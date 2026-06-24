# Guia de instalacion — TUI Pathfinder

## Requisitos del sistema

| Requisito | Version minima | Notas |
|---|---|---|
| Node.js | 18+ | Recomendado: 20 LTS |
| npm | 9+ | Incluido con Node |
| Navegador | Chrome 90+ / Firefox 88+ / Edge 90+ | Para emojis de banderas: Chrome recomendado |
| Conexion a internet | — | Para INE EOH, Overpass y fotos Unsplash |

No se requiere Python ni ningun backend.

---

## Instalacion

### 1. Clonar o posicionarse en el proyecto

```bash
cd Desktop/TUI-Pathfinder
```

### 2. Instalar dependencias

```bash
cd frontend
npm install
```

### 3. Arrancar el servidor de desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en:

```
http://localhost:5174
```

---

## Tabla de puertos — suite completa

| Proyecto | Puerto | Comando |
|---|---|---|
| TUI-Horizon (backend) | 8000 | `uvicorn src.api.app:app --reload --port 8000` |
| TUI-Horizon (frontend) | 5173 | `npm run dev` en `TUI-Smart-Destination-Recommender/frontend` |
| TUI-Atlas | 5175 | `npm run dev` en `TUI-Atlas/frontend` |
| TUI-Sentinel | 5176 | `npm run dev` en `TUI-Sentinel/frontend` |
| **TUI-Pathfinder** | **5174** | `npm run dev` en `TUI-Pathfinder/frontend` |

---

## Cambiar el puerto

Editar `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },   // <-- cambiar aqui
})
```

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con hot reload
npm run build     # Build de produccion en dist/
npm run preview   # Preview del build de produccion
npx tsc --noEmit  # Verificacion de tipos TypeScript sin compilar
```

---

## Verificacion de instalacion

Tras `npm run dev`, abrir `http://localhost:5174` y comprobar:

- [ ] La TopBar muestra el destino activo y las banderas ES/US
- [ ] El Sidebar muestra la lista de 20 destinos
- [ ] Al cambiar de destino, la vista actualiza los datos
- [ ] El mapa interactivo carga con CartoDB Voyager
- [ ] Los carriles bici aparecen en modo Movilidad (requiere conexion a internet)
- [ ] El selector de idioma (banderas) cambia todos los textos del dashboard

---

## Troubleshooting

### El mapa no carga o aparece en blanco

```bash
# Verificar que leaflet/dist/leaflet.css se importa en InteractiveMapView.tsx
import 'leaflet/dist/leaflet.css'
```

Si el mapa sigue en blanco, puede ser un problema de z-index con el contenedor. Asegurar que el contenedor tiene `height` definido.

### Los carriles bici no aparecen

Los carriles bici se obtienen de la API publica de Overpass. Si la peticion tarda o falla, el mapa muestra el modo movilidad con zonas de calor unicamente. Esperar unos segundos o comprobar la conexion a internet.

### Los datos de pernoctaciones (INE) no cargan

La API del INE puede tardar varios segundos. El componente `AnalyticsView` muestra `cargando INE...` mientras espera y usa datos sinteticos como fallback si la peticion falla. Esto es comportamiento esperado.

### Error de TypeScript en translations.ts

Si se anade una clave nueva a un solo idioma, TypeScript falla con error de tipo. Siempre agregar la clave a **ambos** idiomas (`es` y `en`) en `translations.ts`.

### Puerto 5174 ocupado

Cambiar el puerto en `vite.config.ts` (ver seccion anterior) o liberar el proceso que ocupa ese puerto:

```powershell
# Windows — identificar proceso en puerto 5174
netstat -ano | findstr :5174
# Terminar proceso por PID
taskkill /PID <pid> /F
```

---

## Dependencias principales

```json
{
  "@mui/material": "~5/6",
  "@mui/icons-material": "~5/6",
  "react": "^18",
  "react-leaflet": "^4",
  "recharts": "^2",
  "framer-motion": "^11",
  "leaflet": "^1"
}
```
