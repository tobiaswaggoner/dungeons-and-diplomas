import { useState, useRef } from 'react';

interface SubjectScore {
  subjectKey: string;
  subjectName: string;
  startElo: number;
  currentElo: number;
  questionsAnswered: number;
}

export function useScoring(userId: number | null) {
  const [sessionScores, setSessionScores] = useState<SubjectScore[]>([]);
  const sessionStartEloRef = useRef<{ [key: string]: number }>({});

  const loadSessionElos = async (id: number) => {
    try {
      const response = await fetch(`/api/session-elo?userId=${id}`);
      if (response.ok) {
        const eloScores = await response.json();
        const startElos: { [key: string]: number } = {};
        const scores: SubjectScore[] = [];

        for (const score of eloScores) {
          startElos[score.subjectKey] = score.averageElo;
          scores.push({
            subjectKey: score.subjectKey,
            subjectName: score.subjectName,
            startElo: score.averageElo,
            currentElo: score.averageElo,
            questionsAnswered: 0
          });
        }

        sessionStartEloRef.current = startElos;
        setSessionScores(scores);
      }
    } catch (error) {
      console.error('Error loading session ELO:', error);
    }
  };

  const updateSessionScores = async (subjectKey: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/session-elo?userId=${userId}`);
      if (!response.ok) return;

      const eloScores = await response.json();

      setSessionScores(prevScores => {
        return prevScores.map(score => {
          const updated = eloScores.find((s: any) => s.subjectKey === score.subjectKey);
          if (!updated) return score;

          return {
            ...score,
            currentElo: updated.averageElo,
            questionsAnswered: score.subjectKey === subjectKey
              ? score.questionsAnswered + 1
              : score.questionsAnswered
          };
        });
      });
    } catch (error) {
      console.error('Failed to update session scores:', error);
    }
  };

  return {
    sessionScores,
    sessionStartEloRef,
    loadSessionElos,
    updateSessionScores
  };
}
