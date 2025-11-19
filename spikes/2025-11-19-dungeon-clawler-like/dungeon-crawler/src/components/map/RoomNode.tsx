import styled from 'styled-components';
import { Room, RoomType } from '../../types/game';
import { theme } from '../../styles/theme';
import {
  DoorIcon,
  SwordIcon,
  MonsterIcon,
  ChestIcon,
  CoinIcon,
  StairsIcon,
} from '../ui/Icons';

interface RoomNodeProps {
  room: Room;
  isActive: boolean;
  isCleared: boolean;
  isLocked: boolean;
  onClick?: () => void;
}

const NodeContainer = styled.div<{ $isActive: boolean; $isCleared: boolean; $isLocked: boolean }>`
  width: 120px;
  height: 100px;
  border: 3px solid
    ${(props) =>
      props.$isActive
        ? theme.colors.playerGreen
        : props.$isLocked
          ? '#333'
          : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${(props) =>
    props.$isCleared ? '#555' : props.$isLocked ? '#222' : theme.colors.stone};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$isLocked ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$isLocked ? 0.5 : 1)};
  transition: all 0.3s ease;
  position: relative;

  ${(props) =>
    props.$isActive &&
    `
    box-shadow: 0 0 20px ${theme.colors.playerGreen};
  `}

  &:hover {
    ${(props) =>
      !props.$isLocked &&
      `
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    `}
  }
`;

const RoomLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textSecondary};
  white-space: nowrap;
`;

function getRoomIcon(type: RoomType, size: number = 48) {
  switch (type) {
    case RoomType.ENTRANCE:
      return <DoorIcon size={size} />;
    case RoomType.COMBAT:
      return <SwordIcon size={size} />;
    case RoomType.BOSS:
      return <MonsterIcon size={size} />;
    case RoomType.TREASURE:
      return <ChestIcon size={size} />;
    case RoomType.SHOP:
      return <CoinIcon size={size} />;
    case RoomType.EXIT:
      return <StairsIcon size={size} />;
    default:
      return null;
  }
}

function getRoomLabel(type: RoomType): string {
  switch (type) {
    case RoomType.ENTRANCE:
      return 'Eingang';
    case RoomType.COMBAT:
      return 'Kampf';
    case RoomType.BOSS:
      return 'Boss';
    case RoomType.TREASURE:
      return 'Schatz';
    case RoomType.SHOP:
      return 'Shop';
    case RoomType.EXIT:
      return 'Ausgang';
    default:
      return '';
  }
}

export function RoomNode({ room, isActive, isCleared, isLocked, onClick }: RoomNodeProps) {
  return (
    <NodeContainer
      $isActive={isActive}
      $isCleared={isCleared}
      $isLocked={isLocked}
      onClick={!isLocked ? onClick : undefined}
    >
      {getRoomIcon(room.type)}
      <RoomLabel>{getRoomLabel(room.type)}</RoomLabel>
    </NodeContainer>
  );
}
