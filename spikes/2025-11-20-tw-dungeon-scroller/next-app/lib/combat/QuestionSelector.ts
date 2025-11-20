import type { Enemy } from '../Enemy';
import { shuffleAnswers } from './AnswerShuffler';

export async function selectQuestion(
  enemy: Enemy,
  userId: number,
  askedQuestions: Set<number>
) {
  const response = await fetch(`/api/questions-with-elo?subject=${enemy.subject}&userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions with ELO');
  }

  const questionsWithElo = await response.json();

  // 1. Filter out already asked questions
  let availableQuestions = questionsWithElo.filter((q: any) => !askedQuestions.has(q.id));

  if (availableQuestions.length === 0) {
    console.warn('No more questions available, reusing questions');
    askedQuestions.clear();
    availableQuestions = questionsWithElo;
  }

  // 2. Calculate difficulty threshold: Question-ELO <= (11 - MonsterLevel)
  const maxElo = 11 - enemy.level;

  // 3. Filter questions by difficulty
  let suitableQuestions = availableQuestions.filter((q: any) => {
    if (q.elo !== null) {
      return q.elo <= maxElo;
    }
    return false;
  });

  // 4. Fallback chain
  let selectedQuestion;

  if (suitableQuestions.length > 0) {
    // Pick from suitable questions (hardest first = lowest ELO)
    suitableQuestions.sort((a: any, b: any) => (a.elo ?? 0) - (b.elo ?? 0));
    selectedQuestion = suitableQuestions[0];
  } else {
    // Fallback 1: Unanswered questions (ELO = null)
    const unansweredQuestions = availableQuestions.filter((q: any) => q.elo === null);
    if (unansweredQuestions.length > 0) {
      selectedQuestion = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
    } else {
      // Fallback 2: Next hardest question
      availableQuestions.sort((a: any, b: any) => (a.elo ?? 0) - (b.elo ?? 0));
      selectedQuestion = availableQuestions[0];
    }
  }

  // Mark question as asked
  askedQuestions.add(selectedQuestion.id);

  // Shuffle answers
  const { shuffledAnswers, correctIndex } = shuffleAnswers(
    selectedQuestion.answers,
    selectedQuestion.correct
  );

  return {
    ...selectedQuestion,
    shuffledAnswers,
    correctIndex
  };
}
