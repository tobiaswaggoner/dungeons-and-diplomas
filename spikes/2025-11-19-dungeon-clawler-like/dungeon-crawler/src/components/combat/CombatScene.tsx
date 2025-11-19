import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/gameStore';
import { DungeonView } from './DungeonView';
import { CombatUI } from './CombatUI';
import { MathQuestion } from './MathQuestion';
import { CombatState, GameScene } from '../../types/game';
import { generateQuestion, getDifficultyForFloor } from '../../utils/mathGenerator';
import { theme } from '../../styles/theme';

const CombatContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${theme.colors.background};
  position: relative;
  display: flex;
  flex-direction: column;
`;

const VictoryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const VictoryText = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${theme.colors.playerGreen};
  margin-bottom: ${theme.spacing.xl};
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
`;

const DefeatText = styled(VictoryText)`
  color: ${theme.colors.hpRed};
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
`;

const ContinueButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.fontSize.lg};
  font-weight: bold;
  background-color: ${theme.colors.playerGreen};
  color: #000;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  }
`;

const RewardText = styled.div`
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.gold};
  margin-bottom: ${theme.spacing.lg};
`;

export function CombatScene() {
  const {
    player,
    currentEnemy,
    currentQuestion,
    combatState,
    currentFloor,
    answerQuestion,
    setCurrentQuestion,
    setCombatState,
    setScene,
    collectLoot,
  } = useGameStore();

  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyHurt, setIsEnemyHurt] = useState(false);

  useEffect(() => {
    // When combat state changes, trigger animations
    if (combatState === CombatState.PLAYER_ATTACK) {
      setIsPlayerAttacking(true);
      setIsEnemyHurt(true);

      setTimeout(() => {
        setIsPlayerAttacking(false);
        setIsEnemyHurt(false);

        // Check if enemy is defeated
        if (currentEnemy && currentEnemy.currentHp <= 0) {
          setCombatState(CombatState.VICTORY);
        } else {
          // Generate next question
          if (currentFloor) {
            const difficulty = getDifficultyForFloor(currentFloor.level);
            setCurrentQuestion(generateQuestion(difficulty));
          }
          setCombatState(CombatState.QUESTION_ACTIVE);
        }
      }, 1000);
    }
  }, [combatState]);

  if (!currentEnemy || !currentQuestion) {
    return <CombatContainer>Loading combat...</CombatContainer>;
  }

  const handleAnswer = (answer: number) => {
    answerQuestion(answer);
  };

  const handleContinue = () => {
    // Give gold reward
    const goldReward = 10 + (currentFloor?.level || 0) * 5;
    collectLoot(goldReward, []);

    // Return to map
    setScene(GameScene.MAP);
    setCombatState(CombatState.QUESTION_ACTIVE);
  };

  const handleDefeat = () => {
    // For now, just go back to map
    // In Phase 6, we'll implement proper game over
    setScene(GameScene.MAP);
  };

  return (
    <CombatContainer>
      <DungeonView isPlayerAttacking={isPlayerAttacking} isEnemyHurt={isEnemyHurt} />
      <CombatUI player={player} enemy={currentEnemy} />

      {combatState === CombatState.QUESTION_ACTIVE && (
        <MathQuestion question={currentQuestion} onAnswer={handleAnswer} />
      )}

      {combatState === CombatState.VICTORY && (
        <VictoryOverlay>
          <VictoryText>SIEG!</VictoryText>
          <RewardText>+{10 + (currentFloor?.level || 0) * 5} Gold</RewardText>
          <ContinueButton onClick={handleContinue}>Weiter</ContinueButton>
        </VictoryOverlay>
      )}

      {combatState === CombatState.DEFEAT && (
        <VictoryOverlay>
          <DefeatText>NIEDERLAGE!</DefeatText>
          <ContinueButton onClick={handleDefeat}>Zurück zur Karte</ContinueButton>
        </VictoryOverlay>
      )}
    </CombatContainer>
  );
}
