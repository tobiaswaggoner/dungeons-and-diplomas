# Schrein-Interaktion

## Übersicht

Der Spieler kann mit einem Schrein auf zwei Arten interagieren:
1. **E-Taste** drücken (wenn in Reichweite)
2. **Mausklick** auf den Schrein

## Interaktions-Reichweite

```typescript
const SHRINE_INTERACTION_RADIUS = 1.5; // Tiles
```

Der Spieler muss sich innerhalb von 1.5 Tiles zum Schrein-Zentrum befinden, um interagieren zu können.

## Visueller Hinweis

### Proximity-Indikator

Wenn Spieler in Reichweite kommt:
1. Schrein leuchtet heller auf
2. Text-Overlay erscheint: **"[E] Aktivieren"**
3. Optional: Partikel-Effekt um Schrein

```typescript
interface ShrineProximityState {
  isInRange: boolean;
  nearestShrine: Shrine | null;
  distance: number;
}

function checkShrineProximity(
  playerX: number,
  playerY: number,
  shrines: Shrine[]
): ShrineProximityState {
  let nearest: Shrine | null = null;
  let minDistance = Infinity;

  for (const shrine of shrines) {
    if (shrine.isActivated) continue;

    const dx = playerX - shrine.x;
    const dy = playerY - shrine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = shrine;
    }
  }

  return {
    isInRange: minDistance <= SHRINE_INTERACTION_RADIUS,
    nearestShrine: minDistance <= SHRINE_INTERACTION_RADIUS ? nearest : null,
    distance: minDistance
  };
}
```

## Tastatur-Interaktion (E-Taste)

### Event-Handler

```typescript
// hooks/useGameState.ts erweitern

const handleKeyDown = useCallback((e: KeyboardEvent) => {
  // ... bestehende Key-Handler

  if (e.key === 'e' || e.key === 'E') {
    const proximity = checkShrineProximity(
      player.x,
      player.y,
      dungeonState.shrines
    );

    if (proximity.isInRange && proximity.nearestShrine) {
      activateShrine(proximity.nearestShrine);
    }
  }
}, [player, dungeonState.shrines]);
```

### Aktivierungs-Funktion

```typescript
function activateShrine(shrine: Shrine): void {
  if (shrine.isActivated || shrine.isActive) return;

  // 1. Schrein als "in Benutzung" markieren
  shrine.isActive = true;

  // 2. Aktivierungs-Animation starten
  playShrineActivationAnimation(shrine);

  // 3. Gegner spawnen (siehe 03_Gegner_Spawning.md)
  spawnShrineEnemies(shrine);
}
```

## Maus-Interaktion (Klick)

### Canvas-Koordinaten zu Welt-Koordinaten

```typescript
function canvasToWorldCoords(
  canvasX: number,
  canvasY: number,
  cameraX: number,
  cameraY: number,
  tileSize: number
): { worldX: number; worldY: number } {
  return {
    worldX: (canvasX / tileSize) + cameraX,
    worldY: (canvasY / tileSize) + cameraY
  };
}
```

### Click-Handler

```typescript
// components/GameCanvas.tsx erweitern

const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;

  // Kamera-Offset berechnen
  const cameraX = player.x - (canvas.width / TILE_SIZE / 2);
  const cameraY = player.y - (canvas.height / TILE_SIZE / 2);

  const { worldX, worldY } = canvasToWorldCoords(
    canvasX,
    canvasY,
    cameraX,
    cameraY,
    TILE_SIZE
  );

  // Schrein-Klick prüfen
  const clickedShrine = findShrineAtPosition(worldX, worldY, shrines);

  if (clickedShrine && !clickedShrine.isActivated) {
    // Reichweiten-Check
    const dx = player.x - clickedShrine.x;
    const dy = player.y - clickedShrine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= SHRINE_INTERACTION_RADIUS) {
      activateShrine(clickedShrine);
    } else {
      // Optional: Hinweis "Zu weit entfernt"
      showToast("Zu weit entfernt!");
    }
  }
}, [player, shrines]);
```

### Schrein-Position prüfen

```typescript
function findShrineAtPosition(
  worldX: number,
  worldY: number,
  shrines: Shrine[]
): Shrine | null {
  for (const shrine of shrines) {
    const dx = Math.abs(worldX - shrine.x);
    const dy = Math.abs(worldY - shrine.y);

    // Klick innerhalb der Schrein-Hitbox?
    if (dx < SHRINE_HITBOX.width / 2 && dy < SHRINE_HITBOX.height / 2) {
      return shrine;
    }
  }
  return null;
}
```

## Cursor-Feedback

### Cursor-Änderung bei Hover

```typescript
// Cursor-Style basierend auf Mausposition

function updateCursor(worldX: number, worldY: number, shrines: Shrine[]): void {
  const hoveredShrine = findShrineAtPosition(worldX, worldY, shrines);

  if (hoveredShrine && !hoveredShrine.isActivated) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
  }
}
```

## Interaktions-Blockierung

### Wann kann NICHT interagiert werden?

1. **Schrein bereits benutzt** (`isActivated = true`)
2. **Schrein-Kampf läuft** (`isActive = true`)
3. **Anderer Kampf läuft** (`combatState.isActive = true`)
4. **Menü offen** (Dashboard, Login, etc.)
5. **Spieler bewegt sich** (optional - für besseres Gefühl)

```typescript
function canInteractWithShrine(
  shrine: Shrine,
  combatState: CombatState,
  uiState: UIState
): boolean {
  return (
    !shrine.isActivated &&
    !shrine.isActive &&
    !combatState.isActive &&
    !uiState.isDashboardOpen &&
    !uiState.isAnyModalOpen
  );
}
```

## Aktivierungs-Sequenz

### Timeline

```
0ms     - E gedrückt / Klick
0-500ms - Schrein-Aktivierungs-Animation
500ms   - Gegner spawnen (1-2 Stück)
600ms   - Erster Gegner beginnt Aggro
???ms   - Kampf beginnt (wenn Gegner Spieler erreicht)
```

### State-Machine

```
IDLE → ACTIVATING → SPAWNING_ENEMIES → WAITING_FOR_COMBAT →
COMBAT_ACTIVE → COMBAT_WON → BUFF_SELECTION → COMPLETED
           └→ COMBAT_LOST → IDLE (erneuter Versuch möglich)
```

## Rendering des Interaktions-Hinweises

```typescript
// lib/rendering/GameRenderer.ts erweitern

function renderShrineInteractionHint(
  ctx: CanvasRenderingContext2D,
  shrine: Shrine,
  screenX: number,
  screenY: number
): void {
  const text = "[E] Aktivieren";

  ctx.save();

  // Hintergrund
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = '16px Arial';
  const textWidth = ctx.measureText(text).width;
  ctx.fillRect(
    screenX - textWidth / 2 - 8,
    screenY - TILE_SIZE - 30,
    textWidth + 16,
    24
  );

  // Text
  ctx.fillStyle = '#FFD700'; // Gold
  ctx.textAlign = 'center';
  ctx.fillText(text, screenX, screenY - TILE_SIZE - 12);

  ctx.restore();
}
```

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `hooks/useGameState.ts` | E-Taste Handler, Proximity-Check |
| `components/GameCanvas.tsx` | Click-Handler, Cursor-Update |
| `lib/rendering/GameRenderer.ts` | Interaktions-Hinweis rendern |
| `lib/constants.ts` | SHRINE_INTERACTION_RADIUS |

---

**Nächster Schritt**: [03_Gegner_Spawning.md](./03_Gegner_Spawning.md) - Wie spawnen die Gegner nach Aktivierung?
