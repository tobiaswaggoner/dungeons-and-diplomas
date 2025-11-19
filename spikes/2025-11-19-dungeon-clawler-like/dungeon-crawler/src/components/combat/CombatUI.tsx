import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { HPBar } from '../ui/HPBar';
import { Player, Enemy } from '../../types/game';

interface CombatUIProps {
  player: Player;
  enemy: Enemy;
}

const UIContainer = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border-top: 3px solid ${theme.colors.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${theme.spacing.lg};
`;

const CharacterPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Portrait = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.round};
  border: 3px solid ${(props) => props.$color};
  background-color: ${theme.colors.stone};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSize.xl};
`;

const NameLabel = styled.div`
  font-size: ${theme.fontSize.lg};
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  text-transform: uppercase;
`;

const HPContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export function CombatUI({ player, enemy }: CombatUIProps) {
  return (
    <UIContainer>
      {/* Player Panel */}
      <CharacterPanel>
        <Portrait $color={theme.colors.hpGreen}>😊</Portrait>
        <NameLabel>ICH</NameLabel>
        <HPContainer>
          <HPBar current={player.currentHp} max={player.maxHp} color={theme.colors.hpGreen} />
        </HPContainer>
      </CharacterPanel>

      {/* Enemy Panel */}
      <CharacterPanel>
        <Portrait $color={theme.colors.hpRed}>
          {enemy.isBoss ? '👹' : '👾'}
        </Portrait>
        <NameLabel>{enemy.name}</NameLabel>
        <HPContainer>
          <HPBar current={enemy.currentHp} max={enemy.maxHp} color={theme.colors.hpRed} />
        </HPContainer>
      </CharacterPanel>
    </UIContainer>
  );
}
