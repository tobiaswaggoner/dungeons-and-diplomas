# Delayed Room Spawn - Konzept

**Erstellt:** 2025-12-12
**Status:** Geplant
**Autor:** Michi

---

## Übersicht

Gegner spawnen nicht mehr beim Dungeon-Start, sondern erst **5 Sekunden nach dem ersten Betreten** eines Combat-Raums. Die Gegner erscheinen in der Raummitte mit visuellen und akustischen Effekten.

---

## Kernfunktionen

### Spawn-Mechanik

| Aspekt | Beschreibung |
|--------|--------------|
| **Trigger** | Spieler betritt einen Combat-Raum zum ersten Mal |
| **Verzögerung** | 5 Sekunden nach Betreten |
| **Spawn-Position** | Mitte des Raums |
| **Raumtypen** | Nur `combat`-Räume (nicht: empty, treasure, shrine) |
| **Einmalig** | Jeder Raum spawnt nur einmal Gegner - bereits betretene Räume spawnen keine neuen |
| **Startraum** | Im Startraum des Spielers spawnen keine Gegner |

### Gegner-Konfiguration

| Aspekt | Beschreibung |
|--------|--------------|
| **Typen** | Beide: Quiz-Gegner (Enemy) + Trashmobs |
| **Anzahl** | 1-2 zufällig pro Raum |
| **Verhalten nach Spawn** | Warten im Raum (idle), greifen nicht sofort an |
| **Aggro** | Normale AI-Regeln (Aggro-Radius) nachdem sie gespawnt sind |

### Timer-Verhalten

| Situation | Verhalten |
|-----------|-----------|
| Spieler bleibt im Raum | Gegner spawnen nach 5 Sek. |
| Spieler verlässt Raum vor 5 Sek. | Timer läuft weiter, Gegner spawnen trotzdem |
| Spieler betritt Raum erneut | Kein neuer Spawn (Raum bereits "aktiviert") |

---

## Visuelle Effekte

### 1. Boden-Risse (Vorwarnung)

- **Zeitpunkt:** Erscheinen sofort wenn Timer startet (beim Betreten)
- **Aussehen:** Schwarze/dunkle Risse im Boden
- **Position:** In der Raummitte, dort wo Gegner spawnen werden
- **Dauer:** Sichtbar während der gesamten 5 Sekunden
- **Animation:** Können sich langsam ausbreiten/größer werden

```
Visuelles Konzept:
    ╔═══════════════╗
    ║               ║
    ║    ╲ │ ╱      ║
    ║   ──┼─┼──     ║  <- Schwarze Risse
    ║    ╱ │ ╲      ║
    ║               ║
    ╚═══════════════╝
```

### 2. Spawn-Effekt (Rauch/Explosion)

- **Zeitpunkt:** Exakt wenn Gegner erscheinen (nach 5 Sek.)
- **Effekt:** Rauch-/Explosions-Partikel
- **Farbe:** Dunkelgrau/Schwarz passend zu den Rissen
- **Dauer:** Ca. 0.5-1 Sekunde
- **Verhalten:** Partikel verteilen sich nach außen

### 3. Kein Timer-UI

- Keine sichtbare Countdown-Anzeige
- Spieler muss die Boden-Risse als Hinweis interpretieren

---

## Audio-Design

### Kontinuierlicher Aufbau-Sound

| Phase | Sound-Beschreibung |
|-------|-------------------|
| **0-2 Sek.** | Leises Rumoren/Grollen unter dem Boden |
| **2-4 Sek.** | Intensität steigt, Risse "knirschen" |
| **4-5 Sek.** | Crescendo, Spannung baut sich auf |
| **Spawn** | Kurzer lauter "Whoosh" oder Explosions-Sound |

**Sound-Charakteristik:**
- Atmosphärisch und bedrohlich
- Gibt dem Spieler Zeit sich vorzubereiten
- Deutlich hörbar auch wenn Spieler den Raum verlassen hat

---

## Technische Implementierung

### Neue Datenstrukturen

```typescript
// Raum-Spawn-Status
interface RoomSpawnState {
  roomId: number;
  isActivated: boolean;      // true wenn Spieler den Raum betreten hat
  spawnTimerStart: number;   // Timestamp wann Timer gestartet
  hasSpawned: boolean;       // true wenn Gegner bereits gespawnt
}

// Spawn-Timer-Manager
interface DelayedSpawnManager {
  activeTimers: Map<number, RoomSpawnState>;  // roomId -> state
  spawnDelay: number;  // 5000ms
}
```

### Betroffene Dateien

| Datei | Änderungen |
|-------|------------|
| `lib/constants.ts` | Neue Konstanten: `ROOM_SPAWN_DELAY`, `ROOM_SPAWN_MIN_ENEMIES`, `ROOM_SPAWN_MAX_ENEMIES` |
| `lib/game/DelayedSpawnManager.ts` | **NEU** - Manager für verzögerte Spawns |
| `lib/game/EntitySpawner.ts` | Neue Funktion `spawnDelayedRoomEnemies()` |
| `lib/game/GameEngine.ts` | Raum-Betreten-Detection, Timer-Updates |
| `lib/game/DungeonManager.ts` | Integration des DelayedSpawnManager |
| `hooks/useGameState.ts` | Update-Loop für Spawn-Timer |
| `lib/effects/` | Neue Effekte: `CrackEffect`, `SpawnSmokeEffect` |
| `lib/rendering/GameRenderer.ts` | Rendering der Boden-Risse |

### Ablauf-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                      DELAYED SPAWN FLOW                         │
└─────────────────────────────────────────────────────────────────┘

  Spieler betritt         Timer läuft              Nach 5 Sek.
  Combat-Raum            (5 Sekunden)             Spawn Gegner
       │                      │                        │
       ▼                      ▼                        ▼
  ┌─────────┐           ┌─────────┐             ┌─────────┐
  │ Check:  │           │ Zeige   │             │ Spawn   │
  │ Bereits │──NEIN──▶  │ Boden-  │──────────▶  │ 1-2     │
  │ besucht?│           │ Risse   │             │ Gegner  │
  └─────────┘           └─────────┘             └─────────┘
       │                      │                        │
      JA                 Spiele                   Rauch-
       │                 Sound                   Effekt
       ▼                      │                        │
  ┌─────────┐                 │                        ▼
  │ Nichts  │                 │                 ┌─────────┐
  │ tun     │                 │                 │ Markiere│
  └─────────┘                 │                 │ Raum    │
                              │                 │ als     │
                              │                 │"spawned"│
                              ▼                 └─────────┘
                    ┌─────────────────┐
                    │ Spieler verlässt│
                    │ Raum? Timer     │
                    │ läuft weiter!   │
                    └─────────────────┘
```

### Pseudo-Code

```typescript
// In GameEngine.update() oder useGameState update()

function checkRoomEntry(player, rooms, roomMap, tileSize) {
  const playerRoomId = getCurrentRoomId(player, roomMap, tileSize);

  if (playerRoomId < 0) return;

  const room = rooms[playerRoomId];

  // Nur Combat-Räume
  if (room.type !== 'combat') return;

  // Nicht der Startraum
  if (playerRoomId === playerStartRoomId) return;

  // Bereits aktiviert?
  if (delayedSpawnManager.isActivated(playerRoomId)) return;

  // Timer starten!
  delayedSpawnManager.activateRoom(playerRoomId);
  showCrackEffect(room);
  playBuildupSound();
}

function updateSpawnTimers(dt, currentTime) {
  for (const [roomId, state] of delayedSpawnManager.activeTimers) {
    if (state.hasSpawned) continue;

    const elapsed = currentTime - state.spawnTimerStart;

    if (elapsed >= ROOM_SPAWN_DELAY) {
      // Spawn!
      const enemies = spawnDelayedRoomEnemies(roomId);
      showSpawnSmokeEffect(roomId);
      playSpawnSound();
      state.hasSpawned = true;
    }
  }
}
```

---

## Konstanten

```typescript
// lib/constants.ts

// Delayed Room Spawn
export const ROOM_SPAWN_DELAY = 5000;           // 5 Sekunden in ms
export const ROOM_SPAWN_MIN_ENEMIES = 1;        // Minimum Gegner pro Raum
export const ROOM_SPAWN_MAX_ENEMIES = 2;        // Maximum Gegner pro Raum
export const ROOM_SPAWN_TRASHMOB_CHANCE = 0.5;  // 50% Chance für Trashmob statt Quiz-Gegner
```

---

## Implementierungs-Schritte

### Phase 1: Grundgerüst
1. Neue Konstanten in `constants.ts` hinzufügen
2. `DelayedSpawnManager` Klasse erstellen
3. Raum-Betreten-Detection in `GameEngine` implementieren

### Phase 2: Spawn-Logik
4. `spawnDelayedRoomEnemies()` in `EntitySpawner.ts` implementieren
5. Timer-Update-Loop in `useGameState` integrieren
6. Bestehende Spawn-Logik anpassen (keine Gegner beim Start in Combat-Räumen)

### Phase 3: Visuelle Effekte
7. `CrackEffect` Partikel-System erstellen
8. `SpawnSmokeEffect` Partikel-System erstellen
9. Crack-Rendering in `GameRenderer` einbauen

### Phase 4: Audio
10. Sound-Assets erstellen/finden (Rumoren, Spawn-Whoosh)
11. Audio-Integration mit Fade-in während der 5 Sekunden

### Phase 5: Polish & Testing
12. Balancing (Anzahl, Schwierigkeit der gespawnten Gegner)
13. Edge-Cases testen (schnelles Raum-Wechseln, mehrere Timer gleichzeitig)
14. Performance-Optimierung

---

## Offene Fragen / Zukünftige Erweiterungen

- [ ] Sollen die Boden-Risse animiert sein (langsam wachsen)?
- [ ] Verschiedene Spawn-Verzögerungen je nach Dungeon-Tiefe?
- [ ] Boss-Räume mit längerer Verzögerung und mehr Gegnern?
- [ ] Visueller Unterschied zwischen Quiz-Gegner und Trashmob-Spawn?

---

## Referenzen

- Bestehendes Shrine-System: `lib/game/EntitySpawner.ts` → `spawnShrineEnemies()`
- Partikel-System: `lib/effects/`
- Raum-Detection: `GameEngine.updateFogOfWar()`
