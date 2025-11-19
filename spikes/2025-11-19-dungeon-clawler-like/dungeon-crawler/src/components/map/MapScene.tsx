import styled from 'styled-components';
import { useGameStore } from '../../store/gameStore';
import { RoomNode } from './RoomNode';
import { theme } from '../../styles/theme';
import { RoomType, GameScene } from '../../types/game';
import { generateEnemy } from '../../data/enemies';
import { generateQuestion, getDifficultyForFloor } from '../../utils/mathGenerator';
import { generateFloor } from '../../utils/floorGenerator';
import { useEffect } from 'react';

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #3a3a3a 0%, #4a4a4a 100%);
  position: relative;
  overflow: hidden;
`;

const MapContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 140px);
  grid-template-rows: repeat(3, 120px);
  gap: ${theme.spacing.lg};
  position: relative;
`;

const RoomSlot = styled.div<{ $gridColumn: number; $gridRow: number }>`
  grid-column: ${(props) => props.$gridColumn};
  grid-row: ${(props) => props.$gridRow};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PathLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const Legend = styled.div`
  position: absolute;
  bottom: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  background-color: rgba(42, 42, 42, 0.9);
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.sm};
`;

const LegendTitle = styled.div`
  font-weight: bold;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.playerGreen};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const Controls = styled.div`
  position: absolute;
  top: ${theme.spacing.lg};
  left: ${theme.spacing.lg};
  background-color: rgba(42, 42, 42, 0.9);
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.sm};
`;

export function MapScene() {
  const { currentFloor, setScene, moveToRoom, setCurrentEnemy, setCurrentQuestion } =
    useGameStore();

  useEffect(() => {
    // Add keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentFloor) return;

      const currentRoom = currentFloor.rooms.find((r) => r.id === currentFloor.currentRoomId);
      if (!currentRoom) return;

      // Simple navigation: move to next connected room
      if (e.key === 'd' || e.key === 'D') {
        // Move forward
        if (currentRoom.connections.length > 0) {
          const nextRoomId = currentRoom.connections[0];
          handleRoomClick(nextRoomId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentFloor]);

  if (!currentFloor) {
    return <MapContainer>Loading floor...</MapContainer>;
  }

  const handleRoomClick = (roomId: string) => {
    const room = currentFloor.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const currentRoom = currentFloor.rooms.find((r) => r.id === currentFloor.currentRoomId);
    if (!currentRoom) return;

    // Check if room is connected to current room
    if (!currentRoom.connections.includes(roomId)) {
      return; // Can't move to unconnected room
    }

    // Move to the room
    moveToRoom(roomId);

    // Handle room entry
    switch (room.type) {
      case RoomType.COMBAT:
      case RoomType.BOSS: {
        const enemy = generateEnemy(currentFloor.level, room.type === RoomType.BOSS);
        const difficulty = getDifficultyForFloor(currentFloor.level);
        const question = generateQuestion(difficulty);
        setCurrentEnemy(enemy);
        setCurrentQuestion(question);
        setScene(GameScene.COMBAT);
        break;
      }
      case RoomType.TREASURE:
        setScene(GameScene.TREASURE);
        break;
      case RoomType.SHOP:
        setScene(GameScene.SHOP);
        break;
      case RoomType.EXIT: {
        // Floor transition
        const nextLevel = currentFloor.level + 1;
        const newFloor = generateFloor(nextLevel);
        setTimeout(() => {
          const { nextFloor: setNextFloor } = useGameStore.getState();
          setNextFloor(newFloor);
        }, 1000);
        break;
      }
    }
  };

  const getRoomGridPosition = (roomId: string): { column: number; row: number } => {
    // Map room IDs to grid positions based on the structure
    const positions: Record<string, { column: number; row: number }> = {
      entrance: { column: 1, row: 2 },
      combat1: { column: 2, row: 2 },
      combat2: { column: 3, row: 2 },
      fork: { column: 4, row: 2 },
      'combat3-top': { column: 5, row: 1 },
      'combat3-bottom': { column: 5, row: 3 },
      treasure: { column: 6, row: 1 },
      boss: { column: 6, row: 3 },
      shop: { column: 7, row: 2 },
      exit: { column: 8, row: 2 },
    };
    return positions[roomId] || { column: 1, row: 1 };
  };

  return (
    <MapContainer>
      <Controls>
        <div>
          <strong>Steuerung:</strong>
        </div>
        <div>D - Vorwärts bewegen</div>
        <div>Klick auf Raum - Raum betreten</div>
      </Controls>

      <MapContent>
        <RoomGrid>
          <PathLine>
            {/* Draw connection lines here if needed */}
          </PathLine>

          {currentFloor.rooms
            .filter((room) => room.id !== 'fork')
            .map((room) => {
              const position = getRoomGridPosition(room.id);
              const isActive = room.id === currentFloor.currentRoomId;
              const isCleared = room.cleared;
              const currentRoom = currentFloor.rooms.find(
                (r) => r.id === currentFloor.currentRoomId,
              );
              const isLocked = !currentRoom?.connections.includes(room.id) && !isActive;

              return (
                <RoomSlot key={room.id} $gridColumn={position.column} $gridRow={position.row}>
                  <RoomNode
                    room={room}
                    isActive={isActive}
                    isCleared={isCleared}
                    isLocked={isLocked}
                    onClick={() => handleRoomClick(room.id)}
                  />
                </RoomSlot>
              );
            })}
        </RoomGrid>
      </MapContent>

      <Legend>
        <LegendTitle>Raumtypen</LegendTitle>
        <LegendItem>🚪 Eingang</LegendItem>
        <LegendItem>⚔️ Kampf</LegendItem>
        <LegendItem>👹 Boss</LegendItem>
        <LegendItem>💰 Schatz</LegendItem>
        <LegendItem>🛒 Shop</LegendItem>
        <LegendItem>📊 Ausgang</LegendItem>
      </Legend>
    </MapContainer>
  );
}
