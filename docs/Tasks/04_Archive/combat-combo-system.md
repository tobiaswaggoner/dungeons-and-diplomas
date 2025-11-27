# Combat Combo System

## Übersicht
Implementierung eines Kombo-Systems basierend auf **flawless** besiegten Gegnern in Folge.

## Anforderungen
- Kombo zählt nur **flawless** besiegte Gegner (keine falsche Antwort während des Kampfes)
- Kombo startet visuell erst ab 3 besiegten Gegnern
- Bonus-Schaden: +2 Schaden pro Kombo-Stufe (ab Kombo 3)
- Visuelle Anzeige: Unten in der Mitte des Bildschirms
- "x3 Kombo" Text mit Schwank-Animation
- **Timer-Leiste** unter dem Kombo-Text:
  - x3 Kombo = 30 Sekunden
  - x10+ Kombo = 10 Sekunden
  - Lineare Interpolation dazwischen
- Je höher die Kombo, desto beeindruckender die Effekte:
  - x3-x4: Einfacher Text mit leichtem Schwanken
  - x5-x7: Goldener Text, stärkeres Schwanken, Glow-Effekt
  - x8-x9: Roter/Oranger Text, Pulsieren, Partikel
  - x10+: Regenbogen-Effekt, starkes Pulsieren, Flammen-Glow

## Kombo-Regeln
- Kombo erhöht sich um 1 bei jedem **flawless** besiegten Gegner
- Kombo wird zurückgesetzt wenn:
  - Der Spieler eine falsche Antwort gibt (sofort)
  - Der Spieler stirbt
  - Der Spieler einen neuen Dungeon betritt (Neues Spiel)
  - Der Timer abläuft

## Timer-System
- Timer startet erst bei Kombo >= 3
- Bei jedem neuen flawless Sieg wird der Timer zurückgesetzt
- Je höher die Kombo, desto weniger Zeit:
  - x3: 30s
  - x4: 27s
  - x5: 24s
  - x6: 21s
  - x7: 19s
  - x8: 16s
  - x9: 13s
  - x10+: 10s
- Timer-Leiste wechselt Farbe:
  - Grün: >60% Zeit übrig
  - Gelb: 30-60% Zeit übrig
  - Rot: <30% Zeit übrig (mit Pulsier-Animation)

## Technische Implementierung

### 1. Hook: useCombo (hooks/useCombo.ts)
```typescript
interface ComboState {
  count: number;           // Aktuelle Kombo-Anzahl
  isActive: boolean;       // Kombo >= 3
  damageBonus: number;     // Berechneter Bonus-Schaden
  tier: 'none' | 'bronze' | 'silver' | 'gold' | 'legendary';
  timeRemaining: number;   // Verbleibende Zeit in Sekunden
  timerDuration: number;   // Gesamtdauer des aktuellen Timers
}
```

### 2. Komponente: ComboDisplay (components/ComboDisplay.tsx)
- CSS-Animationen für Schwanken
- Dynamische Styles basierend auf Kombo-Tier
- Position: fixed, bottom center
- Timer-Leiste mit Farb-Transition und Pulsier-Animation

### 3. Flawless-Tracking in useCombat
- `flawlessCombatRef` trackt ob aktueller Kampf fehlerlos ist
- Bei falschem Antwort: `onComboBreak()` aufrufen
- Bei Sieg: nur wenn flawless, dann `onEnemyDefeatedFlawless()` aufrufen

### 4. Integration in GameCanvas
- useCombo Hook einbinden
- `onEnemyDefeatedFlawless`: combo.incrementCombo
- `onComboBreak`: combo.resetCombo
- Timer-Props an ComboDisplay übergeben

### 5. Schaden-Bonus Integration
- CombatEngine erweitert um comboBonus Parameter
- Bonus: (comboCount - 2) * 2 Schaden (nur wenn combo >= 3)
- Beispiel: x5 Kombo = +6 Schaden

### 6. Visuelle Tiers

| Tier | Kombo | Farbe | Animation | Timer | Extras |
|------|-------|-------|-----------|-------|--------|
| none | 0-2 | - | - | - | Nicht sichtbar |
| bronze | 3-4 | Weiß | Leichtes Schwanken | 30-27s | - |
| silver | 5-7 | Gold | Stärkeres Schwanken | 24-19s | Glow |
| gold | 8-9 | Orange | Pulsieren + Schwanken | 16-13s | Partikel |
| legendary | 10+ | Regenbogen | Starkes Pulsieren | 10s | Flammen-Aura |

## Dateien erstellt/geändert

### Neue Dateien:
- [x] `hooks/useCombo.ts` - Kombo State Management mit Timer

### Geänderte Dateien:
- [x] `components/ComboDisplay.tsx` - Timer-Leiste hinzugefügt
- [x] `components/GameCanvas.tsx` - Integration mit neuen Callbacks
- [x] `hooks/useCombat.ts` - Flawless-Tracking, onComboBreak
- [x] `lib/combat/CombatEngine.ts` - Bonus-Schaden Integration

## Implementierungsreihenfolge
1. [x] Flawless-Tracking in useCombat hinzufügen
2. [x] useCombo um Timer erweitern
3. [x] ComboDisplay Timer-Leiste hinzufügen
4. [x] GameCanvas Callbacks aktualisieren
5. [x] Build erfolgreich

## Autor
Michel Waggoner (Michi)

## Status
Fertiggestellt - 2025-11-27 (Update: Flawless + Timer)
