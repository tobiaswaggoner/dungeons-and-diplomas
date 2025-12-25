import type { SelectedQuestion } from './QuestionSelector';
import { calculatePlayerDamage, calculateEnemyDamage } from './DamageCalculator';
import type { EquipmentBonuses } from '@/lib/items';

/**
 * Calculate hint for a question based on hint chance
 * Returns the index of a wrong answer to grey out, or -1 if no hint
 *
 * @param question The question to hint
 * @param hintChance Hint chance percentage (0-100)
 * @returns Index of wrong answer to hint, or -1
 */
export function calculateHint(question: SelectedQuestion, hintChance: number): number {
  // Roll for hint
  if (Math.random() * 100 >= hintChance) {
    return -1; // No hint this time
  }

  // Find wrong answer indices
  const wrongIndices: number[] = [];
  for (let i = 0; i < question.shuffledAnswers.length; i++) {
    if (i !== question.correctIndex) {
      wrongIndices.push(i);
    }
  }

  if (wrongIndices.length === 0) {
    return -1;
  }

  // Return a random wrong answer index to hint
  return wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
}

/**
 * Result of processing a combat answer
 */
export interface AnswerResult {
  isCorrect: boolean;
  isTimeout: boolean;
  damage: number;
  targetedPlayer: boolean; // true if damage was dealt to player
  feedbackMessage: string;
  correctAnswerText: string;
}

/**
 * Default equipment bonuses (no equipment)
 */
const NO_BONUSES: EquipmentBonuses = {
  maxHpBonus: 0,
  damageBonus: 0,
  damageReduction: 0,
  timeBonus: 0,
  xpBonus: 0,
  hintChance: 0,
};

/**
 * Pure function combat engine.
 * Extracts business logic from useCombat hook for better testability and reusability.
 */
export class CombatEngine {
  /**
   * Process a combat answer and calculate the result.
   * This is a pure function with no side effects.
   *
   * @param selectedIndex The index of the selected answer (-1 for timeout)
   * @param question The current question being answered
   * @param playerElo The player's current ELO for this subject
   * @param enemyLevel The enemy's level
   * @param equipmentBonuses Optional equipment bonuses (damage, reduction, etc.)
   * @param comboBonus Optional combo bonus damage (from defeating enemies in a row)
   * @returns The result of the answer including damage and feedback
   */
  static processAnswer(
    selectedIndex: number,
    question: SelectedQuestion,
    playerElo: number,
    enemyLevel: number,
    equipmentBonuses: EquipmentBonuses = NO_BONUSES,
    comboBonus: number = 0
  ): AnswerResult {
    const isTimeout = selectedIndex === -1;
    const isCorrect = selectedIndex === question.correctIndex;
    const correctAnswerText = question.shuffledAnswers[question.correctIndex];

    if (isCorrect) {
      // Apply damage bonus from equipment + combo
      const totalDamageBonus = equipmentBonuses.damageBonus + comboBonus;
      const damage = calculatePlayerDamage(playerElo, enemyLevel, totalDamageBonus);
      // Show combo bonus in feedback if active
      const comboText = comboBonus > 0 ? ` (+${comboBonus} Kombo)` : '';
      return {
        isCorrect: true,
        isTimeout: false,
        damage,
        targetedPlayer: false,
        feedbackMessage: `✓ Richtig! ${damage} Schaden!${comboText}`,
        correctAnswerText
      };
    } else {
      // Apply damage reduction from equipment
      const damage = calculateEnemyDamage(playerElo, enemyLevel, equipmentBonuses.damageReduction);
      const feedbackMessage = isTimeout
        ? `✗ Zeit abgelaufen! Richtige Antwort: ${correctAnswerText} (-${damage} HP)`
        : `✗ Falsch! Richtige Antwort: ${correctAnswerText} (-${damage} HP)`;

      return {
        isCorrect: false,
        isTimeout,
        damage,
        targetedPlayer: true,
        feedbackMessage,
        correctAnswerText
      };
    }
  }

  /**
   * Calculate the dynamic time limit for a question based on enemy and question difficulty.
   *
   * @param enemyLevel The enemy's level (1-10)
   * @param questionElo The question's ELO (null if unanswered)
   * @param timeBonus Bonus time from equipment (default 0)
   * @returns Time limit in seconds (clamped between 3 and 30)
   */
  static calculateDynamicTimeLimit(
    enemyLevel: number,
    questionElo: number | null,
    timeBonus: number = 0
  ): number {
    // Question level = 11 - ELO (lower ELO = harder question = higher level)
    const questionLevel = questionElo !== null ? 11 - questionElo : 6; // Default to middle if no ELO
    const levelDifference = enemyLevel - questionLevel;
    // Base time + equipment bonus, clamped between 3 and 30 seconds
    const baseTime = 13 - levelDifference;
    return Math.max(3, Math.min(30, baseTime + timeBonus));
  }

  /**
   * Check if combat should end based on current HP values.
   *
   * @param enemyAlive Whether the enemy is still alive
   * @param playerHp The player's current HP
   * @returns true if combat should end
   */
  static shouldEndCombat(enemyAlive: boolean, playerHp: number): boolean {
    return !enemyAlive || playerHp <= 0;
  }

  /**
   * Determine the combat outcome.
   *
   * @param enemyAlive Whether the enemy is still alive
   * @param playerHp The player's current HP
   * @returns 'victory', 'defeat', or 'ongoing'
   */
  static getCombatOutcome(
    enemyAlive: boolean,
    playerHp: number
  ): 'victory' | 'defeat' | 'ongoing' {
    if (!enemyAlive) return 'victory';
    if (playerHp <= 0) return 'defeat';
    return 'ongoing';
  }
}
