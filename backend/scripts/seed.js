const { supabaseAdmin } = require('../db');
const CONCEPT_DESCRIPTIONS = require('../../definitions.js');

// List of 17 categories
const categories = [
  'AI',
  'HTML',
  'CSS',
  'JavaScript',
  'Java',
  'Python',
  'C',
  'C++',
  'DBMS',
  'SQL',
  'MongoDB',
  'NodeJS',
  'React',
  'DSA',
  'OS',
  'CN',
  'SE'
];

// Helper to generate template questions (1,785 questions)
function generateAllQuestions() {
  const allQuestions = [];

  categories.forEach(cat => {
    ['easy', 'medium', 'hard'].forEach(diff => {
      for (let i = 1; i <= 50; i++) {
        const qObj = getQuestionTemplate(cat, diff, i);
        allQuestions.push(qObj);
      }
    });
  });

  return allQuestions;
}

// Generates unique, highly technical, and readable questions
function getQuestionTemplate(cat, diff, index) {
  const categoryKey = cat;
  const diffKey = diff.toLowerCase();
  
  const catGroup = CONCEPT_DESCRIPTIONS[categoryKey] || {};
  const diffGroup = catGroup[diffKey] || {};
  
  const allConcepts = Object.keys(diffGroup);
  let concept = allConcepts[(index - 1) % allConcepts.length];
  
  if (!concept) {
    throw new Error(`Concept not found for category ${cat}, difficulty ${diff}, index ${index}`);
  }
  
  const phrasings = [
    `In ${cat} development, what is the primary role or definition of "${concept}"?`,
    `Which of the following best describes the functionality or definition of "${concept}" in ${cat}?`,
    `How is the concept "${concept}" typically defined or utilized in the context of ${cat}?`,
    `In the scope of ${cat} technology, which statement accurately represents "${concept}"?`,
    `What is the core purpose or behavioral mechanism of "${concept}" within ${cat}?`
  ];
  
  const question_text = phrasings[(index - 1) % phrasings.length] + ` (Q-ID: ${cat}-${diffKey.toUpperCase().substring(0, 1)}-${index})`;
  
  const correctDescription = diffGroup[concept];
  const otherConcepts = allConcepts.filter(c => c !== concept);
  
  const distractors = [];
  if (otherConcepts.length >= 3) {
    const shuffledOthers = [...otherConcepts].sort(() => 0.5 - Math.random());
    distractors.push(diffGroup[shuffledOthers[0]]);
    distractors.push(diffGroup[shuffledOthers[1]]);
    distractors.push(diffGroup[shuffledOthers[2]]);
  } else {
    distractors.push(`Alternative mechanism for ${cat} development.`);
    distractors.push(`Standard configuration module in ${cat} application.`);
    distractors.push(`Process optimization handler in ${cat} framework.`);
  }
  
  const option_a = correctDescription;
  const option_b = distractors[0];
  const option_c = distractors[1];
  const option_d = distractors[2];
  
  const optionsList = [
    { isCorrect: true, text: option_a },
    { isCorrect: false, text: option_b },
    { isCorrect: false, text: option_c },
    { isCorrect: false, text: option_d }
  ];

  // Shuffle option positions
  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
  }

  const keys = ['A', 'B', 'C', 'D'];
  const correctIdx = optionsList.findIndex(o => o.isCorrect);
  const correct_option = keys[correctIdx];

  const explanation = `"${concept}" is an essential component, pattern, or method in ${cat} used for structuring code, managing memory, or executing operations.`;
  const hint = `Relies on core ${cat} properties and standards.`;

  return {
    category: cat,
    difficulty: diff.toLowerCase(),
    question_text,
    option_a: optionsList[0].text,
    option_b: optionsList[1].text,
    option_c: optionsList[2].text,
    option_d: optionsList[3].text,
    correct_option,
    explanation,
    hint
  };
}

// Database Seeder Execution
async function seedDatabase() {
  console.log('🌱 Starting Supabase database seeding script...');

  try {
    // 1. Clear old questions to avoid duplicates
    const { error: deleteError } = await supabaseAdmin
      .from('questions')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      throw new Error('Failed to clear old questions: ' + deleteError.message);
    }
    console.log('🧹 Cleared existing questions table on Supabase.');

    // 2. Generate questions
    const questionsList = generateAllQuestions();
    console.log(`🧠 Generated ${questionsList.length} unique quiz questions across ${categories.length} categories.`);

    // 3. Batch insert questions in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < questionsList.length; i += chunkSize) {
      const chunk = questionsList.slice(i, i + chunkSize);
      const { error: insertError } = await supabaseAdmin
        .from('questions')
        .insert(chunk);

      if (insertError) {
        throw new Error(`Failed to insert chunk ${i / chunkSize}: ` + insertError.message);
      }
      console.log(`🚀 Inserted questions ${i + 1} to ${Math.min(i + chunkSize, questionsList.length)}...`);
    }

    console.log(`✅ Seeding completed! Supabase database successfully loaded with ${questionsList.length} questions.`);

    // Verify count
    const { count, error: countError } = await supabaseAdmin
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error verifying questions count:', countError.message);
    } else {
      console.log(`📊 Total questions currently in Supabase database: ${count}`);
    }

  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
  }
}

// Execute if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  generateAllQuestions,
  seedDatabase
};
