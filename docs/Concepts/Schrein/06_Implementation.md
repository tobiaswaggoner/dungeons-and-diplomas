# Implementation: Technische Umsetzungsreihenfolge

## Übersicht

Dieses Dokument beschreibt die empfohlene Reihenfolge für die Implementierung des Schrein-Features. Die Schritte sind so angeordnet, dass jeder Schritt auf dem vorherigen aufbaut.

## Phase 1: Grundlagen (Schritt 1-3)

### Schritt 1: TypeScript-Typen & Konstanten

**Dateien**: `lib/constants.ts`

**Aufgaben**:
1. RoomType um `'shrine'` erweitern
2. Shrine-Interface definieren
3. Buff-Typen definieren
4. Player-Interface um Buffs erweitern
5. Konstanten hinzufügen

```typescript
// Neue Typen
export type RoomType = 'empty' | 'treasure' | 'combat' | 'shrine';

export interface Shrine {
  id: number;
  x: number;
  y: number;
  roomId: number;
  isActivated: boolean;
  isActive: boolean;
  spawnedEnemies: number[];
  defeatedEnemies: number[];
}

export type BuffType =
  | 'hp_boost'
  | 'shield'
  | 'time_bonus'
  | 'damage_boost'
  | 'damage_reduction'
  | 'regen';

export interface Buff {
  type: BuffType;
  name: string;
  description: string;
  icon: string;
  value?: number;
  // ... weitere buff-spezifische Felder
}

export interface PlayerBuffs {
  maxHpBonus: number;
  hasShield: boolean;
  maxShield: number;
  currentShield: number;
  shieldRegenRate: number;
  timeBonus: number;
  damageBoost: number;
  damageReduction: number;
  regenRate: number;
  regenInterval: number;
  activeBuffs: BuffType[];
}

// Konstanten
export const SHRINE_SPAWN_CHANCE = 0.10;
export const SHRINE_INTERACTION_RADIUS = 1.5;
export const SHRINE_MIN_ROOM_SIZE = 5;
export const SHRINE_ENEMY_SPAWN_RADIUS = 2.0;
```

**Testbar**: Kompiliert ohne Fehler ✓

---

### Schritt 2: Shrine Entity erstellen

**Dateien**: `lib/Shrine.ts` (NEU)

**Aufgaben**:
1. Shrine-Klasse erstellen
2. Factory-Funktion für Schrein-Erstellung
3. Hilfsfunktionen (Position, Distanz)

```typescript
// lib/Shrine.ts
import { Shrine, Room, SHRINE_HITBOX } from './constants';

export function createShrine(id: number, room: Room): Shrine {
  return {
    id,
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2),
    roomId: room.id,
    isActivated: false,
    isActive: false,
    spawnedEnemies: [],
    defeatedEnemies: [],
  };
}

export function getShrineDistance(
  shrine: Shrine,
  x: number,
  y: number
): number {
  const dx = shrine.x - x;
  const dy = shrine.y - y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isShrineInteractable(shrine: Shrine): boolean {
  return !shrine.isActivated && !shrine.isActive;
}
```

**Testbar**: Unit-Tests für Hilfsfunktionen ✓

---

### Schritt 3: Dungeon-Generation erweitern

**Dateien**: `lib/dungeon/generation.ts`, `lib/game/DungeonManager.ts`

**Aufgaben**:
1. assignRoomTypes() um Schrein erweitern
2. createShrines() Funktion hinzufügen
3. DungeonState um shrines Array erweitern

```typescript
// lib/dungeon/generation.ts
function assignRoomTypes(rooms: Room[], startRoomId: number): void {
  rooms.forEach((room, index) => {
    if (index === startRoomId) {
      room.type = 'empty';
      return;
    }

    // Mindestgröße für Schrein
    const canHaveShrine = room.width >= SHRINE_MIN_ROOM_SIZE &&
                          room.height >= SHRINE_MIN_ROOM_SIZE;

    const roll = Math.random();

    if (roll < SHRINE_SPAWN_CHANCE && canHaveShrine) {
      room.type = 'shrine';
    } else if (roll < 0.20) {
      room.type = 'treasure';
    } else if (roll < 0.30) {
      room.type = 'combat';
    } else {
      room.type = 'empty';
    }
  });
}
```

**Testbar**: Dungeon-Generation zeigt shrine Räume ✓

---

## Phase 2: Rendering (Schritt 4-5)

### Schritt 4: Schrein-Sprite erstellen/einbinden

**Dateien**: `public/Assets/shrine.png`, `lib/constants.ts`

**Aufgaben**:
1. Schrein-Sprite erstellen oder Placeholder
2. Sprite-Konfiguration in constants.ts
3. SpriteSheetLoader erweitern (falls nötig)

**Option A**: Statisches Bild (einfacher)
```
public/Assets/shrine.png (96x96 Pixel)
```

**Option B**: Animiertes Spritesheet
```
public/Assets/shrine.png (96x384 Pixel, 4 Frames)
```

**Testbar**: Sprite lädt ohne Fehler ✓

---

### Schritt 5: Schrein-Rendering

**Dateien**: `lib/rendering/GameRenderer.ts`

**Aufgaben**:
1. Schrein-Sprite laden
2. renderShrine() Funktion
3. In render() aufrufen
4. Interaktions-Hinweis rendern

```typescript
// lib/rendering/GameRenderer.ts
private renderShrines(shrines: Shrine[], playerX: number, playerY: number): void {
  for (const shrine of shrines) {
    if (!this.isVisible(shrine.x, shrine.y)) continue;

    const screenX = (shrine.x - this.cameraX) * TILE_SIZE;
    const screenY = (shrine.y - this.cameraY) * TILE_SIZE;

    // Schrein zeichnen
    if (shrine.isActivated) {
      this.ctx.globalAlpha = 0.5; // Benutzt = ausgegraut
    }
    this.ctx.drawImage(this.shrineSprite, screenX - 16, screenY - 32, 96, 96);
    this.ctx.globalAlpha = 1;

    // Interaktions-Hinweis
    const distance = getShrineDistance(shrine, playerX, playerY);
    if (distance <= SHRINE_INTERACTION_RADIUS && !shrine.isActivated) {
      this.renderInteractionHint(screenX, screenY);
    }
  }
}
```

**Testbar**: Schrein ist im Spiel sichtbar ✓

---

## Phase 3: Interaktion (Schritt 6-7)

### Schritt 6: Kollision & Blockierung

**Dateien**: `lib/physics/CollisionDetector.ts`, `lib/game/GameEngine.ts`

**Aufgaben**:
1. Schrein-Kollision hinzufügen
2. Spieler kann nicht durch Schrein laufen
3. Proximity-Check Funktion

```typescript
// lib/physics/CollisionDetector.ts
export function checkShrineCollision(
  x: number,
  y: number,
  playerSize: number,
  shrines: Shrine[]
): boolean {
  for (const shrine of shrines) {
    const dx = Math.abs(x - shrine.x);
    const dy = Math.abs(y - shrine.y);

    if (dx < 0.75 + playerSize / 2 && dy < 0.75 + playerSize / 2) {
      return true; // Kollision
    }
  }
  return false;
}
```

**Testbar**: Spieler stoppt vor Schrein ✓

---

### Schritt 7: E-Taste & Klick-Interaktion

**Dateien**: `hooks/useGameState.ts`, `components/GameCanvas.tsx`

**Aufgaben**:
1. E-Taste Event-Handler
2. Canvas Click-Handler
3. activateShrine() Funktion (Stub)

```typescript
// hooks/useGameState.ts
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  // ... bestehender Code

  if (e.key === 'e' || e.key === 'E') {
    const nearestShrine = findNearestInteractableShrine(
      player.x,
      player.y,
      dungeonState.shrines
    );

    if (nearestShrine) {
      activateShrine(nearestShrine);
    }
  }
}, [player, dungeonState.shrines]);
```

**Testbar**: E-Taste löst Aktion aus (Console-Log) ✓

---

## Phase 4: Gegner-System (Schritt 8-9)

### Schritt 8: Schrein-Gegner spawnen

**Dateien**: `hooks/useGameState.ts`, `lib/Enemy.ts`

**Aufgaben**:
1. spawnShrineEnemies() implementieren
2. Spawn-Positionen berechnen
3. Gegner mit sofortigem Aggro

```typescript
function spawnShrineEnemies(shrine: Shrine): void {
  const room = rooms[shrine.roomId];
  const count = Math.random() < 0.5 ? 1 : 2;
  const positions = calculateSpawnPositions(shrine, player, count, room);
  const subjects = selectRandomSubjects(count);

  positions.forEach((pos, i) => {
    const enemy = new Enemy(
      pos.x,
      pos.y,
      room,
      calculateShrineEnemyLevel(),
      subjects[i]
    );
    enemy.setState('following'); // Sofort Aggro
    enemies.push(enemy);
    shrine.spawnedEnemies.push(enemy.id);
  });

  shrine.isActive = true;
}
```

**Testbar**: Gegner erscheinen nach Aktivierung ✓

---

### Schritt 9: Schrein-Kampf-Tracking

**Dateien**: `hooks/useCombat.ts`

**Aufgaben**:
1. onEnemyDefeated() erweitern
2. Prüfen ob Schrein-Gegner
3. onShrineComplete() aufrufen

```typescript
// In useCombat.ts oder useGameState.ts
function handleEnemyDefeated(enemy: Enemy): void {
  // Ist es ein Schrein-Gegner?
  const shrine = shrines.find(s =>
    s.spawnedEnemies.includes(enemy.id)
  );

  if (shrine) {
    shrine.defeatedEnemies.push(enemy.id);

    // Alle besiegt?
    if (shrine.defeatedEnemies.length >= shrine.spawnedEnemies.length) {
      shrine.isComplete = true;
      shrine.isActive = false;
      openBuffModal();
    }
  }

  // Gegner entfernen
  removeEnemy(enemy);
}
```

**Testbar**: Buff-Modal öffnet nach Sieg ✓

---

## Phase 5: Buff-System (Schritt 10-12)

### Schritt 10: Buff-Modal UI

**Dateien**: `components/ShrineBuffModal.tsx` (NEU), `components/BuffCard.tsx` (NEU)

**Aufgaben**:
1. Modal-Komponente erstellen
2. BuffCard-Komponente erstellen
3. Styling (Tailwind)

```tsx
// components/ShrineBuffModal.tsx
export function ShrineBuffModal({
  isOpen,
  buffOptions,
  activeBuffs,
  onSelectBuff
}: ShrineBuffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-2 border-yellow-500/50 rounded-xl p-8 max-w-[600px]">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">
          ✨ Schrein-Belohnung ✨
        </h2>
        <p className="text-gray-300 text-center mb-8">
          Wähle eine Verstärkung
        </p>

        <div className="flex justify-center gap-8">
          {buffOptions.map((buff) => (
            <BuffCard
              key={buff.type}
              buff={buff}
              onSelect={() => onSelectBuff(buff)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Testbar**: Modal erscheint mit 2 Buff-Optionen ✓

---

### Schritt 11: Buff-Anwendung

**Dateien**: `lib/buffs.ts` (NEU), `hooks/useGameState.ts`

**Aufgaben**:
1. applyBuff() Funktion
2. Buff-Pool definieren
3. selectRandomBuffs() Funktion
4. Player-State updaten

```typescript
// lib/buffs.ts
export const BUFF_POOL: Buff[] = [
  {
    type: 'hp_boost',
    name: 'Vitalität',
    description: '+25 Maximale HP',
    icon: '❤️',
    value: 25,
  },
  {
    type: 'shield',
    name: 'Schutzschild',
    description: '20 Schild-HP, regeneriert 2/s',
    icon: '🛡️',
    maxShield: 20,
    regenRate: 2,
  },
  // ... weitere Buffs
];

export function applyBuff(player: Player, buff: Buff): void {
  player.buffs.activeBuffs.push(buff.type);

  switch (buff.type) {
    case 'hp_boost':
      player.maxHp += buff.value!;
      player.hp += buff.value!;
      break;
    case 'shield':
      player.buffs.hasShield = true;
      player.buffs.maxShield += buff.maxShield!;
      player.buffs.currentShield = player.buffs.maxShield;
      break;
    // ... weitere Cases
  }
}
```

**Testbar**: Buff wird angewendet, Stats ändern sich ✓

---

### Schritt 12: Schild & Regen im Game-Loop

**Dateien**: `lib/game/GameEngine.ts`

**Aufgaben**:
1. Schild-Regeneration pro Frame
2. HP-Regeneration pro Tick
3. Schild bei Schaden berücksichtigen

```typescript
// In GameEngine update()
function updatePlayerBuffs(player: Player, deltaTime: number): void {
  // Schild-Regeneration
  if (player.buffs.hasShield &&
      player.buffs.currentShield < player.buffs.maxShield) {
    player.buffs.currentShield = Math.min(
      player.buffs.maxShield,
      player.buffs.currentShield + player.buffs.shieldRegenRate * deltaTime
    );
  }

  // HP-Regeneration
  if (player.buffs.regenRate > 0) {
    regenTimer += deltaTime;
    if (regenTimer >= player.buffs.regenInterval) {
      player.hp = Math.min(player.maxHp, player.hp + player.buffs.regenRate);
      regenTimer = 0;
    }
  }
}
```

**Testbar**: Schild regeneriert, HP regeneriert ✓

---

## Phase 6: Integration (Schritt 13-15)

### Schritt 13: Combat-Modifikatoren

**Dateien**: `hooks/useCombat.ts`

**Aufgaben**:
1. Zeit-Bonus anwenden
2. Schadens-Boost anwenden
3. Schadens-Reduktion anwenden

```typescript
// In useCombat.ts
const effectiveTimeLimit = COMBAT_TIME_LIMIT + player.buffs.timeBonus;

function applyDamageToEnemy(damage: number): void {
  const totalDamage = damage + player.buffs.damageBoost;
  enemy.hp -= totalDamage;
}

function applyDamageToPlayer(damage: number): void {
  const reducedDamage = Math.max(5, damage - player.buffs.damageReduction);
  applyDamageWithShield(player, reducedDamage);
}
```

**Testbar**: Buffs wirken im Kampf ✓

---

### Schritt 14: HP-Leisten UI Update

**Dateien**: `components/CharacterPanel.tsx`, `lib/rendering/GameRenderer.ts`

**Aufgaben**:
1. Schild-Leiste im CharacterPanel
2. Schild-Leiste über Spieler-Sprite
3. Aktive Buffs anzeigen

```tsx
// In CharacterPanel.tsx
{player.buffs.hasShield && (
  <div className="shield-bar mt-1">
    <div className="bg-gray-700 h-3 rounded">
      <div
        className="bg-blue-500 h-3 rounded"
        style={{
          width: `${(player.buffs.currentShield / player.buffs.maxShield) * 100}%`
        }}
      />
    </div>
    <span className="text-xs text-blue-400">
      {Math.floor(player.buffs.currentShield)}/{player.buffs.maxShield}
    </span>
  </div>
)}
```

**Testbar**: Schild-Leiste sichtbar und aktualisiert sich ✓

---

### Schritt 15: Polishing & Edge Cases

**Aufgaben**:
1. Spieler-Tod während Schrein-Kampf
2. Spiel pausieren während Buff-Modal
3. Schrein im Minimap anzeigen
4. Toast-Notifications
5. Animationen

**Edge Cases**:
- Spieler flieht aus Raum → Gegner bleiben
- Spieler stirbt → Schrein reset, erneut versuchbar
- Alle Gegner besiegt aber Spieler tot → kein Buff

**Testbar**: Alle Edge Cases funktionieren ✓

---

## Zusammenfassung: Datei-Änderungen

### Neue Dateien

| Datei | Phase |
|-------|-------|
| `lib/Shrine.ts` | Phase 1 |
| `lib/buffs.ts` | Phase 5 |
| `components/ShrineBuffModal.tsx` | Phase 5 |
| `components/BuffCard.tsx` | Phase 5 |
| `public/Assets/shrine.png` | Phase 2 |

### Geänderte Dateien

| Datei | Änderungen |
|-------|------------|
| `lib/constants.ts` | Typen, Konstanten, Player-Interface |
| `lib/dungeon/generation.ts` | Schrein-Rooms |
| `lib/game/DungeonManager.ts` | shrines Array |
| `lib/game/GameEngine.ts` | Buff-Updates |
| `lib/physics/CollisionDetector.ts` | Schrein-Kollision |
| `lib/rendering/GameRenderer.ts` | Schrein-Rendering |
| `lib/rendering/MinimapRenderer.ts` | Schrein auf Minimap |
| `lib/Enemy.ts` | isFromShrine Flag |
| `hooks/useGameState.ts` | Interaktion, Spawning |
| `hooks/useCombat.ts` | Modifikatoren, Tracking |
| `components/GameCanvas.tsx` | Click-Handler, Modal |
| `components/CharacterPanel.tsx` | Schild-Leiste, Buffs |

---

## Geschätzter Aufwand pro Phase

| Phase | Beschreibung | Komplexität |
|-------|--------------|-------------|
| Phase 1 | Grundlagen | ⭐ Einfach |
| Phase 2 | Rendering | ⭐⭐ Mittel |
| Phase 3 | Interaktion | ⭐⭐ Mittel |
| Phase 4 | Gegner-System | ⭐⭐⭐ Komplex |
| Phase 5 | Buff-System | ⭐⭐⭐ Komplex |
| Phase 6 | Integration | ⭐⭐ Mittel |

---

## Empfohlene Vorgehensweise

1. **Phase 1-2 zusammen** - Typen + Rendering (sichtbarer Fortschritt)
2. **Phase 3** - Interaktion (E-Taste funktioniert)
3. **Phase 4** - Gegner spawnen (Kern-Gameplay)
4. **Phase 5** - Buff-System (Belohnungen)
5. **Phase 6** - Integration & Polish

**Tipp**: Nach jeder Phase testen! Nicht alles auf einmal implementieren.

---

**Erstellt**: 2025-11-27
**Status**: Bereit zur Implementation
