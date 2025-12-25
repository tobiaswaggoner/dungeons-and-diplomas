# Schrein-Spawning System

## Übersicht

Schreine erscheinen zufällig in Dungeon-Räumen. Um das Spiel nicht zu überladen, ist die Spawn-Rate bewusst niedrig gehalten.

## Spawn-Regeln

### Wahrscheinlichkeit

```typescript
const SHRINE_SPAWN_CHANCE = 0.10; // 10% pro Raum
```

**Begründung**: Bei durchschnittlich 15-20 Räumen pro Dungeon ergibt das ca. 1-2 Schreine pro Dungeon-Run.

### Ausschlusskriterien

Ein Schrein spawnt **NICHT** in:
1. **Start-Raum** - Spieler soll erst erkunden
2. **Combat-Räumen** - Bereits Gegner vorhanden
3. **Treasure-Räumen** - Bereits Belohnung vorhanden
4. **Zu kleine Räume** - Mindestgröße 5x5 erforderlich

### Neuer Room-Type

```typescript
// lib/constants.ts - Erweitern
export type RoomType = 'empty' | 'treasure' | 'combat' | 'shrine';
```

## Positionierung

### Raummitte-Berechnung

```typescript
interface ShrinePosition {
  x: number; // Tile-X (Raummitte)
  y: number; // Tile-Y (Raummitte)
}

function calculateShrinePosition(room: Room): ShrinePosition {
  return {
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2)
  };
}
```

### Hitbox

```typescript
const SHRINE_HITBOX = {
  width: 1.5,  // 1.5 Tiles breit
  height: 1.5, // 1.5 Tiles hoch
  offsetX: -0.25, // Zentriert
  offsetY: -0.25
};
```

**Wichtig**: Spieler kann nicht durch den Schrein laufen!

## Integration in Dungeon-Generation

### Schritt 1: Room-Type Zuweisung erweitern

```typescript
// lib/dungeon/generation.ts - assignRoomTypes() erweitern

function assignRoomTypes(rooms: Room[], startRoomId: number): void {
  rooms.forEach((room, index) => {
    if (index === startRoomId) {
      room.type = 'empty';
      return;
    }

    const roll = Math.random();

    if (roll < 0.10 && room.width >= 5 && room.height >= 5) {
      room.type = 'shrine';    // 10% - NEU
    } else if (roll < 0.20) {
      room.type = 'treasure';  // 10%
    } else if (roll < 0.30) {
      room.type = 'combat';    // 10%
    } else {
      room.type = 'empty';     // 70%
    }
  });
}
```

### Schritt 2: Schrein-Entity erstellen

```typescript
// lib/Shrine.ts - Neue Datei

export interface Shrine {
  id: number;
  x: number;           // Tile-Position X
  y: number;           // Tile-Position Y
  roomId: number;      // Zugehöriger Raum
  isActivated: boolean; // Bereits benutzt?
  isActive: boolean;    // Gerade in Benutzung (Kampf läuft)?
}
```

### Schritt 3: Schrein-Spawning bei Dungeon-Erstellung

```typescript
// lib/game/DungeonManager.ts erweitern

interface DungeonState {
  // ... bestehende Felder
  shrines: Shrine[];
}

function createShrines(rooms: Room[]): Shrine[] {
  const shrines: Shrine[] = [];
  let shrineId = 0;

  rooms.forEach((room, roomIndex) => {
    if (room.type === 'shrine') {
      shrines.push({
        id: shrineId++,
        x: Math.floor(room.x + room.width / 2),
        y: Math.floor(room.y + room.height / 2),
        roomId: roomIndex,
        isActivated: false,
        isActive: false
      });
    }
  });

  return shrines;
}
```

## Visuelle Darstellung

### Tileset-Integration

**Option A**: Neues Tile im bestehenden Tileset
- Koordinaten reservieren: z.B. (20, 10) bis (21, 11) für 2x2 Schrein

**Option B**: Separates Sprite
- `/public/Assets/shrine.png`
- Animiertes Sprite mit idle-Animation (leuchtend)

### Empfehlung

Option B (separates Sprite) für:
- Einfachere Animation
- Verschiedene Schrein-Zustände (aktiv, benutzt, leuchtend)
- Flexiblere Größe

### Sprite-Spezifikation

```
shrine.png - Spritesheet
├── Frame 0-3: Idle-Animation (leuchtend pulsierend)
├── Frame 4-7: Aktivierungs-Animation
└── Frame 8:   Deaktiviert/Benutzt (grau)

Größe pro Frame: 96x96 Pixel (1.5 Tiles)
Animation FPS: 4
```

## Kollisionserkennung

### Erweiterung CollisionDetector

```typescript
// lib/physics/CollisionDetector.ts erweitern

export function checkShrineCollision(
  playerX: number,
  playerY: number,
  playerSize: number,
  shrines: Shrine[]
): Shrine | null {
  for (const shrine of shrines) {
    if (shrine.isActivated) continue; // Benutzte Schreine ignorieren

    const dx = Math.abs(playerX - shrine.x);
    const dy = Math.abs(playerY - shrine.y);

    // Hitbox-Check
    if (dx < SHRINE_HITBOX.width / 2 + playerSize / 2 &&
        dy < SHRINE_HITBOX.height / 2 + playerSize / 2) {
      return shrine;
    }
  }
  return null;
}
```

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `lib/constants.ts` | RoomType erweitern, SHRINE Konstanten |
| `lib/dungeon/generation.ts` | assignRoomTypes() erweitern |
| `lib/Shrine.ts` | **NEU**: Shrine Interface & Logik |
| `lib/game/DungeonManager.ts` | shrines Array, createShrines() |
| `lib/physics/CollisionDetector.ts` | checkShrineCollision() |
| `lib/rendering/GameRenderer.ts` | Schrein-Rendering |
| `public/Assets/shrine.png` | **NEU**: Schrein-Sprite |

---

**Nächster Schritt**: [02_Interaktion.md](./02_Interaktion.md) - E-Taste und Klick-Handling
