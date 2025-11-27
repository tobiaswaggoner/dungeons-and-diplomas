# UI-Design: Buff-Auswahl-Menü

## Übersicht

Nach dem Besiegen der Schrein-Gegner öffnet sich ein Modal-Fenster zur Buff-Auswahl. Das Spiel ist während dieser Zeit **pausiert**.

## Modal-Layout

### Desktop-Ansicht

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ✨ SCHREIN-BELOHNUNG ✨                      │
│                                                                 │
│              Wähle eine Verstärkung für deine Reise             │
│                                                                 │
│   ┌─────────────────────┐     ┌─────────────────────┐          │
│   │                     │     │                     │          │
│   │        ❤️           │     │        🛡️           │          │
│   │                     │     │                     │          │
│   │     VITALITÄT       │     │    SCHUTZSCHILD     │          │
│   │                     │     │                     │          │
│   │  +25 Maximale HP    │     │  20 Schild-HP       │          │
│   │                     │     │  Regeneriert 2/s    │          │
│   │                     │     │                     │          │
│   │    [ AUSWÄHLEN ]    │     │    [ AUSWÄHLEN ]    │          │
│   │                     │     │                     │          │
│   └─────────────────────┘     └─────────────────────┘          │
│                                                                 │
│                      Aktive Buffs: ❤️ ⏱️                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Maße

- **Modal-Breite**: 600px (max)
- **Modal-Höhe**: 400px (auto)
- **Buff-Karte**: 220px × 280px
- **Icon-Größe**: 64px
- **Abstand zwischen Karten**: 40px

## Komponenten-Struktur

### ShrineBuffModal.tsx

```tsx
interface ShrineBuffModalProps {
  isOpen: boolean;
  buffOptions: Buff[];
  activeBuffs: BuffType[];
  onSelectBuff: (buff: Buff) => void;
}

export function ShrineBuffModal({
  isOpen,
  buffOptions,
  activeBuffs,
  onSelectBuff
}: ShrineBuffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="shrine-modal-overlay">
      <div className="shrine-modal">
        <h2 className="shrine-title">✨ Schrein-Belohnung ✨</h2>
        <p className="shrine-subtitle">
          Wähle eine Verstärkung für deine Reise
        </p>

        <div className="buff-options">
          {buffOptions.map((buff) => (
            <BuffCard
              key={buff.type}
              buff={buff}
              onSelect={() => onSelectBuff(buff)}
            />
          ))}
        </div>

        <div className="active-buffs">
          <span>Aktive Buffs: </span>
          {activeBuffs.map((type) => (
            <span key={type} className="buff-icon">
              {BUFF_ICONS[type]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### BuffCard.tsx

```tsx
interface BuffCardProps {
  buff: Buff;
  onSelect: () => void;
}

export function BuffCard({ buff, onSelect }: BuffCardProps) {
  return (
    <div className="buff-card">
      <div className="buff-icon-large">
        {BUFF_ICONS[buff.type]}
      </div>

      <h3 className="buff-name">{buff.name}</h3>

      <p className="buff-description">{buff.description}</p>

      <button
        className="buff-select-button"
        onClick={onSelect}
      >
        AUSWÄHLEN
      </button>
    </div>
  );
}
```

## Styling (Tailwind CSS)

### Modal Overlay

```css
.shrine-modal-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply bg-black/80;
  backdrop-filter: blur(4px);
}
```

### Modal Container

```css
.shrine-modal {
  @apply bg-gradient-to-b from-gray-900 to-gray-800;
  @apply border-2 border-yellow-500/50;
  @apply rounded-xl p-8;
  @apply shadow-2xl shadow-yellow-500/20;
  @apply max-w-[600px] w-full mx-4;
  @apply animate-fadeIn;
}
```

### Titel

```css
.shrine-title {
  @apply text-3xl font-bold text-center;
  @apply text-yellow-400;
  @apply mb-2;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.shrine-subtitle {
  @apply text-gray-300 text-center;
  @apply mb-8;
}
```

### Buff-Karten Container

```css
.buff-options {
  @apply flex justify-center gap-8;
  @apply mb-6;
}
```

### Einzelne Buff-Karte

```css
.buff-card {
  @apply bg-gray-800/80;
  @apply border border-gray-600;
  @apply rounded-lg p-6;
  @apply w-[220px];
  @apply flex flex-col items-center;
  @apply transition-all duration-200;
  @apply hover:border-yellow-500;
  @apply hover:shadow-lg hover:shadow-yellow-500/20;
  @apply hover:transform hover:scale-105;
}
```

### Buff-Icon

```css
.buff-icon-large {
  @apply text-6xl mb-4;
  @apply animate-pulse;
}
```

### Buff-Name & Beschreibung

```css
.buff-name {
  @apply text-xl font-bold text-white;
  @apply mb-2;
}

.buff-description {
  @apply text-gray-400 text-sm text-center;
  @apply mb-4 flex-grow;
}
```

### Auswahl-Button

```css
.buff-select-button {
  @apply w-full py-2 px-4;
  @apply bg-yellow-600 hover:bg-yellow-500;
  @apply text-black font-bold;
  @apply rounded transition-colors;
  @apply uppercase tracking-wide;
}
```

### Aktive Buffs Anzeige

```css
.active-buffs {
  @apply text-center text-gray-400;
  @apply border-t border-gray-700 pt-4;
}

.active-buffs .buff-icon {
  @apply mx-1 text-xl;
}
```

## Animationen

### Fade-In Animation

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
```

### Buff-Anwendungs-Animation

Nach Klick auf "AUSWÄHLEN":

```css
@keyframes buffApplied {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}

.buff-card.selected {
  animation: buffApplied 0.5s ease-out forwards;
}
```

### Schimmer-Effekt auf Karten

```css
.buff-card::before {
  content: '';
  @apply absolute inset-0 rounded-lg;
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(255, 215, 0, 0.1) 50%,
    transparent 60%
  );
  background-size: 200% 200%;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 200%; }
  100% { background-position: -200% -200%; }
}
```

## Spiel-Pause während Modal

### Game-Loop Pause

```typescript
// hooks/useGameState.ts

const [isPaused, setIsPaused] = useState(false);

// Im Animation-Frame:
const gameLoop = useCallback((timestamp: number) => {
  if (isPaused) {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return; // Keine Updates
  }

  // Normaler Game-Loop...
}, [isPaused]);

// Beim Öffnen des Buff-Modals:
function openBuffModal() {
  setIsPaused(true);
  setIsBuffModalOpen(true);
}

// Nach Buff-Auswahl:
function onBuffSelected(buff: Buff) {
  applyBuff(player, buff);
  setIsBuffModalOpen(false);
  setIsPaused(false);
}
```

## Buff-Anwendungs-Feedback

### Toast-Notification

Nach Auswahl erscheint kurz eine Bestätigung:

```tsx
function BuffAppliedToast({ buff }: { buff: Buff }) {
  return (
    <div className="buff-toast">
      <span className="buff-toast-icon">{BUFF_ICONS[buff.type]}</span>
      <span className="buff-toast-text">{buff.name} aktiviert!</span>
    </div>
  );
}
```

```css
.buff-toast {
  @apply fixed bottom-8 left-1/2 -translate-x-1/2;
  @apply bg-green-600 text-white;
  @apply px-6 py-3 rounded-full;
  @apply flex items-center gap-2;
  @apply animate-slideUp;
  @apply shadow-lg;
}

@keyframes slideUp {
  0% { transform: translate(-50%, 100%); opacity: 0; }
  20% { transform: translate(-50%, 0); opacity: 1; }
  80% { transform: translate(-50%, 0); opacity: 1; }
  100% { transform: translate(-50%, -20px); opacity: 0; }
}
```

## Aktive Buffs in CharacterPanel

### Anzeige im Spiel-UI

```tsx
// components/CharacterPanel.tsx erweitern

function ActiveBuffsDisplay({ buffs }: { buffs: BuffType[] }) {
  return (
    <div className="active-buffs-panel">
      <span className="buffs-label">Buffs:</span>
      <div className="buffs-list">
        {buffs.map((type, index) => (
          <span
            key={`${type}-${index}`}
            className="buff-badge"
            title={BUFF_NAMES[type]}
          >
            {BUFF_ICONS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
```

```css
.active-buffs-panel {
  @apply mt-2 flex items-center gap-2;
}

.buff-badge {
  @apply text-lg cursor-help;
  @apply hover:scale-125 transition-transform;
}
```

## Mobile-Responsive Design

### Anpassungen für kleine Bildschirme

```css
@media (max-width: 640px) {
  .buff-options {
    @apply flex-col items-center gap-4;
  }

  .buff-card {
    @apply w-full max-w-[280px];
  }

  .shrine-title {
    @apply text-2xl;
  }
}
```

## Zusammenfassung der Dateien

| Datei | Beschreibung |
|-------|--------------|
| `components/ShrineBuffModal.tsx` | **NEU**: Hauptkomponente für Buff-Auswahl |
| `components/BuffCard.tsx` | **NEU**: Einzelne Buff-Karte |
| `components/BuffAppliedToast.tsx` | **NEU**: Bestätigungs-Toast |
| `components/CharacterPanel.tsx` | Erweitert um aktive Buffs |
| `app/globals.css` | Neue Animationen und Styles |

---

**Nächster Schritt**: [06_Implementation.md](./06_Implementation.md) - Technische Umsetzungsreihenfolge
