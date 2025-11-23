# Refactoring-Plan 2025-11-23

## Zusammenfassung

Die Codebasis zeigt typische Symptome organischen Wachstums: Duplizierter Code für API-Aufrufe, God-Files mit gemischten Verantwortlichkeiten, und manuelle State-Synchronisation zwischen Hooks. Die Architektur ist grundsätzlich solide (klare Hook-Trennung, gute Ordnerstruktur), aber es fehlen Abstraktionsschichten für API und gemeinsamen State.

## Architektur-Snapshot

```
next-app/
├── app/api/          # 19 API-Routes (inkonsistente Patterns)
├── components/       # 25 Komponenten (teils große Inline-Styles)
├── hooks/            # 6 Hooks (Ref-Synchronisation, duplizierte fetches)
└── lib/
    ├── db.ts         # GOD-FILE: 682 Zeilen (Users, Questions, Answers, XP, Levels)
    ├── Enemy.ts      # 499 Zeilen (AI, Rendering, Combat gemischt)
    ├── game/         # GameEngine + DungeonManager
    ├── combat/       # Gute Separation (QuestionSelector, DamageCalculator)
    ├── scoring/      # Gute Separation (EloCalculator, LevelCalculator)
    └── rendering/    # GameRenderer (383 Zeilen, könnte aufgeteilt werden)
```

**Datenfluss-Problem:**
```
useCombat ──fetch──> /api/session-elo
useScoring ─fetch──> /api/session-elo   (DUPLIKAT)
DungeonManager fetch> /api/session-elo  (DUPLIKAT)
GameCanvas ─fetch──> /api/questions
GameCanvas ─fetch──> /api/subjects
```

---

## Identifizierte Refactorings

### ✅ [R01] API-Service Layer extrahieren (ERLEDIGT 2025-11-23)
**Problem:** fetch-Calls sind über 6+ Dateien verstreut mit identischem Error-Handling-Pattern. Keine zentrale Stelle für API-Logik. Erschwert Mocking für Tests.

**Betroffene Dateien:**
- `hooks/useCombat.ts:72-82, 147-167, 212-222` - 3 fetch-Calls
- `hooks/useScoring.ts:17, 46` - 2 fetch-Calls
- `lib/game/DungeonManager.ts:83-106, 252` - 2 fetch-Calls
- `components/GameCanvas.tsx:37-53, 69-82` - 3 fetch-Calls

**Lösung:** Neues Modul `lib/api/` mit typisiertem API-Client:
```typescript
// lib/api/client.ts
export const api = {
  elo: { getSessionElo: (userId: number) => ... },
  questions: { getAll: () => ..., getWithElo: (subject, userId) => ... },
  answers: { log: (entry: AnswerLogEntry) => ... },
  xp: { add: (entry: XpLogEntry) => ... }
};
```

**Aufwand:** M | **Risiko:** niedrig

**Schritte:**
1. Erstelle `lib/api/client.ts` mit Basis-Fetch-Wrapper
2. Erstelle `lib/api/elo.ts`, `lib/api/questions.ts`, `lib/api/answers.ts`
3. Exportiere gebündelten Client aus `lib/api/index.ts`
4. Ersetze fetch-Calls in hooks/useCombat.ts
5. Ersetze fetch-Calls in hooks/useScoring.ts
6. Ersetze fetch-Calls in lib/game/DungeonManager.ts
7. Ersetze fetch-Calls in components/GameCanvas.tsx

---

### ✅ [R02] Dupliziertes ELO-Loading konsolidieren (ERLEDIGT 2025-11-23 via R01)
**Problem:** Drei unabhängige Implementierungen laden ELO-Daten vom selben Endpoint mit fast identischem Code.

**Betroffene Dateien:**
- `hooks/useCombat.ts:68-82` - `loadPlayerElo()`
- `hooks/useScoring.ts:15-40` - `loadSessionElos()`
- `lib/game/DungeonManager.ts:250-267` - inline in `spawnEnemies()`

**Lösung:** Nach R01: Alle drei nutzen `api.elo.getSessionElo()`. Zusätzlich: ELO-State in einem gemeinsamen Hook oder Context.

**Aufwand:** S | **Risiko:** niedrig

**Abhängigkeit:** R01

**Schritte:**
1. Identifiziere gemeinsame Datenstruktur für ELO-Response
2. Erstelle `lib/api/elo.ts` mit typisierter Funktion
3. Ersetze alle drei Implementierungen durch API-Aufruf
4. Optional: Erstelle `useEloData` Hook für Caching

---

### ✅ [R03] God-File db.ts aufteilen (ERLEDIGT 2025-11-23)
**Problem:** 682 Zeilen mit 5 verschiedenen Domänen: Users, Questions, Answers, XP, EditorLevels. Verletzt Single Responsibility. Erschert Testen einzelner Bereiche.

**Betroffene Dateien:**
- `lib/db.ts:1-682` - Gesamte Datei

**Lösung:** Aufteilen in domänenspezifische Module:
```
lib/db/
├── connection.ts    # getDatabase(), DB_PATH
├── migrations.ts    # Alle migrate*IfNeeded() Funktionen
├── users.ts         # loginUser, getUserById, User interface
├── questions.ts     # getAllQuestions, getQuestionsWithEloBySubject, etc.
├── answers.ts       # logAnswer, AnswerLogEntry
├── xp.ts            # addXp, XpLogEntry
├── editorLevels.ts  # CRUD für EditorLevel
└── index.ts         # Re-export für Backwards-Compatibility
```

**Aufwand:** L | **Risiko:** niedrig (nur Struktur, keine Logik-Änderung)

**Schritte:**
1. Erstelle `lib/db/connection.ts` mit `getDatabase()`
2. Erstelle `lib/db/migrations.ts` mit allen Migrations-Funktionen
3. Erstelle `lib/db/users.ts` (Zeilen 282-303)
4. Erstelle `lib/db/questions.ts` (Zeilen 343-464)
5. Erstelle `lib/db/answers.ts` (Zeilen 327-340)
6. Erstelle `lib/db/xp.ts` (Zeilen 306-324)
7. Erstelle `lib/db/editorLevels.ts` (Zeilen 549-681)
8. Erstelle `lib/db/index.ts` mit Re-Exports
9. Aktualisiere alle Imports in API-Routes
10. Lösche alte `lib/db.ts`

---

### ✅ [R04] Ref-Synchronisation durch Callback ersetzen (ERLEDIGT 2025-11-23)
**Problem:** GameCanvas.tsx synchronisiert manuell Refs zwischen useCombat und useGameState über useEffect. Fehleranfällig und schwer nachvollziehbar.

**Betroffene Dateien:**
- `components/GameCanvas.tsx:118-122` - useEffect für Ref-Wiring

**Lösung:** useGameState akzeptiert `startCombat`-Callback direkt als Prop statt über Ref.

**Aufwand:** S | **Risiko:** mittel (Game-Loop betroffen)

**Temporärer Test:**
- Test: Kampf wird korrekt gestartet wenn Spieler Gegner berührt
- Kann nach Refactoring gelöscht werden

**Schritte:**
1. Erweitere `UseGameStateProps` um `onStartCombat?: (enemy: Enemy) => void`
2. Entferne `inCombatRef` und `startCombatRef` aus useGameState-Return
3. Rufe `onStartCombat` in GameEngine bei Kollision auf
4. Passe GameCanvas an: übergebe `combat.startCombat` als Prop
5. Entferne useEffect-Wiring in GameCanvas

---

### ✅ [R05] Direction-Konstanten zentralisieren (ERLEDIGT 2025-11-23)
**Problem:** Direction-Arrays (`[{ dx: 0, dy: -1 }, ...]`) werden an mehreren Stellen hardcoded definiert.

**Betroffene Dateien:**
- `lib/game/GameEngine.ts:66, 106` - Direction-Array
- `lib/rendering/GameRenderer.ts:68, 96, 143` - Direction-Array (3x!)

**Lösung:** Zentrale Konstante in `lib/constants.ts`:
```typescript
export const DIRECTION_OFFSETS = [
  { dx: 0, dy: -1, dir: 'up' },
  { dx: 0, dy: 1, dir: 'down' },
  { dx: -1, dy: 0, dir: 'left' },
  { dx: 1, dy: 0, dir: 'right' }
] as const;
```

**Aufwand:** S | **Risiko:** niedrig

**Schritte:**
1. Füge `DIRECTION_OFFSETS` zu `lib/constants.ts` hinzu
2. Ersetze alle lokalen Definitionen durch Import

---

### ✅ [R06] calculateElo Deprecation abschließen (ERLEDIGT 2025-11-23)
**Problem:** Deprecated `calculateElo`-Funktion in db.ts (Zeile 397-402) existiert neben EloCalculator.ts. Zwei verschiedene ELO-Berechnungen im Code.

**Betroffene Dateien:**
- `lib/db.ts:393-402` - Deprecated calculateElo (Kommentar sagt "deprecated")

**Lösung:** Funktion entfernen, alle Aufrufer auf EloCalculator umstellen.

**Aufwand:** S | **Risiko:** niedrig

**Abhängigkeit:** R03 (db.ts aufteilen)

**Schritte:**
1. Suche nach allen Verwendungen von `calculateElo` aus db.ts
2. Ersetze durch EloCalculator-Funktionen
3. Entferne die deprecated Funktion

---

### ✅ [R07] loadUserXp in useAuth integrieren (ERLEDIGT 2025-11-23)
**Problem:** `loadUserXp` in GameCanvas.tsx ruft `/api/auth/login` erneut auf, obwohl useAuth bereits Login handhabt. Duplizierte Login-Logik.

**Betroffene Dateien:**
- `components/GameCanvas.tsx:67-82` - `loadUserXp()` macht redundanten Login-Call

**Lösung:** useAuth sollte XP als Teil des User-States zurückgeben.

**Aufwand:** S | **Risiko:** niedrig

**Schritte:**
1. Erweitere useAuth um `userXp` State
2. Lade XP beim Login mit
3. Exponiere `userXp` und `setUserXp` aus useAuth
4. Entferne `loadUserXp` aus GameCanvas
5. Aktualisiere `handleXpGained` um `setUserXp` zu nutzen

---

### ✅ [R08] DungeonManager.spawnEnemies Pure Function extrahieren (ERLEDIGT 2025-11-23)
**Problem:** `spawnEnemies` (Zeilen 238-366) hat Side-Effects (fetch, this.enemies mutieren) und ist 130 Zeilen lang. Schwer testbar.

**Betroffene Dateien:**
- `lib/game/DungeonManager.ts:238-366` - `spawnEnemies()`

**Lösung:** Extrahiere pure Funktion `calculateEnemySpawns()` die nur die Spawn-Positionen und Parameter berechnet. DungeonManager ruft diese auf und erstellt dann die Enemies.

**Aufwand:** M | **Risiko:** mittel

**Abhängigkeit:** R01 (API-Service Layer)

**Schritte:**
1. Erstelle `lib/spawning/EnemySpawnCalculator.ts`
2. Extrahiere pure Funktion `calculateEnemySpawns(rooms, playerRoom, subjectWeights, subjectElos, spawnRng)`
3. Return-Typ: `EnemySpawnConfig[]` mit Position, Subject, Level
4. DungeonManager lädt ELO via API, ruft Calculator auf, erstellt Enemies

---

### [R09] Combat-State-Machine extrahieren
**Problem:** useCombat verwaltet komplexen State-Flow (idle → combat → question → feedback → next/end) mit vielen Refs und Timeouts. Schwer nachvollziehbar.

**Betroffene Dateien:**
- `hooks/useCombat.ts:1-278` - Gesamter Hook

**Lösung:** Extrahiere State-Machine-Logik in separate Pure Function:
```typescript
type CombatState = 'idle' | 'loading' | 'question' | 'feedback' | 'victory' | 'defeat';
type CombatAction = 'START' | 'QUESTION_LOADED' | 'ANSWER' | 'TIMEOUT' | 'NEXT' | 'END';

function combatReducer(state: CombatState, action: CombatAction): CombatState
```

**Aufwand:** L | **Risiko:** mittel

**Schritte:**
1. Erstelle `lib/combat/CombatStateMachine.ts`
2. Definiere States und Transitions
3. Extrahiere State-Logik aus useCombat
4. useCombat nutzt State-Machine für Transitions
5. Side-Effects (fetch, timer) bleiben im Hook

---

### ✅ [R10] Gemeinsame Farb-Konstanten extrahieren (ERLEDIGT 2025-11-23)
**Problem:** UI-Farben wie `#4CAF50` (Grün), `#FF4444` (Rot), `#1a1a2e` (Dunkel) sind über Components verstreut.

**Betroffene Dateien:**
- `components/CharacterPanel.tsx` - Diverse Farbwerte
- `components/CombatModal.tsx` - Diverse Farbwerte
- `components/GameCanvas.tsx:213` - `#4CAF50` für Minimap-Border

**Lösung:** Erstelle `lib/ui/colors.ts`:
```typescript
export const COLORS = {
  success: '#4CAF50',
  error: '#FF4444',
  warning: '#FFA500',
  background: { dark: '#1a1a2e', darker: '#0f0f1a' },
  border: { gold: '#8B7355', light: '#a08060' }
} as const;
```

**Aufwand:** S | **Risiko:** niedrig

**Schritte:**
1. Erstelle `lib/ui/colors.ts` mit Farbkonstanten
2. Ersetze hardcoded Farben in Components schrittweise
3. Beginne mit GameCanvas (kleinstes File)

---

## Empfohlene Reihenfolge

1. ✅ **R01** API-Service Layer (Grundlage für R02, R08)
2. ✅ **R02** ELO-Loading konsolidieren (nutzt R01)
3. ✅ **R05** Direction-Konstanten (Quick Win)
4. ✅ **R06** calculateElo entfernen (Quick Win)
5. ✅ **R07** loadUserXp integrieren (Quick Win)
6. ✅ **R10** Farb-Konstanten (Quick Win)
7. ✅ **R03** db.ts aufteilen (größeres Refactoring)
8. ✅ **R04** Ref-Synchronisation (nach R03)
9. ✅ **R08** spawnEnemies Pure Function (nach R01)
10. **R09** Combat State-Machine (optional, größtes Refactoring)

## Nicht in diesem Durchgang

- Inline-Styles zu CSS-Modules migrieren (zu umfangreich)
- Enemy.ts aufteilen (funktioniert, aber komplex)
- GameRenderer aufteilen (funktioniert, niedrige Priorität)
- React.memo/useMemo Optimierungen (Performance-Thema)
