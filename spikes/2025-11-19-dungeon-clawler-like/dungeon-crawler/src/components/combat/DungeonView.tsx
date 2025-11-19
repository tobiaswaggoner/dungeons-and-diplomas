import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { CharacterSprite } from './CharacterSprite';

interface DungeonViewProps {
  isPlayerAttacking?: boolean;
  isEnemyHurt?: boolean;
}

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const DungeonContainer = styled.div`
  width: 100%;
  height: 400px;
  background: linear-gradient(180deg, #3a3a3a 0%, #4a4a4a 100%);
  position: relative;
  overflow: hidden;
`;

const WallLayer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: repeating-linear-gradient(
    90deg,
    #555 0px,
    #555 80px,
    #444 80px,
    #444 82px
  );
`;

const StoneBlock = styled.div<{ $left: number; $bottom: number }>`
  position: absolute;
  left: ${(props) => props.$left}px;
  bottom: ${(props) => props.$bottom}px;
  width: 80px;
  height: 60px;
  background-color: ${theme.colors.stone};
  border: 2px solid #555;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px solid #777;
    border-radius: 2px;
  }
`;

const Torch = styled.div<{ $left: number; $top: number }>`
  position: absolute;
  left: ${(props) => props.$left}px;
  top: ${(props) => props.$top}px;
  width: 30px;
  height: 60px;
`;

const TorchStick = styled.div`
  width: 8px;
  height: 40px;
  background-color: #8b4513;
  margin: 0 auto;
  border-radius: 2px;
`;

const TorchFlame = styled.div`
  width: 30px;
  height: 35px;
  background: radial-gradient(ellipse at center, #ffcc00 0%, #ff9933 50%, #ff6600 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: ${flicker} 0.5s ease-in-out infinite;
  position: relative;
  top: -10px;
`;

const Fence = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 80px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  justify-content: center;
`;

const FencePost = styled.div`
  width: 15px;
  height: 60px;
  background-color: #8b4513;
  border-radius: 2px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: -5px;
    right: -5px;
    height: 8px;
    background-color: #a0522d;
    border-radius: 2px;
  }
`;

export function DungeonView({ isPlayerAttacking, isEnemyHurt }: DungeonViewProps) {
  return (
    <DungeonContainer>
      <WallLayer />

      {/* Stone blocks for wall texture */}
      {[0, 1, 2, 3, 4].map((i) => (
        <StoneBlock key={`left-${i}`} $left={20 + i * 90} $bottom={160 + i * 15} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <StoneBlock key={`right-${i}`} $left={900 - i * 90} $bottom={160 + i * 15} />
      ))}

      {/* Torches */}
      <Torch $left={100} $top={50}>
        <TorchFlame />
        <TorchStick />
      </Torch>
      <Torch $left={1150} $top={50}>
        <TorchFlame />
        <TorchStick />
      </Torch>

      {/* Fence in the middle */}
      <Fence>
        {[0, 1, 2, 3, 4].map((i) => (
          <FencePost key={i} />
        ))}
      </Fence>

      {/* Characters */}
      <CharacterSprite isPlayer={true} isAttacking={isPlayerAttacking} />
      <CharacterSprite isPlayer={false} isHurt={isEnemyHurt} />
    </DungeonContainer>
  );
}
