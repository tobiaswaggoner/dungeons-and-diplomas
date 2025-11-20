import { PLAYER_MAX_HP, COMBAT_TIME_LIMIT } from '@/lib/constants';
import type { Question } from '@/lib/questions';
import type { Enemy } from '@/lib/Enemy';

interface CombatModalProps {
  combatSubject: string;
  playerHp: number;
  enemyHp: number;
  currentEnemy: Enemy | null;
  combatTimer: number;
  combatQuestion: (Question & { shuffledAnswers: string[]; correctIndex: number; elo: number | null }) | null;
  combatFeedback: string;
  onAnswerQuestion: (index: number) => void;
}

export default function CombatModal({
  combatSubject,
  playerHp,
  enemyHp,
  currentEnemy,
  combatTimer,
  combatQuestion,
  combatFeedback,
  onAnswerQuestion
}: CombatModalProps) {
  return (
    <div style={{
      display: 'block',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.95)',
      border: '4px solid #4CAF50',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '600px',
      zIndex: 200,
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#4CAF50', marginTop: 0 }}>Kampf: {combatSubject}</h2>
      <div style={{ marginBottom: '20px', fontSize: '18px' }}>
        <div>Deine HP: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{playerHp}</span>/{PLAYER_MAX_HP}</div>
        <div>Gegner HP: <span style={{ color: '#FF4444', fontWeight: 'bold' }}>{enemyHp}</span>/{currentEnemy?.maxHp ?? 0}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '24px', color: '#FFD700' }}>
          Zeit: <span>{combatTimer}</span>s
        </div>
        {combatQuestion && (() => {
          const elo = combatQuestion.elo;
          let difficulty = 'Neu';
          let diffColor = '#888';
          let diffLevel = 5;

          if (elo !== null) {
            diffLevel = 11 - elo;
            if (diffLevel <= 2) {
              difficulty = 'Sehr leicht';
              diffColor = '#4CAF50';
            } else if (diffLevel <= 4) {
              difficulty = 'Leicht';
              diffColor = '#8BC34A';
            } else if (diffLevel <= 6) {
              difficulty = 'Mittel';
              diffColor = '#FFC107';
            } else if (diffLevel <= 8) {
              difficulty = 'Schwer';
              diffColor = '#FF9800';
            } else {
              difficulty = 'Sehr schwer';
              diffColor = '#FF4444';
            }
          }

          return (
            <div style={{
              fontSize: '14px',
              padding: '6px 12px',
              backgroundColor: `${diffColor}20`,
              borderRadius: '6px',
              border: `2px solid ${diffColor}`
            }}>
              <span style={{ color: diffColor, fontWeight: 'bold' }}>{difficulty} ({diffLevel})</span>
            </div>
          );
        })()}
      </div>
      {combatQuestion && (
        <>
          <div style={{ fontSize: '20px', marginBottom: '25px', lineHeight: 1.4 }}>
            {combatQuestion.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {combatQuestion.shuffledAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => onAnswerQuestion(index)}
                style={{
                  padding: '15px',
                  fontSize: '16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
              >
                {answer}
              </button>
            ))}
          </div>
        </>
      )}
      {combatFeedback && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '18px',
          minHeight: '30px',
          fontWeight: 'bold',
          color: combatFeedback.startsWith('✓') ? '#4CAF50' : '#FF4444'
        }}>
          {combatFeedback.split('<br>').map((line, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
      )}
    </div>
  );
}
