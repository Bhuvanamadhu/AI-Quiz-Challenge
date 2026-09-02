// Test scenario calculations for unanswered questions

function analyzeAnswers(answers, totalQuestions) {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  answers.forEach(q => {
    const isUnanswered = !q.selected || q.selected === 'None' || String(q.selected).includes('None') || String(q.selected).includes('Timed Out') || String(q.selected).includes('Skipped');
    if (isUnanswered) {
      unansweredCount += 1;
    } else if (q.isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  });

  const unreachedCount = Math.max(0, totalQuestions - answers.length);
  unansweredCount += unreachedCount;
  const attemptedCount = correctCount + wrongCount;

  return {
    totalQuestions,
    questionsAttempted: attemptedCount,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    unanswered: unansweredCount,
    validInvariants: (correctCount + wrongCount === attemptedCount) && (attemptedCount + unansweredCount === totalQuestions)
  };
}

console.log('--- TEST 1: User answers every question (10 Qs, 8 correct, 2 wrong) ---');
const test1Answers = [
  { question: 'Q1', selected: 'A: opt1', correct: 'A: opt1', isCorrect: true },
  { question: 'Q2', selected: 'B: opt2', correct: 'B: opt2', isCorrect: true },
  { question: 'Q3', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q4', selected: 'D: opt4', correct: 'D: opt4', isCorrect: true },
  { question: 'Q5', selected: 'A: opt1', correct: 'A: opt1', isCorrect: true },
  { question: 'Q6', selected: 'B: opt2', correct: 'B: opt2', isCorrect: true },
  { question: 'Q7', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q8', selected: 'D: opt4', correct: 'D: opt4', isCorrect: true },
  { question: 'Q9', selected: 'A: opt1', correct: 'B: opt2', isCorrect: false },
  { question: 'Q10', selected: 'C: opt3', correct: 'D: opt4', isCorrect: false },
];
const res1 = analyzeAnswers(test1Answers, 10);
console.log(res1);
if (res1.unanswered !== 0 || !res1.validInvariants || res1.questionsAttempted !== 10) throw new Error('Test 1 failed');

console.log('\n--- TEST 2: User skips 2 questions (10 Qs, 6 correct, 2 wrong, 2 skipped) ---');
const test2Answers = [
  { question: 'Q1', selected: 'A: opt1', correct: 'A: opt1', isCorrect: true },
  { question: 'Q2', selected: 'None (Skipped)', correct: 'B: opt2', isCorrect: false },
  { question: 'Q3', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q4', selected: 'None (Skipped)', correct: 'D: opt4', isCorrect: false },
  { question: 'Q5', selected: 'A: opt1', correct: 'A: opt1', isCorrect: true },
  { question: 'Q6', selected: 'B: opt2', correct: 'B: opt2', isCorrect: true },
  { question: 'Q7', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q8', selected: 'D: opt4', correct: 'D: opt4', isCorrect: true },
  { question: 'Q9', selected: 'A: opt1', correct: 'B: opt2', isCorrect: false },
  { question: 'Q10', selected: 'C: opt3', correct: 'D: opt4', isCorrect: false },
];
const res2 = analyzeAnswers(test2Answers, 10);
console.log(res2);
if (res2.unanswered !== 2 || !res2.validInvariants || res2.questionsAttempted !== 8 || res2.correctAnswers !== 6 || res2.wrongAnswers !== 2) throw new Error('Test 2 failed');

console.log('\n--- TEST 3: User lets timer expire on 3 questions (10 Qs, 5 correct, 2 wrong, 3 timed out) ---');
const test3Answers = [
  { question: 'Q1', selected: 'A: opt1', correct: 'A: opt1', isCorrect: true },
  { question: 'Q2', selected: 'None (Timed Out)', correct: 'B: opt2', isCorrect: false },
  { question: 'Q3', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q4', selected: 'None (Timed Out)', correct: 'D: opt4', isCorrect: false },
  { question: 'Q5', selected: 'None (Timed Out)', correct: 'A: opt1', isCorrect: false },
  { question: 'Q6', selected: 'B: opt2', correct: 'B: opt2', isCorrect: true },
  { question: 'Q7', selected: 'C: opt3', correct: 'C: opt3', isCorrect: true },
  { question: 'Q8', selected: 'D: opt4', correct: 'D: opt4', isCorrect: true },
  { question: 'Q9', selected: 'A: opt1', correct: 'B: opt2', isCorrect: false },
  { question: 'Q10', selected: 'C: opt3', correct: 'D: opt4', isCorrect: false },
];
const res3 = analyzeAnswers(test3Answers, 10);
console.log(res3);
if (res3.unanswered !== 3 || !res3.validInvariants || res3.questionsAttempted !== 7 || res3.correctAnswers !== 5 || res3.wrongAnswers !== 2) throw new Error('Test 3 failed');

console.log('\n--- TEST 4: User example from prompt (Total 50, Attempted 44, Correct 35, Wrong 9, Unanswered 6) ---');
const test4Answers = [];
for (let i = 1; i <= 35; i++) test4Answers.push({ question: `Q${i}`, selected: 'A: opt', correct: 'A: opt', isCorrect: true });
for (let i = 36; i <= 44; i++) test4Answers.push({ question: `Q${i}`, selected: 'A: opt', correct: 'B: opt', isCorrect: false });
for (let i = 45; i <= 50; i++) test4Answers.push({ question: `Q${i}`, selected: 'None (Timed Out)', correct: 'A: opt', isCorrect: false });
const res4 = analyzeAnswers(test4Answers, 50);
console.log(res4);
if (res4.unanswered !== 6 || res4.questionsAttempted !== 44 || res4.correctAnswers !== 35 || res4.wrongAnswers !== 9 || !res4.validInvariants) throw new Error('Test 4 failed');

console.log('\n✅ ALL UNANSWERED CALCULATIONS AND INVARIANTS VERIFIED SUCCESSFULLY!');
