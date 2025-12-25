# Buff-System

## Übersicht

Nach dem Besiegen der Schrein-Gegner erhält der Spieler die Wahl zwischen 2 zufälligen Buffs. Buffs sind **permanent** für den aktuellen Dungeon-Run und können **gestackt** werden.

## Buff-Typen

### 1. HP-Boost (Vitalität)

**Effekt**: Erhöht maximale HP

```typescript
interface HPBoostBuff {
  type: 'hp_boost';
  name: 'Vitalität';
  description: '+25 Maximale HP';
  icon: 'heart';
  value: 25;
}
```

**Anwendung**:
```typescript
function applyHPBoost(player: Player, value: number): void {
  player.maxHp += value;
  player.hp += value; // Auch aktuelle HP erhöhen
}
```

**Stacking**: Ja, additiv (+25, +50, +75, ...)

---

### 2. Schild-System (Schutzschild)

**Effekt**: Blaue HP-Leiste die Schaden absorbiert und sich regeneriert

```typescript
interface ShieldBuff {
  type: 'shield';
  name: 'Schutzschild';
  description: 'Schild mit 20 HP, regeneriert 2 HP/Sekunde';
  icon: 'shield';
  maxShield: 20;
  regenRate: 2; // HP pro Sekunde
}
```

**Spieler-Erweiterung**:
```typescript
interface Player {
  // ... bestehende Felder
  shield: number;          // Aktuelle Schild-HP
  maxShield: number;       // Maximale Schild-HP
  shieldRegenRate: number; // Regeneration pro Sekunde
}
```

**Schadens-Logik**:
```typescript
function applyDamageToPlayer(player: Player, damage: number): void {
  // Erst Schild, dann HP
  if (player.shield > 0) {
    const shieldDamage = Math.min(player.shield, damage);
    player.shield -= shieldDamage;
    damage -= shieldDamage;
  }

  if (damage > 0) {
    player.hp -= damage;
  }
}
```

**Regeneration** (im Game-Loop):
```typescript
function updateShieldRegen(player: Player, deltaTime: number): void {
  if (player.shield < player.maxShield) {
    player.shield = Math.min(
      player.maxShield,
      player.shield + (player.shieldRegenRate * deltaTime)
    );
  }
}
```

**Stacking**: Ja, erhöht maxShield (+20 pro Buff)

---

### 3. Zeit-Bonus (Zeitdehnung)

**Effekt**: Mehr Zeit für Quiz-Antworten

```typescript
interface TimeBonusBuff {
  type: 'time_bonus';
  name: 'Zeitdehnung';
  description: '+5 Sekunden Antwortzeit';
  icon: 'clock';
  value: 5; // Sekunden
}
```

**Anwendung**:
```typescript
// In useCombat.ts
const effectiveTimeLimit = COMBAT_TIME_LIMIT + player.timeBonus;
```

**Spieler-Erweiterung**:
```typescript
interface Player {
  // ... bestehende Felder
  timeBonus: number; // Zusätzliche Sekunden
}
```

**Stacking**: Ja, additiv (+5, +10, +15, ...)

---

### 4. Schadensboost (Macht)

**Effekt**: Mehr Schaden bei richtiger Antwort

```typescript
interface DamageBoostBuff {
  type: 'damage_boost';
  name: 'Macht';
  description: '+5 Schaden bei richtiger Antwort';
  icon: 'sword';
  value: 5;
}
```

**Anwendung**:
```typescript
// In useCombat.ts
const damageToEnemy = DAMAGE_CORRECT + player.damageBoost;
```

**Stacking**: Ja, additiv (+5, +10, +15, ...)

---

### 5. Schadensreduktion (Widerstand)

**Effekt**: Weniger Schaden bei falscher Antwort

```typescript
interface DamageReductionBuff {
  type: 'damage_reduction';
  name: 'Widerstand';
  description: '-3 Schaden bei falscher Antwort (min. 5)';
  icon: 'armor';
  value: 3;
}
```

**Anwendung**:
```typescript
// In useCombat.ts
const damageToPlayer = Math.max(5, DAMAGE_WRONG - player.damageReduction);
```

**Stacking**: Ja, aber mit Minimum (15 → 12 → 9 → 6 → 5)

---

### 6. Regeneration (Heilung)

**Effekt**: Langsame HP-Wiederherstellung über Zeit

```typescript
interface RegenBuff {
  type: 'regen';
  name: 'Heilung';
  description: 'Regeneriere 1 HP alle 3 Sekunden';
  icon: 'heart_plus';
  hpPerTick: 1;
  tickInterval: 3; // Sekunden
}
```

**Game-Loop Integration**:
```typescript
let regenTimer = 0;

function updateRegen(player: Player, deltaTime: number): void {
  if (player.regenRate <= 0) return;

  regenTimer += deltaTime;

  if (regenTimer >= player.regenInterval) {
    player.hp = Math.min(player.maxHp, player.hp + player.regenRate);
    regenTimer = 0;
  }
}
```

**Stacking**: Ja, verkürzt Intervall (3s → 2s → 1.5s)

---

### 7. Kombo-Zeit (Kombo-Meister) - OPTIONAL

**Effekt**: Längere Zeit für Kombos (falls Kombo-System existiert)

```typescript
interface ComboBuff {
  type: 'combo_time';
  name: 'Kombo-Meister';
  description: '+2 Sekunden Kombo-Zeit';
  icon: 'lightning';
  value: 2;
}
```

**Hinweis**: Nur relevant wenn Kombo-System implementiert ist.

---

### 8. Zweite Chance (Rettung) - OPTIONAL

**Effekt**: Bei Tod einmal mit 20% HP wiederbelebt

```typescript
interface SecondChanceBuff {
  type: 'second_chance';
  name: 'Rettung';
  description: 'Einmalig: Bei Tod mit 20% HP wiederbelebt';
  icon: 'angel';
  used: boolean;
}
```

**Einmalig pro Buff**, kann aber mehrfach erhalten werden.

## Buff-Pool & Auswahl

### Alle verfügbaren Buffs

```typescript
const BUFF_POOL: Buff[] = [
  { type: 'hp_boost', name: 'Vitalität', ... },
  { type: 'shield', name: 'Schutzschild', ... },
  { type: 'time_bonus', name: 'Zeitdehnung', ... },
  { type: 'damage_boost', name: 'Macht', ... },
  { type: 'damage_reduction', name: 'Widerstand', ... },
  { type: 'regen', name: 'Heilung', ... },
];
```

### Zufällige Auswahl (2 verschiedene)

```typescript
function selectRandomBuffs(count: number = 2): Buff[] {
  const shuffled = [...BUFF_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### Gewichtete Auswahl (optional)

Manche Buffs können seltener/häufiger sein:

```typescript
const BUFF_WEIGHTS: Record<BuffType, number> = {
  'hp_boost': 20,        // Häufig
  'shield': 10,          // Selten
  'time_bonus': 20,      // Häufig
  'damage_boost': 15,    // Mittel
  'damage_reduction': 15,// Mittel
  'regen': 10,           // Selten
  'second_chance': 5,    // Sehr selten
};
```

## Spieler-Buff-State

### Erweiterte Player-Struktur

```typescript
interface PlayerBuffs {
  // HP-System
  maxHpBonus: number;         // Von hp_boost

  // Schild-System
  hasShield: boolean;
  maxShield: number;
  currentShield: number;
  shieldRegenRate: number;

  // Kampf-Modifikatoren
  timeBonus: number;          // Sekunden
  damageBoost: number;        // Extra Schaden
  damageReduction: number;    // Schadens-Reduktion

  // Regeneration
  regenRate: number;          // HP pro Tick
  regenInterval: number;      // Sekunden zwischen Ticks

  // Einmalige Buffs
  secondChanceAvailable: boolean;

  // Tracking
  activeBuffs: BuffType[];    // Liste aller erhaltenen Buffs
}

interface Player {
  // ... bestehende Felder
  buffs: PlayerBuffs;
}
```

### Initial-State

```typescript
const INITIAL_PLAYER_BUFFS: PlayerBuffs = {
  maxHpBonus: 0,
  hasShield: false,
  maxShield: 0,
  currentShield: 0,
  shieldRegenRate: 0,
  timeBonus: 0,
  damageBoost: 0,
  damageReduction: 0,
  regenRate: 0,
  regenInterval: 3,
  secondChanceAvailable: false,
  activeBuffs: [],
};
```

## Buff-Anwendung

### Zentrale Apply-Funktion

```typescript
function applyBuff(player: Player, buff: Buff): void {
  player.buffs.activeBuffs.push(buff.type);

  switch (buff.type) {
    case 'hp_boost':
      player.buffs.maxHpBonus += buff.value;
      player.maxHp += buff.value;
      player.hp += buff.value;
      break;

    case 'shield':
      player.buffs.hasShield = true;
      player.buffs.maxShield += buff.maxShield;
      player.buffs.currentShield = player.buffs.maxShield;
      player.buffs.shieldRegenRate = buff.regenRate;
      break;

    case 'time_bonus':
      player.buffs.timeBonus += buff.value;
      break;

    case 'damage_boost':
      player.buffs.damageBoost += buff.value;
      break;

    case 'damage_reduction':
      player.buffs.damageReduction += buff.value;
      break;

    case 'regen':
      player.buffs.regenRate += buff.hpPerTick;
      // Bei Stack: Intervall verkürzen
      if (player.buffs.activeBuffs.filter(b => b === 'regen').length > 1) {
        player.buffs.regenInterval = Math.max(1, player.buffs.regenInterval * 0.75);
      }
      break;

    case 'second_chance':
      player.buffs.secondChanceAvailable = true;
      break;
  }

  // Visuelles Feedback
  showBuffAppliedEffect(buff);
}
```

## HP-Leisten-Darstellung

### Schild-Leiste (blau)

Die Schild-Leiste wird **direkt neben** der HP-Leiste angezeigt:

```
┌──────────────────────────────────┐
│ HP:     [████████████░░░░] 80/100│
│ Schild: [████░░░░░░░░░░░░] 10/20 │
└──────────────────────────────────┘
```

**Rendering-Logik**:
```typescript
function renderPlayerBars(
  ctx: CanvasRenderingContext2D,
  player: Player,
  x: number,
  y: number
): void {
  const barWidth = 150;
  const barHeight = 12;

  // HP-Leiste (rot/grün)
  const hpPercent = player.hp / player.maxHp;
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, barWidth, barHeight);
  ctx.fillStyle = hpPercent > 0.3 ? '#4CAF50' : '#f44336';
  ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

  // Schild-Leiste (blau) - nur wenn Schild vorhanden
  if (player.buffs.hasShield) {
    const shieldPercent = player.buffs.currentShield / player.buffs.maxShield;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y + barHeight + 2, barWidth, barHeight);
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(x, y + barHeight + 2, barWidth * shieldPercent, barHeight);
  }
}
```

## Buff-Icons für UI

### Icon-Mapping

```typescript
const BUFF_ICONS: Record<BuffType, string> = {
  'hp_boost': '❤️',        // oder SVG/PNG
  'shield': '🛡️',
  'time_bonus': '⏱️',
  'damage_boost': '⚔️',
  'damage_reduction': '🛡️',
  'regen': '💚',
  'combo_time': '⚡',
  'second_chance': '👼',
};
```

## Zusammenfassung

| Buff | Effekt | Stacking |
|------|--------|----------|
| Vitalität | +25 Max HP | Additiv |
| Schutzschild | 20 Schild-HP, regen 2/s | +20 Max Schild |
| Zeitdehnung | +5s Antwortzeit | Additiv |
| Macht | +5 Schaden | Additiv |
| Widerstand | -3 erhaltener Schaden | Bis min. 5 |
| Heilung | 1 HP / 3s | Schnelleres Intervall |
| Rettung | 1x Wiederbelebung | Neue Chance pro Buff |

---

**Nächster Schritt**: [05_UI_Design.md](./05_UI_Design.md) - Wie sieht das Buff-Auswahl-Menü aus?
