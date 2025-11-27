# Schrein-Feature: Gesamtübersicht

## Konzept

Der Schrein ist ein interaktives Dungeon-Element, das dem Spieler die Möglichkeit bietet, durch das Besiegen von Gegnern permanente Buffs zu erhalten.

## Feature-Zusammenfassung

```
Schrein spawnt in Raum → Spieler interagiert (E/Klick) → 1-2 Gegner erscheinen
→ Kampf gewinnen → Buff-Auswahl-Menü → Buff auswählen → Weiterspielen
```

## Kernkomponenten

| Komponente | Beschreibung | Dokument |
|------------|--------------|----------|
| Schrein-Spawning | Zufälliges Erscheinen in Räumen | [01_Schrein_Spawning.md](./01_Schrein_Spawning.md) |
| Interaktion | E-Taste und Mausklick | [02_Interaktion.md](./02_Interaktion.md) |
| Gegner-Wellen | 1-2 Gegner bei Aktivierung | [03_Gegner_Spawning.md](./03_Gegner_Spawning.md) |
| Buff-System | Verfügbare Buffs & Balancing | [04_Buff_System.md](./04_Buff_System.md) |
| UI-Design | Buff-Auswahl-Menü | [05_UI_Design.md](./05_UI_Design.md) |
| Implementation | Technische Umsetzung | [06_Implementation.md](./06_Implementation.md) |

## Spielfluss-Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                        DUNGEON EXPLORATION                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Spieler betritt Raum mit Schrein                               │
│  - Schrein ist sichtbar in Raummitte                            │
│  - Interaktions-Hinweis erscheint bei Nähe ("E" drücken)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Spieler aktiviert Schrein (E-Taste oder Klick)                 │
│  - Schrein-Animation startet                                    │
│  - 1-2 Gegner spawnen um den Schrein herum                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  KAMPFPHASE                                                      │
│  - Normaler Quiz-Kampf gegen gespawnte Gegner                   │
│  - Schrein ist während Kampf inaktiv                            │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  SPIELER VERLIERT       │     │  SPIELER GEWINNT        │
│  - Schrein bleibt aktiv │     │  - Schrein deaktiviert  │
│  - Kann erneut versuchen│     │  - Buff-Menü öffnet     │
└─────────────────────────┘     └─────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────────────┐
                              │  BUFF-AUSWAHL (Spiel pausiert)      │
                              │  - 2 zufällige Buffs zur Wahl       │
                              │  - Klick auf gewünschten Buff       │
                              └─────────────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────────────┐
                              │  BUFF ANGEWENDET                    │
                              │  - Visuelles Feedback               │
                              │  - Spiel wird fortgesetzt           │
                              └─────────────────────────────────────┘

```

## Geplante Buffs (Vorschau)

1. **HP-Boost**: Maximale HP erhöht
2. **XP-Multiplikator**: Mehr Erfahrung pro Kampf
3. **Schild**: Regenerierende blaue HP-Leiste
4. **Zeit-Bonus**: Mehr Zeit für Quiz-Antworten
5. **Schadensboost**: Mehr Schaden bei richtiger Antwort
6. **Regeneration**: Langsame HP-Wiederherstellung

## Technische Abhängigkeiten

- Neuer Room-Type: `shrine`
- Neues Entity: `Shrine.ts`
- Neuer Hook: `useShrine.ts`
- Neue Komponente: `ShrineBuffModal.tsx`
- Erweiterung: `Player` Interface (für Buffs)
- Erweiterung: `GameEngine.ts` (Interaktions-Handler)

## Prioritäten

1. **Must-Have**: Schrein-Spawning, Basis-Interaktion, Gegner-Spawn, 3 Buffs
2. **Should-Have**: Schild-System, alle 6 Buffs, Animationen
3. **Nice-to-Have**: Partikeleffekte, Sound-Effekte, Schrein-Varianten

---

**Erstellt**: 2025-11-27
**Autor**: Michi
**Status**: Konzeptphase
