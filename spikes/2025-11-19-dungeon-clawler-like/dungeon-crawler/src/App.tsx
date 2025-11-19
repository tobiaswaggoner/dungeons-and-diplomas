import { useEffect } from 'react';
import { GameContainer } from './components/ui/GameContainer';
import { MapScene } from './components/map/MapScene';
import { CombatScene } from './components/combat/CombatScene';
import { TreasureScene } from './components/rooms/TreasureScene';
import { ShopScene } from './components/rooms/ShopScene';
import { useGameStore } from './store/gameStore';
import { GameScene } from './types/game';
import { generateFloor } from './utils/floorGenerator';

function App() {
  const { scene, currentFloor, nextFloor } = useGameStore();

  useEffect(() => {
    // Initialize game with first floor
    if (!currentFloor) {
      const floor = generateFloor(1);
      nextFloor(floor);
    }
  }, [currentFloor, nextFloor]);

  if (!currentFloor) {
    return (
      <GameContainer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#fff',
            fontSize: '24px',
          }}
        >
          Loading game...
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      {scene === GameScene.MAP && <MapScene />}
      {scene === GameScene.COMBAT && <CombatScene />}
      {scene === GameScene.TREASURE && <TreasureScene />}
      {scene === GameScene.SHOP && <ShopScene />}
    </GameContainer>
  );
}

export default App;
