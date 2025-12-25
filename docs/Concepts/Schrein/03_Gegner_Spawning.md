# Gegner-Spawning bei Schrein-Aktivierung

## Übersicht

Nach Aktivierung eines Schreins erscheinen 1-2 Gegner, die der Spieler im Quiz-Kampf besiegen muss. Erst nach dem Sieg erhält der Spieler Zugang zum Buff-Menü.

## Anzahl der Gegner

```typescript
const SHRINE_MIN_ENEMIES = 1;
const SHRINE_MAX_ENEMIES = 2;

function getRandomEnemyCount(): number {
  return Math.random() < 0.5 ? 1 : 2; // 50/50 Chance
}
```

### Balancing-Überlegung

- **1 Gegner**: Einfacher, schneller Buff
- **2 Gegner**: Mehr Risiko, aber gleiche Belohnung

**Alternative**: 2 Gegner könnten bessere Buffs freischalten (für später).

## Spawn-Positionen

### Um den Schrein herum

Gegner spawnen in einem Radius um den Schrein, aber nicht direkt auf dem Spieler.

```typescript
const SHRINE_ENEMY_SPAWN_RADIUS = 2.0; // Tiles vom Schrein-Zentrum
const MIN_PLAYER_DISTANCE = 1.5;       // Minimum-Abstand zum Spieler

interface SpawnPosition {
  x: number;
  y: number;
}

function calculateEnemySpawnPositions(
  shrine: Shrine,
  playerX: number,
  playerY: number,
  enemyCount: number,
  room: Room
): SpawnPosition[] {
  const positions: SpawnPosition[] = [];
  const angleStep = (2 * Math.PI) / enemyCount;
  const startAngle = Math.random() * Math.PI * 2; // Zufälliger Start

  for (let i = 0; i < enemyCount; i++) {
    let angle = startAngle + (i * angleStep);
    let attempts = 0;
    let validPosition = false;

    while (!validPosition && attempts < 8) {
      const x = shrine.x + Math.cos(angle) * SHRINE_ENEMY_SPAWN_RADIUS;
      const y = shrine.y + Math.sin(angle) * SHRINE_ENEMY_SPAWN_RADIUS;

      // Prüfungen
      const inRoom = isPositionInRoom(x, y, room);
      const notOnPlayer = getDistance(x, y, playerX, playerY) >= MIN_PLAYER_DISTANCE;
      const notOnShrine = getDistance(x, y, shrine.x, shrine.y) >= 1.0;

      if (inRoom && notOnPlayer && notOnShrine) {
        positions.push({ x, y });
        validPosition = true;
      } else {
        angle += Math.PI / 4; // 45° drehen und erneut versuchen
        attempts++;
      }
    }

    // Fallback: Nächste freie Position im Raum
    if (!validPosition) {
      positions.push(findFallbackPosition(room, shrine, playerX, playerY));
    }
  }

  return positions;
}
```

### Spawn-Visualisierung

```
        [E1]
          ○
    ┌─────────────┐
    │             │
    │   [SHRINE]  │
    │      ▲      │
    │             │
    │        [P]  │
    └─────────────┘
          ○
        [E2]

E1, E2 = Gegner-Spawn-Positionen (gegenüberliegend)
P = Spieler
▲ = Schrein
```

## Gegner-Konfiguration

### Level-Bestimmung

Schrein-Gegner haben ein Level basierend auf:
1. Durchschnittliches Spieler-ELO
2. Dungeon-Fortschritt (wie viele Räume erkundet)
3. Zufällige Variation

```typescript
function determineShrineEnemyLevel(
  playerAverageElo: number,
  roomsExplored: number,
  totalRooms: number
): number {
  // Basis-Level aus ELO (1-10 Skala)
  const eloBasedLevel = Math.max(1, Math.round(playerAverageElo));

  // Fortschritts-Bonus (0-2 Level extra)
  const progressBonus = Math.floor((roomsExplored / totalRooms) * 2);

  // Zufällige Variation (-1 bis +1)
  const variation = Math.floor(Math.random() * 3) - 1;

  // Final Level (1-10 clamped)
  return Math.max(1, Math.min(10, eloBasedLevel + progressBonus + variation));
}
```

### Fach-Auswahl

```typescript
const SUBJECTS = ['mathe', 'chemie', 'physik'];

function selectEnemySubjects(enemyCount: number): string[] {
  const subjects: string[] = [];

  for (let i = 0; i < enemyCount; i++) {
    // Zufälliges Fach, aber versuche Duplikate zu vermeiden
    let subject: string;
    do {
      subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    } while (subjects.includes(subject) && subjects.length < SUBJECTS.length);

    subjects.push(subject);
  }

  return subjects;
}
```

**Beispiel bei 2 Gegnern**:
- Gegner 1: Mathe (Level 5)
- Gegner 2: Physik (Level 6)

## Spawn-Prozess

### Sequenz

```typescript
async function spawnShrineEnemies(shrine: Shrine): Promise<Enemy[]> {
  const room = getRoomById(shrine.roomId);
  const enemyCount = getRandomEnemyCount();
  const positions = calculateEnemySpawnPositions(
    shrine,
    player.x,
    player.y,
    enemyCount,
    room
  );
  const subjects = selectEnemySubjects(enemyCount);

  const newEnemies: Enemy[] = [];

  for (let i = 0; i < enemyCount; i++) {
    // Spawn-Animation (optional: Verzögerung zwischen Gegnern)
    await playSpawnAnimation(positions[i]);

    const level = determineShrineEnemyLevel(
      playerAverageElo,
      exploredRoomCount,
      totalRoomCount
    );

    const enemy = new Enemy(
      positions[i].x,
      positions[i].y,
      room,
      level,
      subjects[i]
    );

    // Sofort Aggro auf Spieler
    enemy.setState('following');

    newEnemies.push(enemy);
  }

  // Zu globalem Enemy-Array hinzufügen
  dungeonState.enemies.push(...newEnemies);

  // Schrein-spezifische Referenz speichern
  shrine.spawnedEnemies = newEnemies.map(e => e.id);

  return newEnemies;
}
```

### Spawn-Animation

```
Frame 1: Leuchtender Kreis erscheint
Frame 2: Kreis wird größer, Partikel
Frame 3: Gegner materialisiert (50% Opacity)
Frame 4: Gegner voll sichtbar
Dauer: ~400ms
```

## Kampf-Tracking

### Schrein-Kampf vs. Normaler Kampf

```typescript
interface ShrineState {
  // ... bestehende Felder
  spawnedEnemies: number[];     // IDs der gespawnten Gegner
  defeatedEnemies: number[];    // IDs der besiegten Gegner
  isComplete: boolean;          // Alle Gegner besiegt?
}
```

### Gegner-Tod Handler

```typescript
function onEnemyDefeated(enemy: Enemy): void {
  // Ist dieser Gegner Teil eines Schrein-Kampfes?
  const shrine = findShrineByEnemy(enemy.id);

  if (shrine) {
    shrine.defeatedEnemies.push(enemy.id);

    // Alle Schrein-Gegner besiegt?
    if (shrine.defeatedEnemies.length >= shrine.spawnedEnemies.length) {
      onShrineComplete(shrine);
    }
  }

  // Normaler Gegner-Tod (entfernen aus Array, etc.)
  removeEnemy(enemy);
}

function onShrineComplete(shrine: Shrine): void {
  shrine.isComplete = true;
  shrine.isActive = false;
  shrine.isActivated = true; // Kann nicht erneut benutzt werden

  // Buff-Auswahl-Menü öffnen
  openBuffSelectionModal(shrine);
}
```

## Spieler-Tod während Schrein-Kampf

### Szenario: Spieler stirbt

```typescript
function onPlayerDeath(): void {
  const activeShrine = findActiveShrine();

  if (activeShrine) {
    // Schrein zurücksetzen (kann erneut versucht werden)
    activeShrine.isActive = false;
    activeShrine.spawnedEnemies = [];
    activeShrine.defeatedEnemies = [];

    // Gespawnte Gegner entfernen
    removeEnemiesById(activeShrine.spawnedEnemies);
  }

  // Normaler Game-Over Prozess
  handleGameOver();
}
```

**Design-Entscheidung**: Nach Tod kann Spieler Schrein erneut versuchen (Schrein nicht "verbraucht").

## Gegner-Verhalten

### Sofortiges Aggro

Im Gegensatz zu normalen Gegnern:
- Schrein-Gegner starten sofort im `FOLLOWING` State
- Kein `IDLE` oder `WANDERING` am Anfang
- Bewegen sich direkt auf Spieler zu

```typescript
// In Enemy-Konstruktor oder nach Spawn
if (isFromShrine) {
  this.state = 'following';
  this.target = player;
}
```

### Raum-Beschränkung

Schrein-Gegner verlassen den Raum **nicht**:
- Bleiben immer im Schrein-Raum
- Wenn Spieler flieht → Gegner bleiben am Raum-Rand
- Schrein bleibt aktiv bis alle Gegner besiegt

## Visuelle Unterscheidung

### Schrein-Gegner Markierung

Optional: Schrein-Gegner haben visuellen Indikator:
- Leuchtender Rand (gleiche Farbe wie Schrein)
- Kleines Schrein-Symbol über Kopf
- Oder: Keine Unterscheidung (für Simplizität)

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `lib/Shrine.ts` | spawnedEnemies, defeatedEnemies Arrays |
| `lib/Enemy.ts` | isFromShrine Flag, sofortiges Aggro |
| `hooks/useGameState.ts` | spawnShrineEnemies(), onEnemyDefeated() |
| `hooks/useCombat.ts` | Schrein-Kampf-Tracking |
| `lib/constants.ts` | SHRINE_ENEMY Konstanten |

---

**Nächster Schritt**: [04_Buff_System.md](./04_Buff_System.md) - Welche Buffs gibt es und wie wirken sie?
