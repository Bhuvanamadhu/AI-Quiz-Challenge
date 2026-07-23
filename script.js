/* ===================================================
   AI QUIZ CHALLENGE - CORE FRONTEND CONTROLLER
   =================================================== */

// 1. DYNAMIC RETRO SOUNDS ENGINE (Web Audio API Synthesizer)
const AudioSynth = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.log('Audio playback blocked by browser security policy.', e);
    }
  },
  playCorrect() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) { }
  },
  playWrong() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) { }
  },
  playVictory() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      const dur = 0.1;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * dur);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * dur);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * dur + 0.25);
        osc.start(this.ctx.currentTime + idx * dur);
        osc.stop(this.ctx.currentTime + idx * dur + 0.25);
      });
    } catch (e) { }
  },
  playGameOver() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
      const dur = 0.16;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * dur);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * dur);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * dur + 0.35);
        osc.start(this.ctx.currentTime + idx * dur);
        osc.stop(this.ctx.currentTime + idx * dur + 0.35);
      });
    } catch (e) { }
  }
};

// 2. STATIC FALLBACK DATA FOR OFFLINE MOCK MODE
const FALLBACK_QUESTION_POOL = [
  // AI
  { id: 101, category: 'AI', difficulty: 'easy', question_text: 'Which AI technology converts audio recordings of spoken speech into text scripts?', option_a: 'Speech-to-text Speech Recognition', option_b: 'SQL Database indexing', option_c: 'Self-driving vehicle LiDAR', option_d: 'CSS animations variables', correct_option: 'A', explanation: 'Speech Recognition handles translation of voice waves into typed letters.', hint: 'Deals with speech and audio inputs.' },
  { id: 102, category: 'AI', difficulty: 'medium', question_text: 'Which machine learning type trains models on unlabeled patterns to discover structures like clusters?', option_a: 'Supervised Learning', option_b: 'Unsupervised Learning', option_c: 'Relational query parsing', option_d: 'None of the above', correct_option: 'B', explanation: 'Unsupervised learning uses unlabeled data to group inputs by traits.', hint: 'The model has no target output labels.' },
  { id: 103, category: 'AI', difficulty: 'hard', question_text: 'What issue occurs when deep neural network weights derivatives approach zero, stalling weights updates during backpropagation?', option_a: 'Vanishing Gradient Problem', option_b: 'Overfitting Regularization', option_c: 'Database Lockout errors', option_d: 'Memory leak allocations', correct_option: 'A', explanation: 'Vanishing Gradients block weights adjustment in deep structures due to tiny activations products.', hint: 'Relies on sigmoid or tanh saturation.' },
  // HTML
  { id: 111, category: 'HTML', difficulty: 'easy', question_text: 'Which standard HTML element is used to insert a clickable anchor hyperlink?', option_a: '<a>', option_b: '<link>', option_c: '<href>', option_d: '<anchor>', correct_option: 'A', explanation: 'The <a> tag creates clickable link pathways.', hint: 'Represented by a single letter.' },
  { id: 112, category: 'HTML', difficulty: 'medium', question_text: 'Which attribute tells search engine spiders or screen readers alternative description for an image?', option_a: 'src', option_b: 'alt', option_c: 'href', option_d: 'title', correct_option: 'B', explanation: 'The "alt" attribute provides alternative descriptive text for graphics.', hint: 'Stands for alternative.' },
  { id: 113, category: 'HTML', difficulty: 'hard', question_text: 'Which HTML5 API allows complex JavaScript algorithms to execute in background threads without blocking browser UI?', option_a: 'Canvas API', option_b: 'Web Workers API', option_c: 'LocalStorage parameters', option_d: 'IndexedDB databases', correct_option: 'B', explanation: 'Web Workers spin off separate threads, keeping UI inputs active.', hint: 'Runs in background threads.' },
  // CSS
  { id: 121, category: 'CSS', difficulty: 'easy', question_text: 'Which property changes paragraph text coloring in CSS?', option_a: 'text-color', option_b: 'color', option_c: 'font-color', option_d: 'background-color', correct_option: 'B', explanation: 'The "color" property sets foreground font colors.', hint: 'A five-letter word.' },
  { id: 122, category: 'CSS', difficulty: 'medium', question_text: 'Which media tool lets styles dynamically adapt to browser viewport widths?', option_a: 'Media Queries', option_b: 'CSS Grid template', option_c: 'Flexbox direction', option_d: 'Variables custom properties', correct_option: 'A', explanation: 'Media queries check screen specs, adjusting CSS templates.', hint: 'Used for responsive layout shifts.' },
  { id: 123, category: 'CSS', difficulty: 'hard', question_text: 'What is the correct weight ordering of CSS specificity elements?', option_a: 'Inline styles > ID > Class > Element', option_b: 'ID > Inline styles > Class > Element', option_c: 'Element > Class > ID > Inline styles', option_d: 'Variables override selectors', correct_option: 'A', explanation: 'Inline styles weight 1000, ID 100, Class/attribute 10, Element tag 1.', hint: 'Inline has the highest style weight.' },
  // JS
  { id: 131, category: 'JavaScript', difficulty: 'easy', question_text: 'Which keyword creates variables that cannot be reassigned?', option_a: 'let', option_b: 'var', option_c: 'const', option_d: 'define', correct_option: 'C', explanation: 'The const keyword enforces block-scoped immutability on bindings.', hint: 'Short for constant.' },
  { id: 132, category: 'JavaScript', difficulty: 'medium', question_text: 'Which array helper method evaluates values, returning a brand new array containing only matching elements?', option_a: 'map', option_b: 'filter', option_c: 'reduce', option_d: 'find', correct_option: 'B', explanation: 'Filter returns elements returning true in evaluated callback queries.', hint: 'Filters out items.' },
  { id: 133, category: 'JavaScript', difficulty: 'hard', question_text: 'What does JS function closure represent?', option_a: 'A function that remembers its lexical scope variables even when executed outside it', option_b: 'Closing HTML DOM selectors automatically', option_c: 'Replacing values inside arrays', option_d: 'Checking SQLite database ports', correct_option: 'A', explanation: 'Closures bundle functions with references to surrounding state scopes.', hint: 'Relies on function scopes.' },
  // Python
  { id: 141, category: 'Python', difficulty: 'easy', question_text: 'How does Python designate local scope blocks instead of using braces?', option_a: 'Whitespace Indentation and Colon', option_b: 'Parentheses wrapping', option_c: 'Semicolon terminal lines', option_d: 'HTML tags', correct_option: 'A', explanation: 'Python enforces structured indentation and a colon to represent loops/methods blocks.', hint: 'Indentations are critical.' }
];

// 3. APPLICATION STATE STORE
const AppState = {
  // Configs
  apiBase: 'http://localhost:5000/api',
  isOnline: false,

  // User details
  token: localStorage.getItem('quiz_token') || null,
  user: null,
  bookmarkedQuestionIds: [],

  // Active quiz status
  quiz: {
    category: 'AI',
    difficulty: 'easy',
    gameMode: 'classic',
    questions: [],
    currentIndex: 0,
    score: 0,
    lives: 3,
    timeLeft: 15,
    timerInterval: null,
    autoNextTimeout: null, // handles auto-transition between questions
    answersLog: [], // records { question, selected, correct, isCorrect, explanation }
    hintsRemaining: 3,
    lifelinesUsed: 0,
    lifelines: {
      '5050': false,
      'skip': false,
      'time': false
    },
    streakCount: 0 // consecutive correct answers for survival life restore
  },

  // Active panel
  activeView: 'landing'
};

// Top-level Global Translation Helpers (Prevent ReferenceErrors across scopes)
window.currentLang = window.currentLang || 'en';
function translateQuestion(q, lang) {
  if (typeof window.translateQuestion === 'function' && window.translateQuestion !== translateQuestion) {
    return window.translateQuestion(q, lang);
  }
  return q;
}
function translateQuestionOption(text, lang) {
  if (typeof window.translateQuestionOption === 'function' && window.translateQuestionOption !== translateQuestionOption) {
    return window.translateQuestionOption(text, lang);
  }
  return text;
}
function translateUI(lang) {
  if (typeof window.translateUI === 'function' && window.translateUI !== translateUI) {
    return window.translateUI(lang);
  }
}

// 4. NETWORK CLIENT & MOCK ENGINE (Dual-Execution Router)
const NetworkClient = {
  // Check if API is available, otherwise log fallback
  async checkConnection() {
    try {
      const res = await fetch(`${AppState.apiBase}/leaderboard`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        AppState.isOnline = true;
        document.getElementById('app-mode-label').innerText = 'Online Server Mode';
        document.getElementById('app-mode-label').className = 'badge';
        console.log('📡 Connected to Express backend successfully!');
      } else {
        throw new Error('Server returned error status');
      }
    } catch (e) {
      AppState.isOnline = false;
      document.getElementById('app-mode-label').innerText = 'Offline Fallback Mode';
      document.getElementById('app-mode-label').className = 'badge badge-role';
      console.warn('⚠️ Server unreachable. Falling back to offline client-side simulation.', e.message);
    }
  },

  // HTTP Request Helper
  async request(endpoint, method = 'GET', body = null) {
    if (!AppState.isOnline) {
      return MockDatabase.handle(endpoint, method, body);
    }

    const headers = { 'Content-Type': 'application/json' };
    if (AppState.token) {
      headers['Authorization'] = `Bearer ${AppState.token}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${AppState.apiBase}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Network error');
      }
      return data;
    } catch (e) {
      // If server goes down mid-session, fallback gracefully
      console.error(`API fail: ${endpoint}. Falling back to simulation.`, e);
      AppState.isOnline = false;
      document.getElementById('app-mode-label').innerText = 'Offline Fallback Mode';
      document.getElementById('app-mode-label').className = 'badge badge-role';
      return MockDatabase.handle(endpoint, method, body);
    }
  }
};

// 5. LOCAL STORAGE MOCK DATABASE (Simulating relational database schemas client-side)
const MockDatabase = {
  init() {
    if (!localStorage.getItem('mock_questions_cache')) {
      localStorage.setItem('mock_questions_cache', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_users')) {
      // Initialize mock tables
      localStorage.setItem('mock_users', JSON.stringify([
        { id: 1, username: 'admin', email: 'admin@quiz.com', passwordHash: 'admin123', role: 'admin', profile_pic: '', bio: 'System administrator and content editor.', fav_category: 'AI' },
        { id: 2, username: 'cyber_ninja', email: 'ninja@quiz.com', passwordHash: 'ninja123', role: 'user', profile_pic: '', bio: 'Shadow coding in the dark.', fav_category: 'JavaScript' },
        { id: 3, username: 'code_wizard', email: 'wizard@quiz.com', passwordHash: 'wizard123', role: 'user', profile_pic: '', bio: 'Presto! Making bugs disappear since 2012.', fav_category: 'Python' }
      ]));
      localStorage.setItem('mock_progress', JSON.stringify({
        '1': { total_xp: 750, quizzes_completed: 12, perfect_quizzes: 2, daily_streak: 2, last_active: '2026-07-15', total_coins: 750, selected_theme: 'dark', avatar: '👤', avatar_frame: '' },
        '2': { total_xp: 450, quizzes_completed: 8, perfect_quizzes: 0, daily_streak: 1, last_active: '2026-07-16', total_coins: 450, selected_theme: 'dark', avatar: '🥷', avatar_frame: '' },
        '3': { total_xp: 1200, quizzes_completed: 20, perfect_quizzes: 5, daily_streak: 4, last_active: '2026-07-16', total_coins: 1200, selected_theme: 'dark', avatar: '🧙‍♂️', avatar_frame: '' }
      }));
      localStorage.setItem('mock_achievements', JSON.stringify([
        { user_id: 1, badge_id: 'first_step' },
        { user_id: 3, badge_id: 'first_step' },
        { user_id: 3, badge_id: 'perfectionist' },
        { user_id: 3, badge_id: 'quiz_master' }
      ]));
      localStorage.setItem('mock_attempts', JSON.stringify([
        { user_id: 3, category: 'JavaScript', difficulty: 'medium', score: 10, total_questions: 10, game_mode: 'classic', lifelines_used: 0, attempted_at: '2026-07-15' }
      ]));
    }
    if (!localStorage.getItem('mock_notifications')) {
      localStorage.setItem('mock_notifications', JSON.stringify([
        { id: 1, user_id: 0, title: 'Welcome to AI Quiz Challenge!', message: 'Earn XP, climb the leaderboard, and unlock premium skins!', type: 'announcement', read: 0, created_at: new Date().toISOString() },
        { id: 2, user_id: 0, title: 'Tamil & Hindi languages added!', message: 'Switch instantly in the header without page refresh.', type: 'announcement', read: 0, created_at: new Date().toISOString() }
      ]));
    }
    if (!localStorage.getItem('mock_feedback')) {
      localStorage.setItem('mock_feedback', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_reports')) {
      localStorage.setItem('mock_reports', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_purchases')) {
      localStorage.setItem('mock_purchases', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_certificates')) {
      localStorage.setItem('mock_certificates', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_login_history')) {
      localStorage.setItem('mock_login_history', JSON.stringify([
        { user_id: 1, ip_address: '127.0.0.1', device_agent: 'Mock Chrome/Windows', logged_in_at: new Date().toISOString() }
      ]));
    }
    if (!localStorage.getItem('mock_otp_codes')) {
      localStorage.setItem('mock_otp_codes', JSON.stringify([]));
    }
  },

  generateDynamicQuestion(cat, diff, index) {
    const categoryKey = Object.keys(CONCEPT_DESCRIPTIONS || {}).find(k => k.toLowerCase() === (cat || '').toLowerCase()) || cat;
    const diffKey = (diff || 'easy').toLowerCase();

    // Get concept definitions for this category and difficulty
    const catGroup = CONCEPT_DESCRIPTIONS[categoryKey] || {};
    const diffGroup = catGroup[diffKey] || {};

    const allConcepts = Object.keys(diffGroup);
    let concept = allConcepts[(index - 1) % allConcepts.length];

    if (!concept) {
      // Standard fallback list if CONCEPT_DESCRIPTIONS is not loaded or missing keys
      concept = `Concept ${index}`;
      diffGroup[concept] = `A core specification or mechanism in ${cat} for concept ${index}.`;
      allConcepts.push(concept);
    }

    // Select phrasing dynamically based on index to ensure uniqueness across 50 questions
    const phrasings = [
      `In ${cat} development, what is the primary role or definition of "${concept}"?`,
      `Which of the following best describes the functionality or definition of "${concept}" in ${cat}?`,
      `How is the concept "${concept}" typically defined or utilized in the context of ${cat}?`,
      `In the scope of ${cat} technology, which statement accurately represents "${concept}"?`,
      `What is the core purpose or behavioral mechanism of "${concept}" within ${cat}?`
    ];
    const question_text = phrasings[(index - 1) % phrasings.length] + ` (Dynamic Q-ID: ${cat}-${diff}-${index})`;

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

    // Shuffle options so correct answer position is randomized
    for (let i = optionsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
    }

    const keys = ['A', 'B', 'C', 'D'];
    const correctIdx = optionsList.findIndex(o => o.isCorrect);
    const correct_option = keys[correctIdx];

    const questionObj = {
      id: 9000 + index + (allConcepts.indexOf(concept) * 10) + (cat.charCodeAt(0) * 100),
      category: cat,
      difficulty: diff.toLowerCase(),
      question_text,
      option_a: optionsList[0].text,
      option_b: optionsList[1].text,
      option_c: optionsList[2].text,
      option_d: optionsList[3].text,
      correct_option,
      explanation: `"${concept}" is an essential component, pattern, or method in ${cat} used for structuring code, managing memory, or executing operations.`,
      hint: `Relies on core ${cat} properties and standards.`
    };

    // Cache dynamic question in localStorage for bookmarks lookup
    try {
      const cache = JSON.parse(localStorage.getItem('mock_questions_cache') || '[]');
      if (!cache.some(q => q.id === questionObj.id)) {
        cache.push(questionObj);
        localStorage.setItem('mock_questions_cache', JSON.stringify(cache));
      }
    } catch (e) {
      console.warn('Failed to cache mock question:', e);
    }

    return questionObj;
  },

  handle(endpoint, method, body) {
    this.init();

    // Auth Register
    if (endpoint === '/auth/register' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      if (users.find(u => u.username === body.username || u.email === body.email)) {
        return Promise.reject({ message: 'Username or Email already exists.' });
      }
      const newId = users.length + 1;
      const role = body.username === 'admin' ? 'admin' : 'user';
      users.push({ id: newId, username: body.username, email: body.email, passwordHash: body.password, role });
      localStorage.setItem('mock_users', JSON.stringify(users));

      // Setup mock progress
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      progress[newId] = { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0, last_active: null };
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      return Promise.resolve({ message: 'User registered.', userId: newId });
    }

    // Auth Login
    if (endpoint === '/auth/login' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const user = users.find(u => u.username === body.username && u.passwordHash === body.password);
      if (!user) {
        return Promise.reject({ message: 'Invalid username or password.' });
      }
      const mockToken = `mock_jwt_token_for_${user.username}`;
      return Promise.resolve({
        token: mockToken,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }

    // Load Session Profile
    if (endpoint === '/auth/me' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const progress = JSON.parse(localStorage.getItem('mock_progress'))[user.id] || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };
      const allAchievements = JSON.parse(localStorage.getItem('mock_achievements'));
      const userAchievements = allAchievements.filter(a => a.user_id === user.id);
      const attempts = JSON.parse(localStorage.getItem('mock_attempts')).filter(a => a.user_id === user.id);

      return Promise.resolve({
        user,
        progress,
        achievements: userAchievements,
        history: attempts.slice(-10)
      });
    }

    // Fetch Questions
    if (endpoint.startsWith('/quiz/questions') && method === 'GET') {
      const urlParams = new URLSearchParams(endpoint.split('?')[1]);
      let cat = urlParams.get('category') || 'AI';
      let diff = urlParams.get('difficulty') || 'easy';
      const limit = parseInt(urlParams.get('limit') || '10');

      if (cat.trim() === 'C' && endpoint.includes('C%2B%2B')) {
        cat = 'C++';
      }

      // Filter local questions pool (case-insensitive)
      let matches = FALLBACK_QUESTION_POOL.filter(
        q => q.category.toLowerCase() === cat.toLowerCase() && q.difficulty.toLowerCase() === diff.toLowerCase()
      );
      if (matches.length < 50) {
        // Dynamically generate high-quality mock questions offline to satisfy category coverage of 100+ questions
        const startIdx = matches.length + 1;
        for (let i = startIdx; i <= 50; i++) {
          matches.push(MockDatabase.generateDynamicQuestion(cat, diff, i));
        }
      }
      // Shuffle matches
      const shuffled = [...matches].sort(() => 0.5 - Math.random());
      return Promise.resolve(shuffled.slice(0, limit));
    }

    // Submit Quiz Score
    if (endpoint === '/quiz/submit' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);

      const attempts = JSON.parse(localStorage.getItem('mock_attempts'));
      attempts.push({
        user_id: user.id,
        category: body.category,
        difficulty: body.difficulty,
        score: body.score,
        total_questions: body.totalQuestions,
        game_mode: body.game_mode || 'classic',
        lifelines_used: body.lifelines_used || 0,
        attempted_at: new Date().toISOString()
      });
      localStorage.setItem('mock_attempts', JSON.stringify(attempts));

      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const uProg = progress[user.id] || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };

      // Calculate XP
      let mult = 10;
      if (body.difficulty === 'easy') mult = 5;
      if (body.difficulty === 'hard') mult = 15;
      let earnedXp = body.score * mult;
      const isPerfect = body.score === body.totalQuestions;
      if (isPerfect) earnedXp += 50; // Perfect bonus

      // Game Mode Bonus
      const mode = (body.game_mode || 'classic').toLowerCase();
      if (mode === 'speed') earnedXp = Math.round(earnedXp * 1.3);
      if (mode === 'survival') earnedXp = Math.round(earnedXp * 1.5);
      if (mode === 'marathon') earnedXp = Math.round(earnedXp * 1.2);

      earnedXp += 10; // Completion bonus

      // Streak math
      const today = new Date().toISOString().split('T')[0];
      if (uProg.last_active) {
        const diff = Math.ceil(Math.abs(new Date(today) - new Date(uProg.last_active)) / (1000 * 60 * 60 * 24));
        if (diff === 1) uProg.daily_streak += 1;
        else if (diff > 1) uProg.daily_streak = 1;
      } else {
        uProg.daily_streak = 1;
      }

      // Streak Multiplier
      if (uProg.daily_streak >= 14) earnedXp = Math.round(earnedXp * 1.5);
      else if (uProg.daily_streak >= 7) earnedXp = Math.round(earnedXp * 1.3);
      else if (uProg.daily_streak >= 3) earnedXp = Math.round(earnedXp * 1.15);

      uProg.total_xp += earnedXp;
      uProg.total_coins = (uProg.total_coins || 0) + earnedXp;
      uProg.quizzes_completed += 1;
      if (isPerfect) uProg.perfect_quizzes += 1;
      uProg.last_active = today;

      progress[user.id] = uProg;
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      // Achievements Checks
      const achievements = JSON.parse(localStorage.getItem('mock_achievements'));
      const unlockedBadges = [];
      const userBadges = achievements.filter(a => a.user_id === user.id).map(a => a.badge_id);

      const giveBadge = (badgeId) => {
        if (!userBadges.includes(badgeId)) {
          achievements.push({ user_id: user.id, badge_id: badgeId });
          unlockedBadges.push(badgeId);
        }
      };

      // original badges
      if (uProg.quizzes_completed >= 1) giveBadge('first_step');
      if (uProg.perfect_quizzes >= 1) giveBadge('perfectionist');
      if (uProg.quizzes_completed >= 10) giveBadge('quiz_master');
      if (isPerfect && body.difficulty === 'hard') giveBadge('legendary_brain');
      if (uProg.daily_streak >= 3) giveBadge('dedicated_scholar');
      if (isPerfect && body.category === 'AI') giveBadge('ai_guru');

      // Four newly requested badges
      if (uProg.daily_streak >= 5) giveBadge('quiz_streak_5');
      if (uProg.perfect_quizzes >= 10) giveBadge('perfect_10');
      if (uProg.quizzes_completed >= 25) giveBadge('completed_25');
      if (uProg.total_xp >= 1000) giveBadge('xp_1000');

      // new badges
      if (mode === 'speed') giveBadge('speed_demon');
      if (mode === 'survival' && body.score >= 20) giveBadge('survivor');
      if (mode === 'marathon') giveBadge('marathon_runner');
      if (uProg.quizzes_completed >= 50) giveBadge('half_century');
      if (uProg.quizzes_completed >= 100) giveBadge('century_club');
      if (uProg.daily_streak >= 7) giveBadge('streak_king');
      if (uProg.daily_streak >= 14) giveBadge('unstoppable');
      if (uProg.perfect_quizzes >= 5) giveBadge('perfectionist_elite');
      if (isPerfect && body.difficulty === 'hard' && (!body.lifelines_used || body.lifelines_used === 0)) {
        giveBadge('no_lifeline');
      }

      const currentHour = new Date().getHours();
      if (currentHour >= 0 && currentHour < 5) giveBadge('night_owl');
      if (currentHour >= 5 && currentHour < 7) giveBadge('early_bird');

      const userAttempts = attempts.filter(a => a.user_id === user.id);
      const distinctCats = [...new Set(userAttempts.map(a => a.category))];
      if (distinctCats.length >= 10) giveBadge('jack_of_all_trades');

      const perfectCats = [...new Set(userAttempts.filter(a => a.score === a.total_questions).map(a => a.category))];
      if (perfectCats.length >= 5) giveBadge('category_master');

      localStorage.setItem('mock_achievements', JSON.stringify(achievements));

      return Promise.resolve({
        xpEarned: earnedXp,
        newTotalXp: uProg.total_xp,
        newCoins: uProg.total_coins,
        streak: uProg.daily_streak,
        streakMultiplier: uProg.daily_streak >= 14 ? '2x' : uProg.daily_streak >= 7 ? '1.5x' : uProg.daily_streak >= 3 ? '1.25x' : '1x',
        isPerfect,
        unlockedBadges
      });
    }

    // Toggle Bookmark
    if (endpoint.startsWith('/bookmarks/') && method === 'POST') {
      const qId = parseInt(endpoint.split('/').pop());
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      let bookmarks = JSON.parse(localStorage.getItem('mock_bookmarks') || '[]');
      const existingIdx = bookmarks.findIndex(b => b.user_id === user.id && b.question_id === qId);

      if (existingIdx !== -1) {
        bookmarks.splice(existingIdx, 1);
        localStorage.setItem('mock_bookmarks', JSON.stringify(bookmarks));
        return Promise.resolve({ bookmarked: false, message: 'Bookmark removed.' });
      } else {
        bookmarks.push({ user_id: user.id, question_id: qId });
        localStorage.setItem('mock_bookmarks', JSON.stringify(bookmarks));
        return Promise.resolve({ bookmarked: true, message: 'Question bookmarked.' });
      }
    }

    // Get Bookmark IDs
    if (endpoint === '/bookmarks/ids' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      let bookmarks = JSON.parse(localStorage.getItem('mock_bookmarks') || '[]');
      const bookmarkedIds = bookmarks.filter(b => b.user_id === user.id).map(b => b.question_id);
      return Promise.resolve(bookmarkedIds);
    }

    // Get Bookmarks full details
    if (endpoint === '/bookmarks' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      let bookmarks = JSON.parse(localStorage.getItem('mock_bookmarks') || '[]');
      const userBookmarks = bookmarks.filter(b => b.user_id === user.id);
      const result = [];
      userBookmarks.forEach(b => {
        let question = FALLBACK_QUESTION_POOL.find(q => q.id === b.question_id);
        if (!question) {
          const cache = JSON.parse(localStorage.getItem('mock_questions_cache') || '[]');
          question = cache.find(q => q.id === b.question_id);
        }
        if (question) {
          result.push(question);
        }
      });
      return Promise.resolve(result);
    }

    // Daily Challenge
    if (endpoint === '/quiz/daily-challenge' && method === 'GET') {
      const today = new Date().toISOString().split('T')[0];
      const dailyQ = FALLBACK_QUESTION_POOL.slice(0, 10);
      return Promise.resolve({
        date: today,
        questions: dailyQ
      });
    }

    // Get Leaderboard
    if (endpoint.startsWith('/leaderboard') && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const list = users.map(u => {
        const prog = progress[u.id] || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };
        return {
          user_id: u.id,
          username: u.username,
          total_xp: prog.total_xp,
          quizzes_completed: prog.quizzes_completed,
          perfect_quizzes: prog.perfect_quizzes,
          daily_streak: prog.daily_streak
        };
      }).sort((a, b) => b.total_xp - a.total_xp);

      return Promise.resolve(list);
    }

    // Delete Leaderboard Score Entry (Mock handler)
    if (endpoint.startsWith('/leaderboard/') && method === 'DELETE') {
      const targetUserId = parseInt(endpoint.split('/').pop());
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      if (user.role !== 'admin' && user.id !== targetUserId) {
        return Promise.reject({ message: 'Permission denied. You can only delete your own score.' });
      }

      const progress = JSON.parse(localStorage.getItem('mock_progress') || '{}');
      if (progress[targetUserId]) {
        progress[targetUserId].total_xp = 0;
        progress[targetUserId].quizzes_completed = 0;
        progress[targetUserId].perfect_quizzes = 0;
        progress[targetUserId].daily_streak = 0;
        localStorage.setItem('mock_progress', JSON.stringify(progress));
      }

      let attempts = JSON.parse(localStorage.getItem('mock_attempts') || '[]');
      attempts = attempts.filter(a => a.user_id !== targetUserId);
      localStorage.setItem('mock_attempts', JSON.stringify(attempts));

      return Promise.resolve({ message: 'Mock leaderboard score reset successfully.' });
    }

    // Admin searches questions
    if (endpoint.startsWith('/admin/questions/search') && method === 'GET') {
      const urlParams = new URLSearchParams(endpoint.split('?')[1]);
      const query = urlParams.get('query') || '';
      const list = FALLBACK_QUESTION_POOL.filter(q => q.question_text.toLowerCase().includes(query.toLowerCase()));
      return Promise.resolve(list);
    }

    // Admin creates question
    if (endpoint === '/admin/questions' && method === 'POST') {
      const newId = FALLBACK_QUESTION_POOL.length + 200;
      FALLBACK_QUESTION_POOL.push({ id: newId, ...body });
      return Promise.resolve({ message: 'Question created.', questionId: newId });
    }

    // Admin updates question
    if (endpoint.startsWith('/admin/questions/') && method === 'PUT') {
      const qId = parseInt(endpoint.split('/').pop());
      const idx = FALLBACK_QUESTION_POOL.findIndex(q => q.id === qId);
      if (idx !== -1) {
        FALLBACK_QUESTION_POOL[idx] = { id: qId, ...body };
      }
      return Promise.resolve({ message: 'Question updated.' });
    }

    // Admin deletes question
    if (endpoint.startsWith('/admin/questions/') && method === 'DELETE') {
      const qId = parseInt(endpoint.split('/').pop());
      const idx = FALLBACK_QUESTION_POOL.findIndex(q => q.id === qId);
      if (idx !== -1) {
        FALLBACK_QUESTION_POOL.splice(idx, 1);
      }
      return Promise.resolve({ message: 'Question deleted.' });
    }

    // Admin gets users
    if (endpoint === '/admin/users' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const list = users.map(u => {
        const prog = progress[u.id] || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          total_xp: prog.total_xp,
          quizzes_completed: prog.quizzes_completed
        };
      });
      return Promise.resolve(list);
    }

    // Admin deletes user
    if (endpoint.startsWith('/admin/users/') && method === 'DELETE') {
      const uId = parseInt(endpoint.split('/').pop());
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const idx = users.findIndex(u => u.id === uId);
      if (idx !== -1) {
        if (users[idx].role === 'admin') {
          return Promise.reject({ message: 'Cannot delete an Admin account.' });
        }
        users.splice(idx, 1);
        localStorage.setItem('mock_users', JSON.stringify(users));
      }
      return Promise.resolve({ message: 'User deleted.' });
    }

    // ================= DUAL MOCK ENDPOINTS IMPLEMENTATIONS =================

    // 1. Profile Update
    if (endpoint === '/profile' && method === 'PUT') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      // Update user columns
      user.bio = body.bio !== undefined ? body.bio : user.bio;
      user.profile_pic = body.profile_pic !== undefined ? body.profile_pic : user.profile_pic;
      user.fav_category = body.fav_category !== undefined ? body.fav_category : user.fav_category;
      if (body.username) {
        user.username = body.username;
      }
      localStorage.setItem('mock_users', JSON.stringify(users));

      // Update progress details
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const uProg = progress[user.id] || {};
      uProg.selected_theme = body.theme !== undefined ? body.theme : uProg.selected_theme;
      uProg.avatar = body.avatar !== undefined ? body.avatar : uProg.avatar;
      uProg.avatar_frame = body.avatar_frame !== undefined ? body.avatar_frame : uProg.avatar_frame;
      progress[user.id] = uProg;
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      return Promise.resolve({ message: 'Profile settings updated successfully.', user, progress: uProg });
    }

    // 2. Cosmetic Shop Items Catalog
    if (endpoint === '/shop/items' && method === 'GET') {
      const items = [
        { id: 'theme_cyberpunk', name: 'Cyberpunk Theme Purple', type: 'theme', value: 'theme-cyberpunk', cost: 500, description: 'Neon glow grid layout styling overrides' },
        { id: 'theme_forest', name: 'Forest Theme Green', type: 'theme', value: 'theme-forest', cost: 300, description: 'Lush organic emerald accents layout' },
        { id: 'theme_sunset', name: 'Sunset Theme Orange', type: 'theme', value: 'theme-sunset', cost: 400, description: 'Golden evening orange border styling' },
        { id: 'frame_neon', name: 'Neon Avatar Frame', type: 'avatar_frame', value: 'neon', cost: 200, description: 'Glow cyan frame border around avatar circle' },
        { id: 'frame_gold', name: 'Golden Royalty Frame', type: 'avatar_frame', value: 'gold', cost: 350, description: 'Sleek luxury gold border frame' },
        { id: 'frame_fire', name: 'Fire Flame Frame', type: 'avatar_frame', value: 'fire', cost: 600, description: 'Hot burning red border animation effects' },
        { id: 'avatar_robot', name: 'Robot Avatar 🤖', type: 'avatar', value: '🤖', cost: 100, description: 'Unlock android robot emoji custom avatar' },
        { id: 'avatar_brain', name: 'Super Brain 🧠', type: 'avatar', value: '🧠', cost: 150, description: 'Unlock glowing intellect brain avatar icon' },
        { id: 'avatar_ninja', name: 'Shadow Ninja 🥷', type: 'avatar', value: '🥷', cost: 200, description: 'Unlock silent shadow warrior avatar' },
        { id: 'powerup_hint', name: 'Bonus Quiz Hint (+1)', type: 'hint', value: '1', cost: 80, description: 'Increment initial gameplay hints count' },
        { id: 'powerup_life', name: 'Extra Lifeline Slot', type: 'lifeline', value: 'extra', cost: 120, description: 'Grants permanent access to extra lifeline configurations' }
      ];
      return Promise.resolve(items);
    }

    // 3. Purchase Item
    if (endpoint === '/shop/purchase' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const uProg = progress[user.id] || { total_coins: 0 };

      const cost = parseInt(body.cost);
      if ((uProg.total_coins || 0) < cost) {
        return Promise.reject({ message: 'Insufficient coins balance. Complete more quizzes!' });
      }

      uProg.total_coins = (uProg.total_coins || 0) - cost;
      progress[user.id] = uProg;
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      const purchases = JSON.parse(localStorage.getItem('mock_purchases') || '[]');
      purchases.push({
        user_id: user.id,
        item_id: body.itemId,
        item_name: body.itemName,
        item_type: body.itemType,
        cost,
        purchased_at: new Date().toISOString()
      });
      localStorage.setItem('mock_purchases', JSON.stringify(purchases));

      return Promise.resolve({ message: 'Purchase processed successfully.', total_coins: uProg.total_coins });
    }

    // 4. Shop Purchase History
    if (endpoint === '/shop/history' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const list = JSON.parse(localStorage.getItem('mock_purchases') || '[]').filter(p => p.user_id === user.id);
      return Promise.resolve(list);
    }

    // 5. Submit Rating Feedback
    if (endpoint === '/feedback' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      const uId = user ? user.id : 0;
      const username = user ? user.username : 'Guest';

      const feedback = JSON.parse(localStorage.getItem('mock_feedback') || '[]');
      feedback.push({
        id: feedback.length + 1,
        user_id: uId,
        username,
        rating: body.rating,
        comment: body.comment || '',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('mock_feedback', JSON.stringify(feedback));
      return Promise.resolve({ message: 'Feedback review submitted. Thanks!' });
    }

    // 6. Report Question
    if (endpoint === '/feedback/report' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      const uId = user ? user.id : 0;

      const reports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      reports.push({
        id: reports.length + 1,
        user_id: uId,
        question_id: body.questionId,
        reason: body.reason,
        comments: body.comments || '',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('mock_reports', JSON.stringify(reports));
      return Promise.resolve({ message: 'Question flagged. Support review logged.' });
    }

    // 7. Get Notifications
    if (endpoint === '/notifications' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
      return Promise.resolve(list);
    }

    // 8. Mark Notifications Read
    if (endpoint === '/notifications/read' && method === 'POST') {
      const list = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
      list.forEach(n => { n.read = 1; });
      localStorage.setItem('mock_notifications', JSON.stringify(list));
      return Promise.resolve({ message: 'Notifications cleared as read.' });
    }

    // 9. Claims Certificate Registry
    if (endpoint === '/certificates/claim' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const certs = JSON.parse(localStorage.getItem('mock_certificates') || '[]');
      const certId = 'CERT-' + Math.floor(100000 + Math.random() * 900000);
      const certObj = {
        id: certs.length + 1,
        cert_id: certId,
        user_id: user.id,
        user_name: user.username,
        category: body.category,
        score: body.score,
        total_questions: body.totalQuestions,
        claimed_at: new Date().toISOString().split('T')[0]
      };
      certs.push(certObj);
      localStorage.setItem('mock_certificates', JSON.stringify(certs));
      return Promise.resolve(certObj);
    }

    // 10. List claimed certificates
    if (endpoint === '/certificates' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const certs = JSON.parse(localStorage.getItem('mock_certificates') || '[]').filter(c => c.user_id === user.id);
      return Promise.resolve(certs);
    }

    // 11. Ask AI Tutor Explanation
    if (endpoint === '/tutor/explain' && method === 'POST') {
      const explanationHtml = `
        <h3>🧙‍♂️ AI Tutor Explanation</h3>
        <blockquote>Correct Answer: <strong>${body.correctOption}</strong></blockquote>
        
        <h4>💡 Detailed Explanation:</h4>
        <p>The question evaluated concepts regarding this subject. Option <strong>${body.correctOption}</strong> represents the correct standard because it matches specifications defined in frameworks and compilation rules.</p>
        
        <h4>⚠️ Why other choices are wrong:</h4>
        <ul>
          <li>Distractor options represent unrelated processes, incorrect scope parameters, or legacy configurations.</li>
          <li>They fail to satisfy requirements for execution runtime constraints.</li>
        </ul>

        <h4>📖 Code Analogy:</h4>
        <pre><code>// Correct usage example
const result = executePattern(conceptRef);
console.log(result); // Matches correctOption standard</code></pre>

        <h4>🛤️ Related Technical Topics:</h4>
        <p>Memory allocations, compiling pipelines, thread controls, layout rendering contexts.</p>
      `;
      return Promise.resolve({ explanation: explanationHtml });
    }

    // 12. Sync Offline Quiz Attempts
    if (endpoint === '/quiz/sync' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const attempts = JSON.parse(localStorage.getItem('mock_attempts') || '[]');
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const uProg = progress[user.id] || { total_xp: 0, quizzes_completed: 0, total_coins: 0 };

      let addedXp = 0;
      let addedCoins = 0;

      body.attempts.forEach(att => {
        attempts.push({
          user_id: user.id,
          category: att.category,
          difficulty: att.difficulty,
          score: att.score,
          total_questions: att.totalQuestions,
          game_mode: att.gameMode || 'classic',
          lifelines_used: att.lifelinesUsed || 0,
          attempted_at: att.attemptedAt || new Date().toISOString()
        });

        // XP/Coin calculations
        let mult = 10;
        if (att.difficulty === 'easy') mult = 5;
        if (att.difficulty === 'hard') mult = 15;
        let attemptXp = att.score * mult + 10; // score + completion
        addedXp += attemptXp;
        addedCoins += attemptXp; // 1 XP = 1 Coin rule
      });

      uProg.total_xp += addedXp;
      uProg.total_coins = (uProg.total_coins || 0) + addedCoins;
      uProg.quizzes_completed += body.attempts.length;
      progress[user.id] = uProg;

      localStorage.setItem('mock_attempts', JSON.stringify(attempts));
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      return Promise.resolve({ message: 'Offline progress synced successfully.', syncedCount: body.attempts.length, addedXp, addedCoins });
    }

    // 13. Recover password (Forgot / OTP codes flow)
    if (endpoint === '/auth/otp/send' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const user = users.find(u => u.email === body.email);
      if (!user) {
        return Promise.reject({ message: 'Email address not registered.' });
      }

      const codes = JSON.parse(localStorage.getItem('mock_otp_codes') || '[]');
      const otp = '123456'; // Static mock OTP
      codes.push({ email: body.email, code: otp, expires: Date.now() + 10 * 60 * 1000 });
      localStorage.setItem('mock_otp_codes', JSON.stringify(codes));

      console.log(`[Mock System] Sent password recovery OTP "${otp}" to ${body.email}`);
      return Promise.resolve({ message: 'Mock OTP code sent to your email.' });
    }

    if (endpoint === '/auth/otp/verify' && method === 'POST') {
      const codes = JSON.parse(localStorage.getItem('mock_otp_codes') || '[]');
      const record = codes.find(c => c.email === body.email && c.code === body.code);
      if (!record || record.expires < Date.now()) {
        return Promise.reject({ message: 'Invalid or expired validation code.' });
      }
      return Promise.resolve({ message: 'OTP verified. Please proceed to set password.' });
    }

    if (endpoint === '/auth/reset-password' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const user = users.find(u => u.email === body.email);
      if (!user) return Promise.reject({ message: 'User reference missing.' });

      user.passwordHash = body.newPassword;
      localStorage.setItem('mock_users', JSON.stringify(users));
      return Promise.resolve({ message: 'Password recovery successful. You can log in.' });
    }

    // 14. Access Login Session logs
    if (endpoint === '/auth/login-history' && method === 'GET') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      const mockUsername = AppState.token.replace('mock_jwt_token_for_', '');
      const user = users.find(u => u.username === mockUsername);
      if (!user) return Promise.reject({ message: 'Session invalid.' });

      const logs = JSON.parse(localStorage.getItem('mock_login_history') || '[]').filter(l => l.user_id === user.id);
      return Promise.resolve(logs);
    }

    // ================= ADMIN PRIVILEGED LOGS METRICS =================
    if (endpoint === '/admin/feedback' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_feedback') || '[]');
      return Promise.resolve(list);
    }

    if (endpoint === '/admin/reports' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      return Promise.resolve(list);
    }

    if (endpoint === '/admin/notifications' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
      return Promise.resolve(list);
    }

    if (endpoint === '/admin/notifications' && method === 'POST') {
      const list = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
      const newNotif = {
        id: list.length + 1,
        user_id: 0,
        title: body.title,
        message: body.message,
        type: 'broadcast',
        read: 0,
        created_at: new Date().toISOString()
      };
      list.push(newNotif);
      localStorage.setItem('mock_notifications', JSON.stringify(list));
      return Promise.resolve(newNotif);
    }

    if (endpoint === '/admin/rewards' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_purchases') || '[]');
      return Promise.resolve(list);
    }

    if (endpoint === '/admin/certificates' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_certificates') || '[]');
      return Promise.resolve(list);
    }

    if (endpoint === '/admin/login-logs' && method === 'GET') {
      const list = JSON.parse(localStorage.getItem('mock_login_history') || '[]');
      return Promise.resolve(list);
    }

    return Promise.reject({ message: 'Mock endpoint not found.' });
  }
};

// 6. VIEW CONTROL ENGINE (Router)
const ViewController = {
  views: ['landing', 'auth', 'dashboard', 'quiz', 'summary', 'leaderboard', 'admin'],

  switchView(viewName) {
    this.views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (v === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
    AppState.activeView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(`Routed to view: ${viewName}`);
  }
};

// 7. GAMEPLAY CONTROLLER (Active Quiz Arena State Machine)
const QuizArena = {
  // Boot Quiz
  async start(category, difficulty, isDaily = false) {
    AudioSynth.playClick();

    // Detect selected game mode
    let mode = 'classic';
    if (!isDaily) {
      const selectedModeEl = document.querySelector('input[name="gamemode"]:checked');
      if (selectedModeEl) mode = selectedModeEl.value;
    }

    // Reset State
    if (AppState.quiz.autoNextTimeout) {
      clearTimeout(AppState.quiz.autoNextTimeout);
      AppState.quiz.autoNextTimeout = null;
    }
    AppState.quiz.category = category;
    AppState.quiz.difficulty = difficulty;
    AppState.quiz.gameMode = mode;
    AppState.quiz.currentIndex = 0;
    AppState.quiz.score = 0;
    AppState.quiz.answersLog = [];
    AppState.quiz.isDailyChallenge = isDaily;
    AppState.quiz.hintsRemaining = 3;
    AppState.quiz.lifelinesUsed = 0;
    AppState.quiz.streakCount = 0;
    AppState.quiz.lifelines = {
      '5050': false,
      'skip': false,
      'time': false
    };

    // Determine lives and time limits by mode
    if (mode === 'speed') {
      AppState.quiz.lives = 1;
      AppState.quiz.maxLives = 1;
      AppState.quiz.timeLimit = 8;
    } else if (mode === 'survival') {
      AppState.quiz.lives = 3;
      AppState.quiz.maxLives = 5; // survival lets you restore up to 5 lives
      AppState.quiz.timeLimit = 12;
    } else if (mode === 'marathon') {
      AppState.quiz.lives = 5;
      AppState.quiz.maxLives = 5;
      AppState.quiz.timeLimit = 20;
    } else { // classic
      AppState.quiz.lives = 3;
      AppState.quiz.maxLives = 3;
      AppState.quiz.timeLimit = 15;
    }

    // Load Questions
    try {
      let questions = [];
      if (isDaily) {
        const data = await NetworkClient.request('/quiz/daily-challenge');
        questions = data.questions;
      } else {
        // Set query limit based on mode
        let limit = 10;
        if (mode === 'speed') limit = 15;
        if (mode === 'survival') limit = 50; // survival pool size
        if (mode === 'marathon') limit = 30;

        questions = await NetworkClient.request(`/quiz/questions?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}&limit=${limit}`);
      }

      if (!questions || questions.length === 0) {
        alert('No questions found in this category/difficulty combination.');
        return;
      }

      AppState.quiz.questions = questions;

      // Initialize bookmark IDs lists if logged in
      if (AppState.token) {
        try {
          AppState.bookmarkedQuestionIds = await NetworkClient.request('/bookmarks/ids');
        } catch (err) {
          console.warn('Failed to pre-fetch bookmark IDs:', err);
        }
      }

      ViewController.switchView('quiz');

      // Reset lifeline buttons status in UI
      const btn5050 = document.getElementById('btn-lifeline-5050');
      const btnSkip = document.getElementById('btn-lifeline-skip');
      const btnTime = document.getElementById('btn-lifeline-time');

      if (btn5050) { btn5050.disabled = false; btn5050.innerText = '🌓 50:50'; }
      if (btnSkip) { btnSkip.disabled = false; btnSkip.innerText = '⏭️ Skip'; }
      if (btnTime) { btnTime.disabled = false; btnTime.innerText = '⏱️ +15s'; }

      // Bind lifelines click handlers
      this.bindLifelines();

      this.renderQuestion();
    } catch (e) {
      alert('Failed to boot quiz: ' + e.message);
    }
  },

  // Bind active game lifelines events
  bindLifelines() {
    const btn5050 = document.getElementById('btn-lifeline-5050');
    const btnSkip = document.getElementById('btn-lifeline-skip');
    const btnTime = document.getElementById('btn-lifeline-time');

    if (btn5050) {
      btn5050.onclick = () => {
        if (AppState.quiz.lifelines['5050']) return;
        this.useLifeline5050();
      };
    }
    if (btnSkip) {
      btnSkip.onclick = () => {
        if (AppState.quiz.lifelines['skip']) return;
        this.useLifelineSkip();
      };
    }
    if (btnTime) {
      btnTime.onclick = () => {
        if (AppState.quiz.lifelines['time']) return;
        this.useLifelineTime();
      };
    }

    // Bind bookmark toggle button
    const btnBookmark = document.getElementById('btn-quiz-bookmark');
    if (btnBookmark) {
      btnBookmark.onclick = () => {
        this.toggleActiveQuestionBookmark();
      };
    }
  },

  // Lifeline 50:50 Handler
  useLifeline5050() {
    AudioSynth.playClick();
    AppState.quiz.lifelines['5050'] = true;
    AppState.quiz.lifelinesUsed += 1;

    const btn = document.getElementById('btn-lifeline-5050');
    if (btn) {
      btn.disabled = true;
      btn.innerText = '🌓 50:50 (Used)';
    }

    const correctKey = AppState.quiz.currentCorrectKey;
    const buttons = document.querySelectorAll('.option-btn');

    // Collect all wrong options indices
    const wrongButtons = [];
    buttons.forEach(b => {
      if (!b.innerText.startsWith(correctKey)) {
        wrongButtons.push(b);
      }
    });

    // Randomly pick 2 wrong options to hide
    const toHide = [];
    while (toHide.length < 2 && wrongButtons.length > 0) {
      const idx = Math.floor(Math.random() * wrongButtons.length);
      toHide.push(wrongButtons.splice(idx, 1)[0]);
    }

    toHide.forEach(b => {
      b.style.opacity = '0.15';
      b.style.pointerEvents = 'none';
      b.disabled = true;
    });
  },

  // Lifeline Skip Handler
  useLifelineSkip() {
    AudioSynth.playClick();
    clearInterval(AppState.quiz.timerInterval);
    AppState.quiz.lifelines['skip'] = true;
    AppState.quiz.lifelinesUsed += 1;

    const btn = document.getElementById('btn-lifeline-skip');
    if (btn) {
      btn.disabled = true;
      btn.innerText = '⏭️ Skip (Used)';
    }

    const q = AppState.quiz.questions[AppState.quiz.currentIndex];

    // Log attempt as skipped (treated as correct in log for bypass)
    AppState.quiz.answersLog.push({
      question: q.question_text,
      selected: 'Skipped (Lifeline)',
      correct: `${AppState.quiz.currentCorrectKey}: ${this.getOptionValue(q, AppState.quiz.currentCorrectKey)}`,
      isCorrect: true,
      explanation: q.explanation || 'Skipped utilizing Skip lifeline.'
    });

    // Move to next question immediately
    this.next();
  },

  // Lifeline Add Time Handler
  useLifelineTime() {
    AudioSynth.playClick();
    AppState.quiz.lifelines['time'] = true;
    AppState.quiz.lifelinesUsed += 1;

    const btn = document.getElementById('btn-lifeline-time');
    if (btn) {
      btn.disabled = true;
      btn.innerText = '⏱️ +15s (Used)';
    }

    // Add 15s
    AppState.quiz.timeLeft += 15;
    document.getElementById('quiz-timer-text').innerText = `⏳ ${AppState.quiz.timeLeft}s`;
  },

  // Bookmark Toggle
  async toggleActiveQuestionBookmark() {
    if (!AppState.token) {
      alert('Sign in to bookmark questions!');
      return;
    }

    AudioSynth.playClick();
    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    const btn = document.getElementById('btn-quiz-bookmark');

    try {
      const data = await NetworkClient.request(`/bookmarks/${q.id}`, 'POST');
      if (data.bookmarked) {
        btn.classList.add('active');
        if (!AppState.bookmarkedQuestionIds.includes(q.id)) {
          AppState.bookmarkedQuestionIds.push(q.id);
        }
      } else {
        btn.classList.remove('active');
        AppState.bookmarkedQuestionIds = AppState.bookmarkedQuestionIds.filter(id => id !== q.id);
      }

      // Refresh background dashboard bookmarks list if needed
      ViewRefresher.refreshBookmarks();
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  },

  // Display active index question
  renderQuestion() {
    const qRaw = AppState.quiz.questions[AppState.quiz.currentIndex];
    const q = translateQuestion(qRaw, window.currentLang);

    // UI Metadata
    document.getElementById('quiz-badge-category').innerText = AppState.quiz.isDailyChallenge ? 'Daily Challenge' : q.category;
    document.getElementById('quiz-badge-difficulty').innerText = q.difficulty.toUpperCase();
    document.getElementById('quiz-badge-difficulty').className = `badge ${q.difficulty === 'hard' ? 'badge-role' : q.difficulty === 'medium' ? 'badge-secondary' : ''}`;

    // Render Game Mode
    const modeBadge = document.getElementById('quiz-badge-mode');
    if (modeBadge) {
      modeBadge.innerText = AppState.quiz.isDailyChallenge ? 'Daily Challenge' : AppState.quiz.gameMode.toUpperCase();
      modeBadge.className = `badge ${AppState.quiz.gameMode === 'survival' ? 'badge-role' : AppState.quiz.gameMode === 'speed' ? 'badge-secondary' : 'badge-primary'}`;
    }

    // Update Bookmark active class state
    const btnBookmark = document.getElementById('btn-quiz-bookmark');
    if (btnBookmark) {
      if (AppState.bookmarkedQuestionIds.includes(q.id)) {
        btnBookmark.classList.add('active');
      } else {
        btnBookmark.classList.remove('active');
      }
    }

    // Lives Counter
    let heartIcons = '';
    const maxLivesToDisplay = AppState.quiz.maxLives || 3;
    for (let i = 0; i < maxLivesToDisplay; i++) {
      heartIcons += i < AppState.quiz.lives ? '❤️' : '🖤';
    }
    document.getElementById('quiz-lives').innerHTML = heartIcons;

    // Progress Bar
    const progressPercent = ((AppState.quiz.currentIndex) / AppState.quiz.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
    document.getElementById('quiz-progress-text').innerText = `Question ${AppState.quiz.currentIndex + 1} of ${AppState.quiz.questions.length}`;

    // Prompt Text
    document.getElementById('quiz-question-text').innerText = q.question_text;

    // Choice Elements
    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    // Build options with their original database keys
    const opts = [
      { originalKey: 'A', text: q.option_a },
      { originalKey: 'B', text: q.option_b },
      { originalKey: 'C', text: q.option_c },
      { originalKey: 'D', text: q.option_d }
    ];

    // Fisher-Yates shuffle to randomize answer positions
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }

    // Assign new display keys (A, B, C, D) and find shuffled correct key
    const displayKeys = ['A', 'B', 'C', 'D'];
    const correctOriginalKey = q.correct_option.toUpperCase();
    let shuffledCorrectKey = 'A';

    opts.forEach((o, i) => {
      o.displayKey = displayKeys[i];
      if (o.originalKey === correctOriginalKey) {
        shuffledCorrectKey = displayKeys[i];
      }
    });

    // Store shuffled state for answer validation
    AppState.quiz.currentCorrectKey = shuffledCorrectKey;
    AppState.quiz.currentOptions = opts;

    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-index">${o.displayKey}</span> <span class="option-text">${o.text}</span>`;
      btn.onclick = () => this.handleAnswerSelection(btn, o.displayKey);
      optionsContainer.appendChild(btn);
    });

    // Reset controls
    document.getElementById('btn-quiz-hint').classList.remove('hidden');
    document.getElementById('btn-quiz-hint').innerText = `💡 Need a Hint? (${AppState.quiz.hintsRemaining} left)`;
    document.getElementById('btn-quiz-next').classList.add('hidden');
    document.getElementById('hint-text-box').classList.add('hidden');

    const tutorBtn = document.getElementById('btn-quiz-tutor');
    if (tutorBtn) tutorBtn.classList.add('hidden');
    const tutorBox = document.getElementById('tutor-explain-box');
    if (tutorBox) tutorBox.classList.add('hidden');
    AppState.quiz.tutorMessages = null;

    // Launch Countdown Timer
    this.startTimer();
  },

  startTimer() {
    clearInterval(AppState.quiz.timerInterval);
    const practiceChecked = document.getElementById('arena-practice-mode').checked;
    const timerChecked = document.getElementById('practice-optional-timer').checked;

    if (practiceChecked && !timerChecked) {
      document.getElementById('quiz-timer-text').innerText = '⏳ Practice';
      return;
    }

    AppState.quiz.timeLeft = AppState.quiz.timeLimit || 15;
    document.getElementById('quiz-timer-text').innerText = `⏳ ${AppState.quiz.timeLeft}s`;

    AppState.quiz.timerInterval = setInterval(() => {
      AppState.quiz.timeLeft -= 1;
      document.getElementById('quiz-timer-text').innerText = `⏳ ${AppState.quiz.timeLeft}s`;

      if (AppState.quiz.timeLeft <= 0) {
        clearInterval(AppState.quiz.timerInterval);
        this.handleTimeOut();
      }
    }, 1000);
  },

  // Process Selection click
  handleAnswerSelection(selectedBtn, chosenKey) {
    clearInterval(AppState.quiz.timerInterval);

    // Disable all options buttons to lock answer
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    const correctKey = AppState.quiz.currentCorrectKey;
    const isCorrect = chosenKey === correctKey;

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      AudioSynth.playCorrect();
      AppState.quiz.score += 1;

      // Update streak and survival mode recovery
      AppState.quiz.streakCount += 1;
      if (AppState.quiz.gameMode === 'survival' && AppState.quiz.streakCount % 3 === 0) {
        const maxSurvivalLives = AppState.quiz.maxLives || 5;
        if (AppState.quiz.lives < maxSurvivalLives) {
          AppState.quiz.lives += 1;

          // Micro-animation indicator for life restore
          const indicator = document.getElementById('quiz-lives');
          if (indicator) {
            indicator.style.transform = 'scale(1.3)';
            setTimeout(() => { indicator.style.transform = 'scale(1)'; }, 300);
          }
          console.log('💚 Survival recovery triggered! Restored +1 life.');
        }
      }
    } else {
      selectedBtn.classList.add('wrong');
      AudioSynth.playWrong();

      const practiceMode = document.getElementById('arena-practice-mode').checked;
      if (!practiceMode) {
        AppState.quiz.lives -= 1;
      }

      // Reset streak
      AppState.quiz.streakCount = 0;

      // Highlight correct choice
      buttons.forEach(b => {
        if (b.innerText.startsWith(correctKey)) {
          b.classList.add('correct');
        }
      });
    }

    // Log answer for summary review page
    AppState.quiz.answersLog.push({
      question: q.question_text,
      selected: `${chosenKey}: ${this.getOptionValue(q, chosenKey)}`,
      correct: `${correctKey}: ${this.getOptionValue(q, correctKey)}`,
      isCorrect,
      explanation: q.explanation || 'No detail explanation provided.'
    });

    document.getElementById('btn-quiz-hint').classList.add('hidden');
    document.getElementById('btn-quiz-next').classList.remove('hidden');

    // Show Ask AI Tutor button
    const tutorBtn = document.getElementById('btn-quiz-tutor');
    if (tutorBtn) {
      tutorBtn.classList.remove('hidden');
      tutorBtn.onclick = () => {
        AudioSynth.playClick();

        // Save chosen key on state so the tutor can access it later
        AppState.quiz.chosenKey = chosenKey;

        // 1. Initialize conversational state if not set
        if (!AppState.quiz.tutorMessages) {
          AppState.quiz.tutorMessages = [
            { role: 'assistant', content: 'Hello! I am your AI Tutor. I can help you understand this question. What topic or concept would you like a hint or explanation for?' }
          ];
        }

        // Show Box
        document.getElementById('tutor-explain-box').classList.remove('hidden');

        // Helper to render chat bubbles
        const renderChat = () => {
          const container = document.getElementById('tutor-chat-messages');
          if (!container) return;
          container.innerHTML = '';

          AppState.quiz.tutorMessages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = `tutor-message-bubble ${msg.role}`;

            // Format markdown details
            let html = msg.content
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/#### (.*)/g, '<h4>$1</h4>')
              .replace(/^- (.*)/g, '<li>$1</li>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/> (.*)/g, '<blockquote>$1</blockquote>')
              .replace(/\n/g, '<br>');

            html = html.replace(/```javascript<br>([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            html = html.replace(/```<br>([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

            bubble.innerHTML = html;
            container.appendChild(bubble);
          });
          container.scrollTop = container.scrollHeight;
        };

        // Helper to disable chat inputs during AI call
        const setDisabled = (disabled) => {
          const form = document.getElementById('form-tutor-chat');
          if (form) {
            const input = form.querySelector('#tutor-chat-input');
            const sendBtn = form.querySelector('#btn-tutor-chat-send');
            if (input) input.disabled = disabled;
            if (sendBtn) sendBtn.disabled = disabled;
          }
          const chips = document.getElementById('tutor-quick-chips');
          if (chips) {
            chips.querySelectorAll('.chip-btn').forEach(b => b.disabled = disabled);
          }
        };

        // Helper to submit a message
        const sendMessage = async (text) => {
          AppState.quiz.tutorMessages.push({ role: 'user', content: text });
          renderChat();
          setDisabled(true);

          const container = document.getElementById('tutor-chat-messages');
          const typing = document.createElement('div');
          typing.className = 'tutor-message-bubble assistant';
          typing.style.opacity = '0.7';
          typing.innerText = 'Thinking...';
          container.appendChild(typing);
          container.scrollTop = container.scrollHeight;

          try {
            const data = await NetworkClient.request('/tutor/explain', 'POST', {
              questionText: q.question_text,
              category: q.category,
              difficulty: q.difficulty,
              optionA: q.option_a,
              optionB: q.option_b,
              optionC: q.option_c,
              optionD: q.option_d,
              correctOption: correctKey,
              chosenOption: chosenKey,
              explanation: q.explanation,
              messages: AppState.quiz.tutorMessages
            });
            typing.remove();
            AppState.quiz.tutorMessages.push({ role: 'assistant', content: data.explanation });
            renderChat();
          } catch (e) {
            typing.innerText = 'Error: ' + e.message;
          } finally {
            setDisabled(false);
          }
        };

        // Bind form submit
        const form = document.getElementById('form-tutor-chat');
        form.onsubmit = (e) => {
          e.preventDefault();
          const input = document.getElementById('tutor-chat-input');
          const text = input.value.trim();
          if (!text) return;
          input.value = '';
          sendMessage(text);
        };

        // Bind quick chip buttons
        document.getElementById('btn-tutor-chip-hint').onclick = () => {
          sendMessage('Give me a hint');
        };
        document.getElementById('btn-tutor-chip-concept').onclick = () => {
          sendMessage('Explain the concept');
        };
        document.getElementById('btn-tutor-chip-answer').onclick = () => {
          sendMessage('Explain the correct answer option');
        };

        // Initial render
        renderChat();
      };

      // Auto-trigger AI explanation if in practice mode
      if (document.getElementById('arena-practice-mode').checked) {
        setTimeout(() => { tutorBtn.click(); }, 150);
      }
    }

    // Immediately update progress bar to show current question as completed
    const progressPercent = ((AppState.quiz.currentIndex + 1) / AppState.quiz.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

    // Show short explanation inside hint box for study
    const hintEl = document.getElementById('hint-text-box');
    if (hintEl) {
      hintEl.innerHTML = `<strong>Explanation:</strong> ${q.explanation || 'No detailed explanation provided.'}`;
      hintEl.classList.remove('hidden');
    }
  },

  handleTimeOut() {
    AudioSynth.playWrong();

    const practiceMode = document.getElementById('arena-practice-mode').checked;
    if (!practiceMode) {
      AppState.quiz.lives -= 1;
    }
    AppState.quiz.streakCount = 0; // Reset streak

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    const correctKey = AppState.quiz.currentCorrectKey;

    // Highlight correct
    buttons.forEach(b => {
      if (b.innerText.startsWith(correctKey)) {
        b.classList.add('correct');
      }
    });

    AppState.quiz.answersLog.push({
      question: q.question_text,
      selected: 'None (Timed Out)',
      correct: `${correctKey}: ${this.getOptionValue(q, correctKey)}`,
      isCorrect: false,
      explanation: q.explanation || 'Timed out before choice.'
    });

    // Display Time's Up!
    const timerText = document.getElementById('quiz-timer-text');
    if (timerText) {
      timerText.innerText = window.currentLang === 'ta' ? 'நேரம் முடிந்தது!' : window.currentLang === 'hi' ? 'समय समाप्त!' : "Time's Up!";
    }

    // Show short explanation inside hint box for study
    const hintEl = document.getElementById('hint-text-box');
    if (hintEl) {
      hintEl.innerHTML = `<strong>Explanation:</strong> ${q.explanation || 'No detailed explanation provided.'}`;
      hintEl.classList.remove('hidden');
    }

    document.getElementById('btn-quiz-hint').classList.add('hidden');
    document.getElementById('btn-quiz-next').classList.remove('hidden');

    // Immediately update progress bar to show current question as completed (timed out)
    const progressPercent = ((AppState.quiz.currentIndex + 1) / AppState.quiz.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
  },

  getOptionValue(q, key) {
    // Look up from shuffled options (display key → text)
    const opt = AppState.quiz.currentOptions.find(o => o.displayKey === key);
    return opt ? opt.text : '';
  },

  // Display Hint
  revealHint() {
    if (AppState.quiz.hintsRemaining <= 0) {
      alert('No hints remaining!');
      return;
    }

    AudioSynth.playClick();
    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    const hintEl = document.getElementById('hint-text-box');
    hintEl.innerText = `Hint: ${q.hint || 'No specific hint available. Try eliminating 2 options.'}`;
    hintEl.classList.remove('hidden');

    AppState.quiz.hintsRemaining -= 1;
    document.getElementById('btn-quiz-hint').innerText = `💡 Need a Hint? (${AppState.quiz.hintsRemaining} left)`;
  },

  // Go to next question or show summary
  next() {
    if (AppState.quiz.autoNextTimeout) {
      clearTimeout(AppState.quiz.autoNextTimeout);
      AppState.quiz.autoNextTimeout = null;
    }
    AudioSynth.playClick();
    AppState.quiz.currentIndex += 1;

    // Check game conditions: Out of lives or Out of questions
    if (AppState.quiz.lives <= 0) {
      this.finish(true); // Game over
    } else if (AppState.quiz.currentIndex >= AppState.quiz.questions.length) {
      this.finish(false); // Victory
    } else {
      this.renderQuestion();
    }
  },

  // Finalize quiz attempts
  async finish(isGameOver) {
    if (AppState.quiz.autoNextTimeout) {
      clearTimeout(AppState.quiz.autoNextTimeout);
      AppState.quiz.autoNextTimeout = null;
    }
    clearInterval(AppState.quiz.timerInterval);

    const totalQuestions = AppState.quiz.questions.length;
    const score = AppState.quiz.score;

    if (!isGameOver) {
      // Victory celebration modal
      AudioSynth.playVictory();

      document.getElementById('cel-score').innerText = `${score} / ${totalQuestions}`;

      let mult = 10;
      if (AppState.quiz.difficulty.toLowerCase() === 'easy') mult = 5;
      if (AppState.quiz.difficulty.toLowerCase() === 'hard') mult = 15;
      let earnedXp = score * mult + 10;
      if (score === totalQuestions) earnedXp += 50;

      const mode = (AppState.quiz.gameMode || 'classic').toLowerCase();
      if (mode === 'speed') earnedXp = Math.round(earnedXp * 1.3);
      if (mode === 'survival') earnedXp = Math.round(earnedXp * 1.5);
      if (mode === 'marathon') earnedXp = Math.round(earnedXp * 1.2);

      document.getElementById('cel-xp').innerText = `+${earnedXp} XP`;
      document.getElementById('cel-coins').innerText = `+${earnedXp} Coins`;

      const celBadgesList = document.getElementById('cel-badges-list');
      if (celBadgesList) celBadgesList.innerHTML = '';
      document.getElementById('cel-badges-count').innerText = '0';

      const pct = (score / totalQuestions) * 100;
      const claimBtn = document.getElementById('btn-cel-claim');
      if (pct >= 80) {
        claimBtn.classList.remove('hidden');
      } else {
        claimBtn.classList.add('hidden');
      }

      document.getElementById('modal-quiz-celebration').classList.remove('hidden');

      // Blast confetti
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) { }

      // Background submission
      this.submitScoreBackground(score, totalQuestions);
    } else {
      // Regular summary page for game over
      ViewController.switchView('summary');
      document.getElementById('summary-headline').innerText = '💔 Game Over!';
      document.getElementById('summary-meta-desc').innerText = 'You ran out of lives. Better luck next time!';
      AudioSynth.playGameOver();
      document.getElementById('summary-score').innerText = `${score} / ${totalQuestions}`;
      document.getElementById('summary-xp-earned').classList.add('hidden');
      document.getElementById('summary-unlocked-badge-alert').classList.add('hidden');
      document.getElementById('btn-summary-certificate').classList.add('hidden');

      this.submitScoreBackground(score, totalQuestions);
    }
  },

  async submitScoreBackground(score, totalQuestions) {
    if (AppState.token) {
      try {
        const payload = {
          category: AppState.quiz.category,
          difficulty: AppState.quiz.difficulty,
          score,
          totalQuestions,
          game_mode: AppState.quiz.gameMode,
          lifelines_used: AppState.quiz.lifelinesUsed
        };
        const data = await NetworkClient.request('/quiz/submit', 'POST', payload);

        if (data.newCoins !== undefined) {
          ViewRefresher.updateCoinsDisplay(data.newCoins);
        }

        // Show XP Earned in summary if game over
        document.getElementById('summary-xp-earned').innerText = `+${data.xpEarned} XP Earned`;
        document.getElementById('summary-xp-earned').classList.remove('hidden');

        // Check Claim Certificate button on summary page
        const pct = (score / totalQuestions) * 100;
        if (pct >= 80) {
          document.getElementById('btn-summary-certificate').classList.remove('hidden');
        } else {
          document.getElementById('btn-summary-certificate').classList.add('hidden');
        }

        // Show Unlocked Badges in Celebration popup
        const countEl = document.getElementById('cel-badges-count');
        const listEl = document.getElementById('cel-badges-list');

        if (data.unlockedBadges && data.unlockedBadges.length > 0) {
          if (countEl) countEl.innerText = data.unlockedBadges.length;
          if (listEl) {
            listEl.innerHTML = '';
            data.unlockedBadges.forEach(bId => {
              const bBadge = document.createElement('span');
              bBadge.className = 'badge';
              bBadge.innerText = bId.replace('_', ' ').toUpperCase();
              listEl.appendChild(bBadge);
            });
          }
        }
      } catch (err) {
        console.error('Failed to submit score in background:', err);
      }
    } else {
      // Guest Mode LocalStorage Submission Logic
      try {
        let guestProgress = JSON.parse(localStorage.getItem('guest_progress')) || {
          total_xp: 0,
          quizzes_completed: 0,
          perfect_quizzes: 0,
          daily_streak: 0,
          last_active: null
        };
        let guestAchievements = JSON.parse(localStorage.getItem('guest_achievements')) || [];
        let guestHistory = JSON.parse(localStorage.getItem('guest_history')) || [];

        // Add history log
        const attemptedAt = new Date().toISOString();
        guestHistory.push({
          category: AppState.quiz.category,
          difficulty: AppState.quiz.difficulty,
          score,
          total_questions: totalQuestions,
          game_mode: AppState.quiz.gameMode,
          attempted_at: attemptedAt
        });
        if (guestHistory.length > 10) guestHistory.shift();
        localStorage.setItem('guest_history', JSON.stringify(guestHistory));

        // Calculate XP
        let xpMultiplier = 10;
        if (AppState.quiz.difficulty.toLowerCase() === 'easy') xpMultiplier = 5;
        if (AppState.quiz.difficulty.toLowerCase() === 'hard') xpMultiplier = 15;

        let xpEarned = score * xpMultiplier;
        let isPerfect = score === totalQuestions;

        if (isPerfect) xpEarned += 50;

        const mode = (AppState.quiz.gameMode || 'classic').toLowerCase();
        if (mode === 'speed') xpEarned = Math.round(xpEarned * 1.3);
        if (mode === 'survival') xpEarned = Math.round(xpEarned * 1.5);
        if (mode === 'marathon') xpEarned = Math.round(xpEarned * 1.2);

        xpEarned += 10; // Completion bonus

        // Update Daily Streak
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = guestProgress.daily_streak;

        if (guestProgress.last_active) {
          const lastActiveDate = new Date(guestProgress.last_active);
          const todayDate = new Date(todayStr);
          const diffTime = Math.abs(todayDate - lastActiveDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        if (newStreak >= 14) xpEarned = Math.round(xpEarned * 1.5);
        else if (newStreak >= 7) xpEarned = Math.round(xpEarned * 1.3);
        else if (newStreak >= 3) xpEarned = Math.round(xpEarned * 1.15);

        guestProgress.total_xp += xpEarned;
        guestProgress.total_coins = (guestProgress.total_coins || 0) + xpEarned;
        guestProgress.quizzes_completed += 1;
        if (isPerfect) guestProgress.perfect_quizzes += 1;
        guestProgress.daily_streak = newStreak;
        guestProgress.last_active = todayStr;
        localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
        ViewRefresher.updateCoinsDisplay(guestProgress.total_coins);

        // Evaluate achievements
        const unlockedBadges = [];
        const giveBadge = (badgeId) => {
          if (!guestAchievements.includes(badgeId)) {
            guestAchievements.push(badgeId);
            unlockedBadges.push(badgeId);
          }
        };

        if (guestProgress.quizzes_completed >= 1) giveBadge('first_step');
        if (guestProgress.perfect_quizzes >= 1) giveBadge('perfectionist');
        if (guestProgress.quizzes_completed >= 10) giveBadge('quiz_master');
        if (isPerfect && AppState.quiz.difficulty.toLowerCase() === 'hard') giveBadge('legendary_brain');
        if (guestProgress.daily_streak >= 3) giveBadge('dedicated_scholar');
        if (isPerfect && AppState.quiz.category === 'AI') giveBadge('ai_guru');

        // New requested badges
        if (guestProgress.daily_streak >= 5) giveBadge('quiz_streak_5');
        if (guestProgress.perfect_quizzes >= 10) giveBadge('perfect_10');
        if (guestProgress.quizzes_completed >= 25) giveBadge('completed_25');
        if (guestProgress.total_xp >= 1000) giveBadge('xp_1000');

        if (mode === 'speed') giveBadge('speed_demon');
        if (mode === 'survival' && score >= 20) giveBadge('survivor');
        if (mode === 'marathon') giveBadge('marathon_runner');
        if (guestProgress.quizzes_completed >= 50) giveBadge('half_century');
        if (guestProgress.quizzes_completed >= 100) giveBadge('century_club');
        if (guestProgress.daily_streak >= 7) giveBadge('streak_king');
        if (guestProgress.daily_streak >= 14) giveBadge('unstoppable');
        if (guestProgress.perfect_quizzes >= 5) giveBadge('perfectionist_elite');
        if (isPerfect && AppState.quiz.difficulty.toLowerCase() === 'hard' && (!AppState.quiz.lifelinesUsed || AppState.quiz.lifelinesUsed === 0)) {
          giveBadge('no_lifeline');
        }

        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 5) giveBadge('night_owl');
        if (currentHour >= 5 && currentHour < 7) giveBadge('early_bird');

        const distinctCats = [...new Set(guestHistory.map(h => h.category))];
        if (distinctCats.length >= 10) giveBadge('jack_of_all_trades');

        const perfectCats = [...new Set(guestHistory.filter(h => h.score === h.total_questions).map(h => h.category))];
        if (perfectCats.length >= 5) giveBadge('category_master');

        localStorage.setItem('guest_achievements', JSON.stringify(guestAchievements));

        document.getElementById('summary-xp-earned').innerText = `+${xpEarned} XP Earned (Guest Mode)`;
        document.getElementById('summary-xp-earned').classList.remove('hidden');

        if (unlockedBadges.length > 0) {
          const container = document.getElementById('summary-badge-badges');
          container.innerHTML = '';
          unlockedBadges.forEach(bId => {
            const bBadge = document.createElement('div');
            bBadge.className = 'badge';
            bBadge.innerText = bId.replace('_', ' ').toUpperCase();
            container.appendChild(bBadge);
          });
          document.getElementById('summary-unlocked-badge-alert').classList.remove('hidden');
        } else {
          document.getElementById('summary-unlocked-badge-alert').classList.add('hidden');
        }
      } catch (err) {
        console.error('Failed to submit guest score:', err);
      }
    }

    // Load review panel
    const reviewContainer = document.getElementById('review-list-container');
    reviewContainer.innerHTML = '';
    document.getElementById('summary-review-panel').classList.add('hidden');

    AppState.quiz.answersLog.forEach((log, index) => {
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <div class="review-q-text">${index + 1}. ${log.question}</div>
        <div class="review-ans-row">Your Choice: <span class="review-ans-val ${log.isCorrect ? 'correct' : 'wrong'}">${log.selected}</span></div>
        <div class="review-ans-row">Correct Answer: <span class="review-ans-val correct">${log.correct}</span></div>
        <div class="review-explanation"><strong>Explanation:</strong> ${log.explanation}</div>
      `;
      reviewContainer.appendChild(item);
    });

    // Handle Certificate Button visibility
    const btnCert = document.getElementById('btn-summary-certificate');
    if (btnCert) {
      if (score >= totalQuestions * 0.8 && !isGameOver) {
        btnCert.classList.remove('hidden');
        btnCert.onclick = () => {
          this.downloadCertificate();
        };
      } else {
        btnCert.classList.add('hidden');
      }
    }
  },

  downloadCertificate() {
    AudioSynth.playClick();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [600, 400]
    });

    const username = AppState.user ? AppState.user.username : 'AI Quiz Champion';
    const category = AppState.quiz.category;
    const difficulty = AppState.quiz.difficulty.toUpperCase();
    const score = AppState.quiz.score;
    const total = AppState.quiz.questions.length;
    const date = new Date().toLocaleDateString();

    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 600, 400, 'F');

    doc.setDrawColor(99, 102, 241); // indigo 500
    doc.setLineWidth(10);
    doc.rect(15, 15, 570, 370);

    doc.setDrawColor(168, 85, 247); // purple 500
    doc.setLineWidth(2);
    doc.rect(25, 25, 550, 350);

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 300, 80, { align: 'center' });

    doc.setTextColor(156, 163, 175); // gray 400
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('This certificate is proudly presented to', 300, 130, { align: 'center' });

    doc.setTextColor(168, 85, 247); // purple 500
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(username.toUpperCase(), 300, 175, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`for successfully completing the AI Quiz Challenge in`, 300, 220, { align: 'center' });

    doc.setTextColor(99, 102, 241); // indigo 500
    doc.setFont('Helvetica', 'bold');
    doc.text(`${category} (${difficulty} DIFFICULTY)`, 300, 245, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`with a remarkable score of ${score} / ${total}`, 300, 280, { align: 'center' });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(200, 320, 400, 320);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(11);
    doc.text(`DATE: ${date}  |  AI QUIZ ARENA SYSTEM`, 300, 340, { align: 'center' });

    doc.save(`AI_Quiz_Certificate_${category.replace(/\s+/g, '_')}.pdf`);
  },

  async startBookmarksQuiz() {
    AudioSynth.playClick();
    if (!AppState.token) return;
    try {
      const questions = await NetworkClient.request('/bookmarks');
      if (questions.length === 0) {
        alert('You have no bookmarked questions to practice!');
        return;
      }

      AppState.quiz.category = 'Bookmarks Practice';
      AppState.quiz.difficulty = 'medium';
      AppState.quiz.gameMode = 'practice';
      AppState.quiz.currentIndex = 0;
      AppState.quiz.score = 0;
      AppState.quiz.lives = 999;
      AppState.quiz.maxLives = 3;
      AppState.quiz.timeLimit = 999;
      AppState.quiz.hintsRemaining = 999;
      AppState.quiz.lifelinesUsed = 0;
      AppState.quiz.lifelines = { '5050': false, 'skip': false, 'time': false };
      AppState.quiz.answersLog = [];
      AppState.quiz.isDailyChallenge = false;
      AppState.quiz.questions = questions;

      ViewController.switchView('quiz');
      this.renderQuestion();
    } catch (e) {
      alert('Failed to launch bookmarks quiz: ' + e.message);
    }
  }
};

// 8. DATA LOADER & VIEW REFRESH FUNCTIONS
const ViewRefresher = {
  updateCoinsDisplay(amount) {
    const coins = amount || 0;
    const valEl = document.getElementById('header-coins-val');
    if (valEl) {
      const oldCoins = parseInt(valEl.innerText) || 0;
      valEl.innerText = coins;
      if (oldCoins !== coins) {
        const ball = document.getElementById('header-coins-ball');
        if (ball) {
          ball.classList.remove('animate-bounce');
          void ball.offsetWidth; // force reflow
          ball.classList.add('animate-bounce');
        }
      }
    }
    const dashCoins = document.getElementById('dash-coins');
    if (dashCoins) dashCoins.innerText = coins;

    const shopCoins = document.getElementById('shop-coins-balance');
    if (shopCoins) shopCoins.innerText = coins;
  },

  // Refresh main player dashboard
  async refreshDashboard() {
    if (!AppState.token) {
      // Load Guest Dashboard State from LocalStorage
      let guestProgress = JSON.parse(localStorage.getItem('guest_progress')) || {
        total_xp: 0,
        quizzes_completed: 0,
        perfect_quizzes: 0,
        daily_streak: 0,
        last_active: null
      };
      guestProgress.total_coins = guestProgress.total_coins !== undefined ? guestProgress.total_coins : 100;
      let guestAchievements = JSON.parse(localStorage.getItem('guest_achievements')) || [];
      let guestHistory = JSON.parse(localStorage.getItem('guest_history')) || [];

      document.getElementById('dash-username').innerText = 'Guest Player';
      document.getElementById('dash-user-role').innerText = 'Guest';
      document.getElementById('dash-user-role').className = 'badge badge-secondary';
      document.getElementById('dash-xp').innerText = `${guestProgress.total_xp} XP`;
      this.updateCoinsDisplay(guestProgress.total_coins);
      document.getElementById('dash-completed').innerText = guestProgress.quizzes_completed;
      document.getElementById('dash-perfect').innerText = guestProgress.perfect_quizzes;
      document.getElementById('dash-streak').innerText = `🔥 ${guestProgress.daily_streak}`;

      document.getElementById('btn-nav-login').classList.remove('hidden');
      document.getElementById('user-profile-summary').classList.add('hidden');
      document.getElementById('btn-dash-admin').classList.add('hidden');

      // Level calculations for Guest
      const level = Math.floor(Math.sqrt(guestProgress.total_xp / 100)) + 1;
      const currentLevelXp = Math.round(100 * Math.pow(level - 1, 2));
      const nextLevelXp = Math.round(100 * Math.pow(level, 2));
      const levelXpProgress = guestProgress.total_xp - currentLevelXp;
      const levelXpRequired = nextLevelXp - currentLevelXp;
      const progressPercent = Math.min(100, Math.round((levelXpProgress / levelXpRequired) * 100));

      const lvlEl = document.getElementById('dash-level');
      if (lvlEl) lvlEl.innerText = level;
      const lvlXpEl = document.getElementById('dash-level-xp-text');
      if (lvlXpEl) lvlXpEl.innerText = `${levelXpProgress} / ${levelXpRequired} XP`;
      const lvlBarEl = document.getElementById('dash-level-progress-fill');
      if (lvlBarEl) lvlBarEl.style.width = `${progressPercent}%`;

      // Update Guest badges
      const badges = document.querySelectorAll('.badge-item');
      badges.forEach(bEl => {
        const id = bEl.getAttribute('data-badge');
        if (guestAchievements.includes(id)) {
          bEl.classList.remove('locked');
          bEl.classList.add('unlocked');
        } else {
          bEl.classList.add('locked');
          bEl.classList.remove('unlocked');
        }
      });

      // Populate history logs for Guest
      const tbody = document.getElementById('history-table-body');
      tbody.innerHTML = '';
      if (guestHistory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No guest activity yet. Play a quiz!</td></tr>`;
      } else {
        guestHistory.forEach(h => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${h.category}</td>
            <td>${h.difficulty.toUpperCase()}</td>
            <td><strong>${h.score} / ${h.total_questions}</strong></td>
            <td>${h.attempted_at.split('T')[0]}</td>
          `;
          tbody.appendChild(row);
        });
      }

      // Guest Accuracy calculation
      const totalAnswers = guestHistory.reduce((acc, h) => acc + h.total_questions, 0);
      const correctAnswers = guestHistory.reduce((acc, h) => acc + h.score, 0);
      const ratio = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      document.getElementById('analytics-accuracy').innerText = `${ratio}%`;
      document.getElementById('analytics-skill-tier').innerText = level > 15 ? 'Elite Master' : level > 8 ? 'Senior Scholar' : 'Novice Learner';

      // Clear Bookmarks count and container
      document.getElementById('bookmark-count').innerText = '0';
      document.getElementById('bookmarks-container').innerHTML = `
        <div class="text-center text-muted" style="padding: 20px 0;">Guest mode: sign in to save bookmarks.</div>
      `;
      return;
    }

    try {
      // Fetch user profile stats
      const profile = await NetworkClient.request('/auth/me');

      // Update UI texts
      document.getElementById('dash-username').innerText = profile.user.username;
      document.getElementById('dash-user-role').innerText = profile.user.role.toUpperCase();
      document.getElementById('dash-user-role').className = `badge ${profile.user.role === 'admin' ? 'badge-role' : ''}`;

      document.getElementById('dash-xp').innerText = `${profile.progress.total_xp} XP`;
      this.updateCoinsDisplay(profile.progress.total_coins || 0);
      document.getElementById('dash-streak').innerText = `🔥 ${profile.progress.daily_streak}`;
      document.getElementById('dash-completed').innerText = profile.progress.quizzes_completed;

      // Update bio, favorite category, avatar, and frames
      const bioEl = document.getElementById('dash-bio');
      if (bioEl) bioEl.innerText = profile.user.bio || 'No bio added yet.';

      const favEl = document.getElementById('dash-fav-cat');
      if (favEl) {
        if (profile.user.fav_category) {
          favEl.innerText = profile.user.fav_category;
          favEl.classList.remove('hidden');
        } else {
          favEl.classList.add('hidden');
        }
      }

      const avatarEmojiEl = document.getElementById('dash-avatar-emoji');
      if (avatarEmojiEl) avatarEmojiEl.innerText = profile.progress.avatar || '👤';

      const avatarFrameEl = document.getElementById('dash-avatar-frame');
      if (avatarFrameEl) {
        avatarFrameEl.className = 'avatar-frame-overlay';
        if (profile.progress.avatar_frame) {
          avatarFrameEl.classList.add(`avatar-frame-${profile.progress.avatar_frame}`);
        }
      }

      // Apply selected theme
      if (profile.progress.selected_theme) {
        document.body.className = '';
        if (profile.progress.selected_theme !== 'dark') {
          document.body.classList.add(profile.progress.selected_theme);
        }
      }

      // Navigation user widget
      document.getElementById('btn-nav-login').classList.add('hidden');
      document.getElementById('user-profile-summary').classList.remove('hidden');
      document.getElementById('user-display-name').innerText = profile.user.username;

      // Toggle Admin quick actions
      if (profile.user.role === 'admin') {
        document.getElementById('btn-dash-admin').classList.remove('hidden');
      } else {
        document.getElementById('btn-dash-admin').classList.add('hidden');
      }

      // Check achievements
      const badgeIds = profile.achievements.map(a => a.badge_id);
      const badges = document.querySelectorAll('.badge-item');
      badges.forEach(bEl => {
        const id = bEl.getAttribute('data-badge');
        if (badgeIds.includes(id)) {
          bEl.classList.remove('locked');
          bEl.classList.add('unlocked');
        } else {
          bEl.classList.add('locked');
          bEl.classList.remove('unlocked');
        }
      });

      // Populate history logs
      const tbody = document.getElementById('history-table-body');
      tbody.innerHTML = '';

      if (!profile.history || profile.history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No recent activity.</td></tr>`;
      } else {
        profile.history.forEach(h => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${h.category}</td>
            <td>${h.difficulty.toUpperCase()}</td>
            <td><strong>${h.score} / ${h.total_questions}</strong></td>
            <td>${h.attempted_at.split('T')[0]}</td>
          `;
          tbody.appendChild(row);
        });
      }

      // Performance analytics calculations
      const totalAnswers = profile.history.reduce((acc, h) => acc + h.total_questions, 0);
      const correctAnswers = profile.history.reduce((acc, h) => acc + h.score, 0);
      const ratio = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      document.getElementById('analytics-accuracy').innerText = `${ratio}%`;

      document.getElementById('analytics-skill-tier').innerText = tier;

      // Level calculations
      const level = Math.floor(Math.sqrt(xp / 100)) + 1;
      const currentLevelXp = Math.round(100 * Math.pow(level - 1, 2));
      const nextLevelXp = Math.round(100 * Math.pow(level, 2));
      const levelXpProgress = xp - currentLevelXp;
      const levelXpRequired = nextLevelXp - currentLevelXp;
      const progressPercent = Math.min(100, Math.round((levelXpProgress / levelXpRequired) * 100));

      const lvlEl = document.getElementById('dash-level');
      if (lvlEl) lvlEl.innerText = level;
      const lvlXpEl = document.getElementById('dash-level-xp-text');
      if (lvlXpEl) lvlXpEl.innerText = `${levelXpProgress} / ${levelXpRequired} XP`;
      const lvlBarEl = document.getElementById('dash-level-progress-fill');
      if (lvlBarEl) lvlBarEl.style.width = `${progressPercent}%`;

      // Refresh Bookmarks list
      this.refreshBookmarks();

    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  },

  // Refresh bookmarks saved list
  async refreshBookmarks() {
    if (!AppState.token) return;

    try {
      const bookmarks = await NetworkClient.request('/bookmarks');
      document.getElementById('bookmark-count').innerText = bookmarks.length;

      const container = document.getElementById('bookmarks-container');
      container.innerHTML = '';

      if (bookmarks.length === 0) {
        container.innerHTML = `
          <div class="text-center text-muted" style="padding: 20px 0;">No bookmarked questions yet. Click the bookmark icon during gameplay or review to save questions!</div>
        `;
        return;
      }

      bookmarks.forEach(b => {
        const item = document.createElement('div');
        item.className = 'bookmark-item-card';
        item.innerHTML = `
          <div class="bookmark-details">
            <div class="bookmark-meta-row">
              <span class="badge">${b.category}</span>
              <span class="badge badge-secondary">${b.difficulty.toUpperCase()}</span>
            </div>
            <div class="bookmark-question-text">${b.question_text}</div>
          </div>
          <div class="bookmark-actions">
            <button class="action-btn btn-gradient btn-sm bookmark-study-btn" style="border-radius: var(--radius-sm);">📖 Study</button>
            <button class="action-btn btn-secondary btn-sm bookmark-delete-btn" style="border-radius: var(--radius-sm);">🗑️</button>
          </div>
        `;

        // Bind Study overlay triggers
        item.querySelector('.bookmark-study-btn').onclick = () => {
          this.openStudyModal(b);
        };

        // Bind quick delete
        item.querySelector('.bookmark-delete-btn').onclick = async () => {
          if (!confirm('Are you sure you want to delete this bookmark?')) return;
          AudioSynth.playClick();
          try {
            await NetworkClient.request(`/bookmarks/${b.id}`, 'POST');
            this.refreshBookmarks();
          } catch (err) {
            console.error('Failed to remove bookmark:', err);
          }
        };

        container.appendChild(item);
      });
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  },

  // Open interactive study modal for bookmark questions
  openStudyModal(b) {
    AudioSynth.playClick();

    const overlay = document.createElement('div');
    overlay.className = 'study-modal-overlay';
    overlay.innerHTML = `
      <div class="study-modal-card">
        <div class="bookmark-meta-row" style="margin-bottom: 15px;">
          <span class="badge">${b.category}</span>
          <span class="badge badge-secondary">${b.difficulty.toUpperCase()}</span>
        </div>
        <h3 style="margin-bottom: 20px; font-size: 18px; line-height: 1.4; font-family: var(--font-heading); font-weight: 700;">${b.question_text}</h3>
        <div class="study-options-list">
          <div class="study-option-item ${b.correct_option === 'A' ? 'correct' : ''}"><strong>A:</strong> ${b.option_a}</div>
          <div class="study-option-item ${b.correct_option === 'B' ? 'correct' : ''}"><strong>B:</strong> ${b.option_b}</div>
          <div class="study-option-item ${b.correct_option === 'C' ? 'correct' : ''}"><strong>C:</strong> ${b.option_c}</div>
          <div class="study-option-item ${b.correct_option === 'D' ? 'correct' : ''}"><strong>D:</strong> ${b.option_d}</div>
        </div>
        <div class="study-modal-explanation">
          <strong>Explanation:</strong><br>${b.explanation || 'No detail explanation provided.'}
        </div>
        <button class="action-btn btn-gradient btn-lg btn-block" style="margin-top: 25px;" id="btn-close-study-modal">Done Studying</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-close-study-modal').onclick = () => {
      AudioSynth.playClick();
      overlay.remove();
    };
  },

  // Refresh leaderboard view
  async refreshLeaderboard(period = 'all') {
    try {
      const data = await NetworkClient.request(`/leaderboard?period=${period}`);
      const tbody = document.getElementById('leaderboard-table-body');
      tbody.innerHTML = '';

      // Update Header Text for score type
      const scoreHeader = document.getElementById('leaderboard-header-score');
      if (scoreHeader) {
        scoreHeader.innerText = period === 'all' ? 'Total XP' : 'Period XP';
      }

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="7" class="text-center">No scores recorded for this period yet!</td></tr>
        `;
        return;
      }

      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        // Styles for top 3
        let rankText = index + 1;
        if (index === 0) rankText = '🥇';
        if (index === 1) rankText = '🥈';
        if (index === 2) rankText = '🥉';

        const isSelf = AppState.user && AppState.user.id === row.user_id;
        const isAdmin = AppState.user && AppState.user.role === 'admin';

        let actionHtml = '<td>-</td>';
        if (isSelf || isAdmin) {
          actionHtml = `
            <td>
              <button onclick="window.deleteLeaderboardScore(${row.user_id})" class="btn-lb-delete" title="Reset Score">🗑️ Reset</button>
            </td>
          `;
        }

        tr.innerHTML = `
          <td><strong>${rankText}</strong></td>
          <td>👤 ${row.username}</td>
          <td><strong>${row.total_xp} XP</strong></td>
          <td>${row.quizzes_completed}</td>
          <td>${row.perfect_quizzes}</td>
          <td>🔥 ${row.daily_streak}</td>
          ${actionHtml}
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('Leaderboard load failed:', e);
    }
  },

  // Refresh admin tables
  async refreshAdminUsers() {
    try {
      const users = await NetworkClient.request('/admin/users');
      const tbody = document.getElementById('admin-users-table-body');
      tbody.innerHTML = '';

      users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-role' : 'badge-secondary'}">${u.role.toUpperCase()}</span></td>
          <td>${u.total_xp || 0}</td>
          <td>${u.quizzes_completed || 0}</td>
          <td>
            <button onclick="ViewRefresher.deleteAdminUser(${u.id})" class="action-btn btn-secondary btn-sm" style="color: var(--accent-red); border-color: rgba(239,68,68,0.3);">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('Admin users load failed:', e);
    }
  },

  async deleteAdminUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await NetworkClient.request(`/admin/users/${id}`, 'DELETE');
      AudioSynth.playClick();
      this.refreshAdminUsers();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }
};

// 9. EVENT BINDING & CORE EVENT LISTENER LOOPS
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏁 Application Booted.');

  // A. Check connection state
  await NetworkClient.checkConnection();

  // B. Initialize Views routing
  if (AppState.token) {
    ViewController.switchView('dashboard');
    ViewRefresher.refreshDashboard();
  } else {
    ViewController.switchView('landing');
  }

  // C. Toggle Light / Dark Mode theme
  const themeBtn = document.getElementById('btn-theme-toggle');
  themeBtn.addEventListener('click', () => {
    AudioSynth.playClick();
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeBtn.innerHTML = isLight ? '☀️' : '🌙';
  });

  // D. General Router Controls
  document.getElementById('btn-brand').addEventListener('click', () => {
    AudioSynth.playClick();
    if (AppState.token) {
      ViewController.switchView('dashboard');
      ViewRefresher.refreshDashboard();
    } else {
      ViewController.switchView('landing');
    }
  });

  document.getElementById('btn-start-arena').addEventListener('click', () => {
    AudioSynth.playClick();
    if (AppState.token) {
      ViewController.switchView('dashboard');
    } else {
      ViewController.switchView('auth');
    }
  });

  // Leaderboard periods tabs event selectors
  const lbPeriods = ['all', 'weekly', 'monthly'];
  lbPeriods.forEach(p => {
    const el = document.getElementById(`btn-lb-period-${p}`);
    if (el) {
      el.addEventListener('click', () => {
        AudioSynth.playClick();
        lbPeriods.forEach(pName => {
          document.getElementById(`btn-lb-period-${pName}`).classList.remove('active');
        });
        el.classList.add('active');
        ViewRefresher.refreshLeaderboard(p);
      });
    }
  });

  document.getElementById('btn-view-leaderboard-landing').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('leaderboard');
    lbPeriods.forEach(pName => {
      document.getElementById(`btn-lb-period-${pName}`).classList.remove('active');
    });
    document.getElementById('btn-lb-period-all').classList.add('active');
    ViewRefresher.refreshLeaderboard('all');
  });

  document.getElementById('btn-nav-login').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('auth');
  });

  document.getElementById('btn-dash-leaderboard').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('leaderboard');
    lbPeriods.forEach(pName => {
      document.getElementById(`btn-lb-period-${pName}`).classList.remove('active');
    });
    document.getElementById('btn-lb-period-all').classList.add('active');
    ViewRefresher.refreshLeaderboard('all');
  });

  document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
    AudioSynth.playClick();
    if (AppState.token) {
      ViewController.switchView('dashboard');
      ViewRefresher.refreshDashboard();
    } else {
      ViewController.switchView('landing');
    }
  });

  // E. Session Logouts
  document.getElementById('btn-nav-logout').addEventListener('click', () => {
    AudioSynth.playClick();
    const msg = window.currentLang === 'ta' ? 'நீங்கள் வெளியேற விரும்புகிறீர்களா?' : window.currentLang === 'hi' ? 'क्या आप लॉग आउट करना चाहते हैं?' : 'Are you sure you want to log out?';
    if (!confirm(msg)) return;

    localStorage.removeItem('quiz_token');
    AppState.token = null;
    AppState.user = null;

    // Clear any potential Google Auth state
    if (window.gapi && window.gapi.auth2) {
      try {
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2) {
          auth2.signOut().then(() => {
            console.log('Google user signed out.');
          });
        }
      } catch (err) {
        console.warn('Google API signOut failed:', err);
      }
    }

    // Direct redirect to login/auth page
    ViewController.switchView('auth');
    ViewRefresher.refreshDashboard();
  });

  // F. Auth Forms submissions
  const loginForm = document.getElementById('form-login');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();

    const username = document.getElementById('login-username').value;
    const passwordHash = document.getElementById('login-password').value;

    try {
      const data = await NetworkClient.request('/auth/login', 'POST', { username, password: passwordHash });
      localStorage.setItem('quiz_token', data.token);
      AppState.token = data.token;

      // Migrate guest attempts if present
      const guestHistory = JSON.parse(localStorage.getItem('guest_history') || '[]');
      if (guestHistory.length > 0) {
        try {
          await NetworkClient.request('/quiz/sync', 'POST', { attempts: guestHistory });
          localStorage.removeItem('guest_history');
          localStorage.removeItem('guest_progress');
          localStorage.removeItem('guest_achievements');
        } catch (e) {
          console.error('Failed to migrate guest history:', e);
        }
      }

      ViewController.switchView('dashboard');
      ViewRefresher.refreshDashboard();
      loginForm.reset();
    } catch (err) {
      alert('Login Failed: ' + (err.message || 'Check username and password.'));
    }
  });

  const registerForm = document.getElementById('form-register');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      await NetworkClient.request('/auth/register', 'POST', { username, email, password });
      alert('Registration successful! Please log in.');

      // Toggle to login tab
      document.getElementById('tab-login').click();
      registerForm.reset();
    } catch (err) {
      alert('Sign Up Failed: ' + (err.message || 'User already exists.'));
    }
  });

  // Toggle Auth tab forms
  document.getElementById('tab-login').addEventListener('click', () => {
    AudioSynth.playClick();
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('form-login').classList.remove('hidden');
    document.getElementById('form-register').classList.add('hidden');
  });

  document.getElementById('tab-register').addEventListener('click', () => {
    AudioSynth.playClick();
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('form-register').classList.remove('hidden');
    document.getElementById('form-login').classList.add('hidden');
  });

  // Guest Play action
  document.getElementById('btn-guest-play').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('dashboard');
    ViewRefresher.refreshDashboard();
  });

  // G. Launch Arena game
  document.getElementById('btn-launch-quiz').addEventListener('click', () => {
    const cat = document.getElementById('arena-category').value;
    const diff = document.querySelector('input[name="difficulty"]:checked').value;
    QuizArena.start(cat, diff, false);
  });

  const btnDashBookmarks = document.getElementById('btn-dash-bookmarks');
  if (btnDashBookmarks) {
    btnDashBookmarks.addEventListener('click', () => {
      QuizArena.startBookmarksQuiz();
    });
  }

  document.getElementById('btn-launch-daily').addEventListener('click', () => {
    QuizArena.start('Daily Challenge', 'medium', true);
  });

  // H. Quiz controls interactions
  document.getElementById('btn-quiz-hint').addEventListener('click', () => {
    QuizArena.revealHint();
  });

  document.getElementById('btn-quiz-next').addEventListener('click', () => {
    QuizArena.next();
  });

  // I. Summary Return Actions
  document.getElementById('btn-summary-dashboard').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('dashboard');
    ViewRefresher.refreshDashboard();
  });

  document.getElementById('btn-summary-review').addEventListener('click', () => {
    AudioSynth.playClick();
    const panel = document.getElementById('summary-review-panel');
    panel.classList.toggle('hidden');
  });

  // J. Admin Panel Routes
  document.getElementById('btn-dash-admin').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('admin');
    ViewRefresher.refreshAdminUsers();
    document.getElementById('admin-tab-questions').click();
  });

  document.getElementById('btn-admin-back').addEventListener('click', () => {
    AudioSynth.playClick();
    ViewController.switchView('dashboard');
    ViewRefresher.refreshDashboard();
  });

  // Toggle Admin tabs
  const adminTabsList = ['questions', 'users', 'feedback', 'reports', 'notifs', 'logins'];
  adminTabsList.forEach(t => {
    const btn = document.getElementById(`admin-tab-${t}`);
    if (btn) {
      btn.addEventListener('click', () => {
        AudioSynth.playClick();
        adminTabsList.forEach(tb => {
          document.getElementById(`admin-tab-${tb}`).classList.remove('active');
          document.getElementById(`admin-panel-${tb}`).classList.add('hidden');
        });
        btn.classList.add('active');
        document.getElementById(`admin-panel-${t}`).classList.remove('hidden');

        // Refresh appropriate lists
        if (t === 'users') ViewRefresher.refreshAdminUsers();
        if (t === 'feedback') refreshAdminFeedbackList();
        if (t === 'reports') refreshAdminReportsList();
        if (t === 'notifs') refreshAdminNotifsList();
        if (t === 'logins') refreshAdminLoginsList();
      });
    }
  });

  // Load lists helpers
  async function refreshAdminFeedbackList() {
    try {
      const data = await NetworkClient.request('/admin/feedback');
      const tbody = document.getElementById('admin-feedback-table-body');
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No feedback entries found.</td></tr>';
        return;
      }
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.username}</strong></td>
          <td style="color:var(--accent-amber); font-weight:700;">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</td>
          <td>${item.comment || '<span class="text-muted">No comment</span>'}</td>
          <td>${new Date(item.created_at).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) { console.error(e); }
  }

  async function refreshAdminReportsList() {
    try {
      const data = await NetworkClient.request('/admin/reports');
      const tbody = document.getElementById('admin-reports-table-body');
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No question reports flagged.</td></tr>';
        return;
      }
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${item.question_id}</code></td>
          <td>User #${item.user_id}</td>
          <td><span class="badge badge-role">${item.reason}</span></td>
          <td>${item.comments || '<span class="text-muted">No details</span>'}</td>
          <td>${new Date(item.created_at).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) { console.error(e); }
  }

  async function refreshAdminNotifsList() {
    try {
      const data = await NetworkClient.request('/admin/notifications');
      const tbody = document.getElementById('admin-notifs-table-body');
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No broadcasts sent yet.</td></tr>';
        return;
      }
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.title}</strong></td>
          <td>${item.message}</td>
          <td>${new Date(item.created_at).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) { console.error(e); }
  }

  async function refreshAdminLoginsList() {
    try {
      const data = await NetworkClient.request('/admin/login-logs');
      const tbody = document.getElementById('admin-logins-table-body');
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No logins audited yet.</td></tr>';
        return;
      }
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${item.ip_address}</code></td>
          <td style="font-size:11px; max-width:250px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${item.device_agent}">${item.device_agent}</td>
          <td>${new Date(item.logged_in_at).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) { console.error(e); }
  }

  // Handle broadcasts submissions
  document.getElementById('form-admin-broadcast').addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();
    const title = document.getElementById('admin-notif-title').value;
    const message = document.getElementById('admin-notif-msg').value;
    try {
      await NetworkClient.request('/admin/notifications', 'POST', { title, message });
      alert('System announcement broadcasted successfully!');
      document.getElementById('admin-notif-title').value = '';
      document.getElementById('admin-notif-msg').value = '';
      refreshAdminNotifsList();
    } catch (err) {
      alert(err.message);
    }
  });

  // Question CRUD logic (Add, Edit, Delete, Search)
  const qForm = document.getElementById('form-admin-question');
  qForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();

    const qId = document.getElementById('admin-q-id').value;
    const payload = {
      category: document.getElementById('admin-q-category').value,
      difficulty: document.getElementById('admin-q-difficulty').value,
      question_text: document.getElementById('admin-q-text').value,
      option_a: document.getElementById('admin-q-optA').value,
      option_b: document.getElementById('admin-q-optB').value,
      option_c: document.getElementById('admin-q-optC').value,
      option_d: document.getElementById('admin-q-optD').value,
      correct_option: document.getElementById('admin-q-correct').value,
      explanation: document.getElementById('admin-q-explanation').value,
      hint: document.getElementById('admin-q-hint').value
    };

    try {
      if (qId) {
        // Edit mode
        await NetworkClient.request(`/admin/questions/${qId}`, 'PUT', payload);
        alert('Question updated successfully!');
      } else {
        // Create mode
        await NetworkClient.request('/admin/questions', 'POST', payload);
        alert('Question created successfully!');
      }

      qForm.reset();
      document.getElementById('admin-q-id').value = '';
      document.getElementById('admin-question-form-title').innerText = 'Add New Quiz Question';
      document.getElementById('btn-admin-q-cancel').classList.add('hidden');
      document.getElementById('btn-admin-q-submit').innerText = 'Add Question';

      document.getElementById('btn-admin-search').click();
    } catch (err) {
      alert('Operation Failed: ' + err.message);
    }
  });

  document.getElementById('btn-admin-q-cancel').addEventListener('click', () => {
    AudioSynth.playClick();
    qForm.reset();
    document.getElementById('admin-q-id').value = '';
    document.getElementById('admin-question-form-title').innerText = 'Add New Quiz Question';
    document.getElementById('btn-admin-q-cancel').classList.add('hidden');
    document.getElementById('btn-admin-q-submit').innerText = 'Add Question';
  });

  document.getElementById('btn-admin-search').addEventListener('click', async () => {
    AudioSynth.playClick();
    const query = document.getElementById('admin-search-query').value;

    try {
      const questions = await NetworkClient.request(`/admin/questions/search?query=${encodeURIComponent(query)}`);
      const tbody = document.getElementById('admin-questions-table-body');
      tbody.innerHTML = '';

      if (questions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No matching questions found.</td></tr>`;
        return;
      }

      questions.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="badge">${q.category}</span><br><span style="font-size:10px">${q.difficulty.toUpperCase()}</span></td>
          <td style="max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${q.question_text}</td>
          <td>
            <button onclick="window.editAdminQuestion(${q.id}, '${q.category}', '${q.difficulty}', \`${q.question_text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, \`${q.option_a.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, \`${q.option_b.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, \`${q.option_c.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, \`${q.option_d.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${q.correct_option}', \`${(q.explanation || '').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, \`${(q.hint || '').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" class="action-btn btn-secondary btn-sm" style="margin-right: 4px;">Edit</button>
            <button onclick="window.deleteAdminQuestion(${q.id})" class="action-btn btn-secondary btn-sm" style="color: var(--accent-red); border-color: rgba(239,68,68,0.3);">Del</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      alert('Search failed: ' + e.message);
    }
  });

  // Global window mappings for dynamically generated onclick buttons
  window.editAdminQuestion = (id, category, difficulty, text, optA, optB, optC, optD, correct, explanation, hint) => {
    AudioSynth.playClick();
    document.getElementById('admin-q-id').value = id;
    document.getElementById('admin-q-category').value = category;
    document.getElementById('admin-q-difficulty').value = difficulty;
    document.getElementById('admin-q-text').value = text;
    document.getElementById('admin-q-optA').value = optA;
    document.getElementById('admin-q-optB').value = optB;
    document.getElementById('admin-q-optC').value = optC;
    document.getElementById('admin-q-optD').value = optD;
    document.getElementById('admin-q-correct').value = correct;
    document.getElementById('admin-q-explanation').value = explanation;
    document.getElementById('admin-q-hint').value = hint;

    document.getElementById('admin-question-form-title').innerText = 'Edit Question ID: ' + id;
    document.getElementById('btn-admin-q-cancel').classList.remove('hidden');
    document.getElementById('btn-admin-q-submit').innerText = 'Save Changes';

    document.querySelector('.admin-form-container').scrollIntoView({ behavior: 'smooth' });
  };

  window.deleteAdminQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await NetworkClient.request(`/admin/questions/${id}`, 'DELETE');
      AudioSynth.playClick();
      document.getElementById('btn-admin-search').click();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  window.deleteLeaderboardScore = async (userId) => {
    AudioSynth.playClick();
    const msg = window.currentLang === 'ta' ? 'உங்கள் தரவரிசை ஸ்கோரை நீக்க வேண்டுமா?' : window.currentLang === 'hi' ? 'क्या आप अपना लीडरबोर्ड स्कोर हटाना चाहते हैं?' : 'Are you sure you want to delete this leaderboard score?';
    if (!confirm(msg)) return;

    try {
      if (AppState.token) {
        // Logged-in mode
        await NetworkClient.request(`/leaderboard/${userId}`, 'DELETE');
      } else {
        // Guest mode / Simulation local storage mode
        // Reset simulation details in localStorage
        const progressKey = 'guest_progress';
        const historyKey = 'guest_history';
        localStorage.removeItem(progressKey);
        localStorage.removeItem(historyKey);
        localStorage.removeItem('guest_achievements');
      }

      alert(window.currentLang === 'ta' ? 'வெற்றிகரமாக நீக்கப்பட்டது!' : window.currentLang === 'hi' ? 'सफलतापूर्वक हटा दिया गया!' : 'Score deleted successfully!');

      // If we deleted our own score, reset our locally cached stats in AppState too
      if (AppState.user && AppState.user.id === userId) {
        try {
          const profile = await NetworkClient.request('/auth/me');
          AppState.user = profile.user;
        } catch (e) { }
      }

      // Refresh current leaderboard view to reflect changes immediately
      const activeTab = document.querySelector('.leaderboard-periods-tabs .active');
      const period = activeTab ? activeTab.getAttribute('data-period') : 'all';
      ViewRefresher.refreshLeaderboard(period);
    } catch (err) {
      alert('Failed to reset leaderboard score: ' + err.message);
    }
  };

  // ===================================================
  // ADDITIONAL FEATURES IMPLEMENTATIONS (15 major upgrades)
  // ===================================================

  // 1. MULTILINGUAL DICTIONARIES & TRANSLATIONS SWITCHER
  // 1. MULTILINGUAL DICTIONARIES & TRANSLATIONS SWITCHER
  const Translations = {
    en: {
      // Buttons and IDs
      "tab-dash-arena": "🎮 Arena",
      "tab-dash-profile": "👤 Profile Hub",
      "tab-dash-shop": "🪙 Reward Shop",
      "tab-dash-predictor": "📊 Skill Predictor",
      "btn-voice-speak": "🔊 Speak Question",
      "btn-voice-pause": "⏸️ Pause",
      "btn-voice-stop": "⏹️ Stop",
      "btn-quiz-report": "🚩 Report",
      "btn-quiz-tutor": "💬 Ask AI Tutor",
      "btn-quiz-next": "Next Question ➡️",
      "btn-quiz-hint": "💡 Need a Hint? (3 left)",
      "btn-submit-feedback": "Submit Review",
      "btn-summary-dashboard": "Return to Dashboard",
      "btn-summary-review": "Review Answers",
      "btn-summary-certificate": "🎓 Claim Certificate",
      "btn-cel-claim": "Claim Certificate 🎓",
      "btn-cel-share": "Share Result 🔗",
      "btn-cel-continue": "Continue Learning 📚",
      "btn-cel-home": "Back to Home 🏠",
      "btn-nav-login": "Sign In",

      // Class dict-key mapping
      "app-title": "AI Quiz Challenge",
      "tooltip-coins-title": "Coins Balance",
      "tooltip-coins-desc": "You earn 1 Coin for every 1 XP gained by answering questions correctly. Coins can be spent in the Reward Shop to unlock custom themes, frames, and avatars!",
      "hero-title-text": "Test Your Brain in the AI Quiz Arena",
      "hero-subtitle-text": "Compete in 10 technical categories, climb the global leaderboard, earn digital certificates, and unlock profile rewards!",
      "btn-start-arena": "Enter Quiz Arena 🎮",
      "btn-view-leaderboard-landing": "Leaderboard Rankings 🏆",
      "auth-tab-login": "Sign In",
      "auth-tab-register": "Create Account",
      "auth-label-username-email": "Username or Email Address",
      "auth-label-password": "Secure Password",
      "auth-link-forgot": "Forgot Password?",
      "auth-btn-signin": "Sign In Securely",
      "auth-label-or": "or",
      "auth-btn-google": "Sign In with Google",
      "auth-label-email": "Email Address",
      "auth-label-new-username": "Choose unique username",
      "auth-label-new-password": "Password (min. 6 characters)",
      "auth-btn-register": "Create Free Account",
      "auth-label-guest": "Or play without an account",
      "auth-btn-guest": "Play as Guest 👤",
      "dash-stat-xp": "Total XP",
      "dash-stat-coins": "Coins",
      "dash-stat-streak": "Streak",
      "dash-stat-quizzes": "Quizzes",
      "dash-level-label": "Level",
      "btn-dash-bookmarks": "🔖 Saved Questions",
      "btn-dash-leaderboard": "🏆 Leaderboard",
      "btn-dash-admin": "⚙️ Admin Panel",
      "arena-card-title": "Configure Quiz Arena",
      "arena-label-category": "Topic Category",
      "arena-label-difficulty": "Select Difficulty",
      "arena-label-mode": "Select Game Mode",
      "arena-desc-mode-classic": "Classic Mode: Standard 10 questions timer limits.",
      "arena-label-practice": "Enable Practice Mode (No score penalty, unlimited retries)",
      "arena-label-practice-timer": "Enable Question Timer in Practice",
      "arena-btn-start": "Start Quiz Arena 🚀",
      "daily-challenge-title": "Daily Challenge",
      "daily-challenge-desc": "A fresh, fixed set of 10 trivia questions refreshed every 24 hours. Play to earn special achievements!",
      "daily-challenge-status": "Daily Challenge Status:",
      "achievements-title": "Achievements & Badges",
      "achievements-desc": "Solve quiz conditions to unlock these digital medals",
      "bookmarks-title": "Bookmarked Questions",
      "bookmarks-desc": "Study and review your saved technical queries",
      "bookmarks-empty": "No bookmarked questions yet. Click the bookmark icon during gameplay or review to save questions!",
      "history-title": "Activity History & Stats",
      "history-skill-tier": "Estimated Skill Tier:",
      "history-correct-ratio": "Correct Answers Ratio:",
      "profile-card-title": "Profile Customization",
      "profile-label-avatar-emoji": "Choose Avatar Emoji",
      "profile-label-username": "Change Username",
      "profile-label-bio": "Short Biography (Bio)",
      "profile-label-fav-cat": "Favorite Subject Category",
      "profile-label-theme": "Select Active Theme (Themes must be purchased from Shop)",
      "profile-btn-save": "Save Changes",
      "certs-card-title": "My Earned Certificates",
      "certs-card-desc": "Your verified credentials list (quizzes scored >= 80% accuracy)",
      "certs-empty": "No certificates claimed yet. Complete any quiz with 80% accuracy to earn.",
      "history-sessions-title": "Active Device Sessions & Login History",
      "history-sessions-desc": "Security audit records logging user-agent access logs",
      "shop-card-title": "Cosmetics Reward Shop",
      "shop-card-desc": "Unlock cosmetic profile elements, themes, and gameplay advantages using earned Coins",
      "shop-balance": "Coins Balance:",
      "shop-inventory-title": "Your Purchased Items",
      "predictor-card-title": "Future Skill & Career Predictor",
      "predictor-desc": "Analyzes your quiz history to predict subject mastery and suggest optimal career paths",
      "predictor-skills-title": "Subject Skills Breakdown",
      "predictor-checkpoints-title": "Career Pathway Milestones",
      "predictor-month-title": "Performance Trend Index",
      "quiz-label-timer": "Timer:",
      "quiz-label-lifelines": "Lifelines:",
      "tutor-header-title": "AI Tutor Dialogue",
      "tutor-status-online": "Online (Hint First Mode)",
      "chip-hint": "💡 Give me a hint",
      "chip-concept": "📖 Explain the concept",
      "chip-answer": "🔑 Explain answer",
      "tutor-input-placeholder": "Ask a follow-up question...",
      "btn-tutor-chat-send": "Send ➡️",
      "lb-title": "🏆 Global Rankings",
      "lb-desc": "Compete with engineers around the world. Ranked by Total Experience Points (XP).",
      "lb-period-all": "All-Time",
      "lb-period-weekly": "Weekly",
      "lb-period-monthly": "Monthly",
      "lb-th-rank": "Rank",
      "lb-th-username": "Username",
      "lb-th-xp": "Total XP",
      "lb-th-quizzes": "Quizzes Completed",
      "lb-th-perfect": "Perfect Score",
      "lb-th-streak": "Streak",
      "lb-th-actions": "Actions",
      "summary-headline": "Quiz Completed!",
      "summary-meta-desc": "You tested your brain in AI Quiz Arena",
      "summary-score-label": "Correct",
      "summary-rating-title": "Rate your experience:",
      "summary-review-title": "Question-by-Question Breakdown",
      "reset-title": "Password Recovery",
      "reset-email-desc": "Enter your email address to receive a secure password recovery code.",
      "reset-email-label": "Email Address",
      "reset-btn-send": "Send Recovery Code",
      "reset-btn-cancel": "Cancel",
      "reset-code-desc": "Enter the code and choose a new password.",
      "reset-code-label": "Verification Code",
      "reset-pass-label": "New Password",
      "reset-btn-submit": "Reset Password",
      "report-title": "Report Question",
      "report-label-reason": "Select Reason",
      "report-reason-wrong": "Wrong Answer",
      "report-reason-incorrect": "Incorrect Question",
      "report-reason-typo": "Typo",
      "report-reason-dup": "Duplicate",
      "report-reason-other": "Other",
      "report-comments-label": "Additional Comments",
      "report-btn-submit": "Submit Report",
      "report-btn-cancel": "Cancel",
      "cert-congrats": "Congratulations!",
      "cert-title-cert": "Certificate of Achievement",
      "cert-name-lbl": "This is proudly presented to",
      "cert-desc-lbl": "For successfully completing the AI Quiz Challenge and demonstrating excellent knowledge and performance in the technical subject category.",
      "btn-cert-download-pdf": "Download PDF",
      "btn-cert-download-png": "Download PNG",
      "btn-cert-share": "Share Certificate",
      "btn-cert-close": "Back to Home",
      "admin-title": "Admin Control Console",
      "admin-tab-q": "Questions",
      "admin-tab-u": "Users",
      "admin-tab-f": "Feedback",
      "admin-tab-r": "Reports",
      "admin-tab-b": "Broadcasts",
      "admin-tab-l": "Login Logs",
      "admin-q-form-title": "Add New Quiz Question",
      "admin-q-label-cat": "Category",
      "admin-q-label-diff": "Difficulty",
      "admin-q-label-prompt": "Question Prompt",
      "admin-q-label-a": "Option A",
      "admin-q-label-b": "Option B",
      "admin-q-label-c": "Option C",
      "admin-q-label-d": "Option D",
      "admin-q-label-correct": "Correct Option",
      "admin-q-label-explain": "Explanation",
      "admin-q-label-hint": "Hint",
      "btn-admin-q-submit": "Add Question",
      "btn-admin-q-cancel": "Cancel Edit",
      "admin-q-repo-title": "Question Repository",
      "admin-q-search-placeholder": "Search questions by text...",
      "btn-admin-search": "Search",
      "admin-users-title": "Registered Players Manager",
      "admin-feedback-title": "Player Rating Reviews",
      "admin-reports-title": "Flagged Question Reports",
      "admin-broadcast-title": "System Broadcaster",
      "admin-broadcast-label": "Broadcast Announcement",
      "btn-admin-broadcast-submit": "Send Broadcast",
      "admin-broadcast-history-title": "Broadcast History",
      "admin-logs-title": "Access Audit Security Logins"
    },
    ta: {
      // Buttons and IDs
      "tab-dash-arena": "🎮 விளையாடு",
      "tab-dash-profile": "👤 சுயவிவரம்",
      "tab-dash-shop": "🪙 கடை",
      "tab-dash-predictor": "📊 கணிப்பான்",
      "btn-voice-speak": "🔊 கேள்வியைப் பேசு",
      "btn-voice-pause": "⏸️ இடைநிறுத்து",
      "btn-voice-stop": "⏹️ நிறுத்து",
      "btn-quiz-report": "🚩 புகாரளி",
      "btn-quiz-tutor": "💬 AI வழிகாட்டி",
      "btn-quiz-next": "அடுத்த கேள்வி ➡️",
      "btn-quiz-hint": "💡 குறிப்பு தேவை? (3 மீதம்)",
      "btn-submit-feedback": "கருத்து சமர்ப்பி",
      "btn-summary-dashboard": "முகப்புக்குத் திரும்பு",
      "btn-summary-review": "விடைகளை மதிப்பாய்வு செய்",
      "btn-summary-certificate": "🎓 சான்றிதழ் பெறு",
      "btn-cel-claim": "சான்றிதழ் பெறு 🎓",
      "btn-cel-share": "பகிர் 🔗",
      "btn-cel-continue": "தொடர்ந்து படி 📚",
      "btn-cel-home": "முகப்புக்கு 🏠",
      "btn-nav-login": "உள்நுழைக",

      // Class dict-key mapping
      "app-title": "AI வினாடி வினா சவால்",
      "tooltip-coins-title": "நாணயங்கள் இருப்பு",
      "tooltip-coins-desc": "கேள்விகளுக்குச் சரியாகப் பதிலளிப்பதன் மூலம் நீங்கள் பெறும் ஒவ்வொரு 1 எக்ஸ்பிக்கும் 1 நாணயம் கிடைக்கும். கடைப் பகுதியில் வினாக்கள், தீம்கள், பிரேம்கள் வாங்கப் பயன்படுத்தலாம்!",
      "hero-title-text": "AI வினாடி வினா அரங்கில் உங்கள் மூளையை சோதிக்கவும்",
      "hero-subtitle-text": "10 தொழில்நுட்ப பிரிவுகளில் போட்டியிடுங்கள், உலகளாவிய தரவரிசையில் ஏறி, டிஜிட்டல் சான்றிதழ்களைப் பெறுங்கள்!",
      "btn-start-arena": "வினாடி வினா அரங்கில் நுழைக 🎮",
      "btn-view-leaderboard-landing": "தரவரிசை பட்டியல் 🏆",
      "auth-tab-login": "உள்நுழைவு",
      "auth-tab-register": "கணக்கை உருவாக்கு",
      "auth-label-username-email": "பயனர் பெயர் அல்லது மின்னஞ்சல் முகவரி",
      "auth-label-password": "பாதுகாப்பான கடவுச்சொல்",
      "auth-link-forgot": "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
      "auth-btn-signin": "பாதுகாப்பாக உள்நுழைக",
      "auth-label-or": "அல்லது",
      "auth-btn-google": "கூகிள் மூலம் உள்நுழைக",
      "auth-label-email": "மின்னஞ்சல் முகவரி",
      "auth-label-new-username": "தனித்துவமான பயனர் பெயர்",
      "auth-label-new-password": "கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்)",
      "auth-btn-register": "இலவச கணக்கை உருவாக்கு",
      "auth-label-guest": "அல்லது கணக்கு இல்லாமல் விளையாடுங்கள்",
      "auth-btn-guest": "விருந்தினராக விளையாடு 👤",
      "dash-stat-xp": "மொத்த எக்ஸ்பி",
      "dash-stat-coins": "நாணயங்கள்",
      "dash-stat-streak": "தொடர் நாட்கள்",
      "dash-stat-quizzes": "வினாடி வினாக்கள்",
      "dash-level-label": "நிலை",
      "btn-dash-bookmarks": "🔖 சேமித்த கேள்விகள்",
      "btn-dash-leaderboard": "🏆 தரவரிசை",
      "btn-dash-admin": "⚙️ நிர்வாக குழு",
      "arena-card-title": "வினாடி வினா கட்டமைக்க",
      "arena-label-category": "தலைப்பு பிரிவு",
      "arena-label-difficulty": "கடினத்தன்மை தேர்வு செய்க",
      "arena-label-mode": "விளையாட்டு முறை",
      "arena-desc-mode-classic": "கிளாசிக் முறை: நிலையான 10 கேள்விகள் நேர வரம்புகள்.",
      "arena-label-practice": "பயிற்சி முறை (மதிப்பெண் இழப்பு இல்லை, வரம்பற்ற முயற்சிகள்)",
      "arena-label-practice-timer": "பயிற்சியில் நேர வரம்பை இயக்கு",
      "arena-btn-start": "வினாடி வினாவைத் தொடங்கு 🚀",
      "daily-challenge-title": "தினசரி சவால்",
      "daily-challenge-desc": "ஒவ்வொரு 24 மணி நேரத்திற்கும் புதுப்பிக்கப்படும் 10 புதிய வினாக்கள். சிறப்பு சாதனைகளைப் பெற விளையாடுங்கள்!",
      "daily-challenge-status": "தினசரி சவால் நிலை:",
      "achievements-title": "சாதனைகள் மற்றும் பேட்ஜ்கள்",
      "achievements-desc": "பேட்ஜ்களைத் திறக்க வினாடி வினாக்களை முடிக்கவும்",
      "bookmarks-title": "சேமிக்கப்பட்ட கேள்விகள்",
      "bookmarks-desc": "உங்கள் சேமித்த தொழில்நுட்ப கேள்விகளைப் படியுங்கள்",
      "bookmarks-empty": "இன்னும் கேள்விகள் சேமிக்கப்படவில்லை! விளையாடும்போது சேமிக்க புக்மார்க் ஐகானை அழுத்தவும்.",
      "history-title": "செயல்பாட்டு வரலாறு & புள்ளிவிவரங்கள்",
      "history-skill-tier": "மதிப்பிடப்பட்ட திறன் நிலை:",
      "history-correct-ratio": "சரியான பதில்களின் விகிதம்:",
      "profile-card-title": "சுயவிவர தனிப்பயனாக்கம்",
      "profile-label-avatar-emoji": "அவதார் ஈமோஜி",
      "profile-label-username": "பயனர் பெயரை மாற்றுக",
      "profile-label-bio": "சுயசரிதை (பயோ)",
      "profile-label-fav-cat": "விருப்பமான தொழில்நுட்ப பிரிவு",
      "profile-label-theme": "தீம் தேர்வு செய்யவும் (தீம்கள் கடையில் வாங்கப்பட வேண்டும்)",
      "profile-btn-save": "மாற்றங்களைச் சேமி",
      "certs-card-title": "நான் பெற்ற சான்றிதழ்கள்",
      "certs-card-desc": "உங்களின் சரிபார்க்கப்பட்ட சான்றிதழ்கள் பட்டியல் (80% துல்லியம்)",
      "certs-empty": "இன்னும் சான்றிதழ்கள் பெறப்படவில்லை. 80% மதிப்பெண்ணுடன் வினாடி வினாவை முடிக்கவும்.",
      "history-sessions-title": "செயலில் உள்ள அமர்வுகள் & உள்நுழைவு வரலாறு",
      "history-sessions-desc": "பாதுகாப்பு தணிக்கை சாதன அணுகல் பதிவுகள்",
      "shop-card-title": "அலங்கார வெகுமதி கடை",
      "shop-card-desc": "நாணயங்களைப் பயன்படுத்தி அவதார் பிரேம்கள், தீம்கள் மற்றும் விளையாட்டு சலுகைகளைத் திறக்கவும்",
      "shop-balance": "நாணயங்கள் இருப்பு:",
      "shop-inventory-title": "நீங்கள் வாங்கிய பொருட்கள்",
      "predictor-card-title": "எதிர்கால திறன் மற்றும் தொழில் கணிப்பான்",
      "predictor-desc": "உங்கள் வினாடி வினா வரலாற்றை பகுப்பாய்வு செய்து சிறந்த தொழில் வழிகளை பரிந்துரைக்கிறது",
      "predictor-skills-title": "பாடத் திறன் முறிவு",
      "predictor-checkpoints-title": "தொழில் பாதை மைல்கற்கள்",
      "predictor-month-title": "செயல்திறன் போக்கு குறியீடு",
      "quiz-label-timer": "நேரம்:",
      "quiz-label-lifelines": "உதவிகள்:",
      "tutor-header-title": "AI வழிகாட்டி உரையாடல்",
      "tutor-status-online": "செயலில் உள்ளது (குறிப்பு முதல் முறை)",
      "chip-hint": "💡 குறிப்பு கொடுங்கள்",
      "chip-concept": "📖 கருத்தை விளக்குங்கள்",
      "chip-answer": "🔑 விடையை விளக்குங்கள்",
      "tutor-input-placeholder": "தொடர் கேள்வியைக் கேளுங்கள்...",
      "btn-tutor-chat-send": "அனுப்பு ➡️",
      "lb-title": "🏆 உலகளாவிய தரவரிசை",
      "lb-desc": "உலகெங்கிலும் உள்ள பொறியாளர்களுடன் போட்டியிடுங்கள். மொத்த எக்ஸ்பி (XP) அடிப்படையில்.",
      "lb-period-all": "எல்லா காலமும்",
      "lb-period-weekly": "வாரம்",
      "lb-period-monthly": "மாதம்",
      "lb-th-rank": "தரவரிசை",
      "lb-th-username": "பயனர் பெயர்",
      "lb-th-xp": "மொத்த எக்ஸ்பி",
      "lb-th-quizzes": "வினாடி வினாக்கள்",
      "lb-th-perfect": "சரியான ஸ்கோர்",
      "lb-th-streak": "தொடர் நாட்கள்",
      "lb-th-actions": "செயல்கள்",
      "summary-headline": "வினாடி வினா முடிந்தது!",
      "summary-meta-desc": "நீங்கள் சவாலை வெற்றிகரமாக முடித்துள்ளீர்கள்",
      "summary-score-label": "சரியானது",
      "summary-rating-title": "உங்கள் அனுபவத்தை மதிப்பிடுங்கள்:",
      "summary-review-title": "கேள்வி வாரியான முறிவு",
      "reset-title": "கடவுச்சொல் மீட்பு",
      "reset-email-desc": "மீட்புக் குறியீட்டைப் பெற உங்கள் மின்னஞ்சலை உள்ளிடவும்.",
      "reset-email-label": "மின்னஞ்சல் முகவரி",
      "reset-btn-send": "மீட்புக் குறியீட்டை அனுப்பு",
      "reset-btn-cancel": "ரத்துசெய்",
      "reset-code-desc": "குறியீட்டை உள்ளிட்டு புதிய கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்.",
      "reset-code-label": "சரிபார்ப்புக் குறியீடு",
      "reset-pass-label": "புதிய கடவுச்சொல்",
      "reset-btn-submit": "கடவுச்சொல்லை மீட்டமை",
      "report-title": "கேள்வியைப் புகாரளி",
      "report-label-reason": "காரணத்தைத் தேர்ந்தெடுக்கவும்",
      "report-reason-wrong": "தவறான விடை",
      "report-reason-incorrect": "தவறான கேள்வி",
      "report-reason-typo": "எழுத்துப்பிழை",
      "report-reason-dup": "நகல் கேள்வி",
      "report-reason-other": "இதர",
      "report-comments-label": "கூடுதல் கருத்துகள்",
      "report-btn-submit": "புகாரைச் சமர்ப்பி",
      "report-btn-cancel": "ரத்துசெய்",
      "cert-congrats": "வாழ்த்துகள்!",
      "cert-title-cert": "சாதனைச் சான்றிதழ்",
      "cert-name-lbl": "இது பெருமையுடன் வழங்கப்படுகிறது",
      "cert-desc-lbl": "AI வினாடி வினா சவாலை வெற்றிகரமாக முடித்து, தொழில்நுட்ப பாடப் பிரிவில் சிறந்த அறிவையும் செயல்திறனையும் வெளிப்படுத்தியமைக்காக.",
      "btn-cert-download-pdf": "PDF பதிவிறக்கு",
      "btn-cert-download-png": "PNG பதிவிறக்கு",
      "btn-cert-share": "சான்றிதழைப் பகிர்",
      "btn-cert-close": "முகப்புக்குச் செல்",
      "admin-title": "நிர்வாக கட்டுப்பாட்டு கன்சோல்",
      "admin-tab-q": "கேள்விகள்",
      "admin-tab-u": "பயனர்கள்",
      "admin-tab-f": "கருத்துகள்",
      "admin-tab-r": "புகார்கள்",
      "admin-tab-b": "அறிவிப்புகள்",
      "admin-tab-l": "உள்நுழைவு பதிவுகள்",
      "admin-q-form-title": "புதிய வினாடி வினா கேள்வி சேர்க்க",
      "admin-q-label-cat": "பிரிவு",
      "admin-q-label-diff": "கடினத்தன்மை",
      "admin-q-label-prompt": "கேள்வி உரை",
      "admin-q-label-a": "விருப்பம் A",
      "admin-q-label-b": "விருப்பம் B",
      "admin-q-label-c": "விருப்பம் C",
      "admin-q-label-d": "விருப்பம் D",
      "admin-q-label-correct": "சரியான விருப்பம்",
      "admin-q-label-explain": "விளக்கம்",
      "admin-q-label-hint": "குறிப்பு",
      "btn-admin-q-submit": "கேள்வி சேர்",
      "btn-admin-q-cancel": "தொகுத்தலை ரத்துசெய்",
      "admin-q-repo-title": "கேள்வி களஞ்சியம்",
      "admin-q-search-placeholder": "தேடல் கேள்விகள்...",
      "btn-admin-search": "தேடு",
      "admin-users-title": "பதிவுசெய்த பயனர்கள் மேலாளர்",
      "admin-feedback-title": "மதிப்பீட்டு விமர்சனங்கள்",
      "admin-reports-title": "கொடியிடப்பட்ட கேள்வி புகார்கள்",
      "admin-broadcast-title": "அமைப்பு அறிவிப்பாளர்",
      "admin-broadcast-label": "அறிவிப்பு உரை",
      "btn-admin-broadcast-submit": "அறிவிப்பை அனுப்பு",
      "admin-broadcast-history-title": "அறிவிப்பு வரலாறு",
      "admin-logs-title": "அணுகல் தணிக்கை பாதுகாப்பு உள்நுழைவுகள்"
    },
    hi: {
      // Buttons and IDs
      "tab-dash-arena": "🎮 अखाड़ा",
      "tab-dash-profile": "👤 प्रोफाइल",
      "tab-dash-shop": "🪙 दुकान",
      "tab-dash-predictor": "📊 संकेतक",
      "btn-voice-speak": "🔊 प्रश्न बोलें",
      "btn-voice-pause": "⏸️ विराम दें",
      "btn-voice-stop": "⏹️ रोकें",
      "btn-quiz-report": "🚩 रिपोर्ट करें",
      "btn-quiz-tutor": "💬 AI शिक्षक",
      "btn-quiz-next": "अगला प्रश्न ➡️",
      "btn-quiz-hint": "💡 संकेत चाहिए? (3 शेष)",
      "btn-submit-feedback": "समीक्षा भेजें",
      "btn-summary-dashboard": "डैशबोर्ड पर जाएँ",
      "btn-summary-review": "उत्तर जांचें",
      "btn-summary-certificate": "🎓 प्रमाणपत्र प्राप्त करें",
      "btn-cel-claim": "प्रमाणपत्र प्राप्त करें 🎓",
      "btn-cel-share": "साझा करें 🔗",
      "btn-cel-continue": "पढ़ना जारी रखें 📚",
      "btn-cel-home": "मुख्य पृष्ठ 🏠",
      "btn-nav-login": "लॉग इन करें",

      // Class dict-key mapping
      "app-title": "एआई क्विज चैलेंज",
      "tooltip-coins-title": "सिक्कों का संतुलन",
      "tooltip-coins-desc": "प्रश्नों के सही उत्तर देने पर आपको प्रत्येक 1 एक्सपी के लिए 1 सिक्का प्राप्त होता है। दुकान में अवतार फ्रेम, थीम आदि खरीदने के लिए इनका उपयोग करें!",
      "hero-title-text": "एआई क्विज एरिना में अपने मस्तिष्क का परीक्षण करें",
      "hero-subtitle-text": "10 तकनीकी श्रेणियों में प्रतिस्पर्धा करें, वैश्विक लीडरबोर्ड पर चढ़ें, डिजिटल प्रमाणपत्र अर्जित करें!",
      "btn-start-arena": "प्रश्नोत्तरी क्षेत्र में प्रवेश करें 🎮",
      "btn-view-leaderboard-landing": "लीडरबोर्ड रैंकिंग 🏆",
      "auth-tab-login": "साइन इन करें",
      "auth-tab-register": "खाता बनाएं",
      "auth-label-username-email": "उपयोगकर्ता नाम या ईमेल पता",
      "auth-label-password": "सुरक्षित पासवर्ड",
      "auth-link-forgot": "पासवर्ड भूल गए?",
      "auth-btn-signin": "सुरक्षित रूप से साइन इन करें",
      "auth-label-or": "अथवा",
      "auth-btn-google": "गूगल के साथ साइन इन करें",
      "auth-label-email": "ईमेल पता",
      "auth-label-new-username": "अद्वितीय उपयोगकर्ता नाम",
      "auth-label-new-password": "पासवर्ड (कम से कम 6 अक्षर)",
      "auth-btn-register": "निःशुल्क खाता बनाएं",
      "auth-label-guest": "या बिना खाते के खेलें",
      "auth-btn-guest": "अतिथि के रूप में खेलें 👤",
      "dash-stat-xp": "कुल एक्सपी",
      "dash-stat-coins": "सिक्के",
      "dash-stat-streak": "लगातार दिन",
      "dash-stat-quizzes": "प्रश्नोत्तरी",
      "dash-level-label": "स्तर",
      "btn-dash-bookmarks": "🔖 सहेजे गए प्रश्न",
      "btn-dash-leaderboard": "🏆 लीडरबोर्ड",
      "btn-dash-admin": "⚙️ व्यवस्थापक पैनल",
      "arena-card-title": "प्रश्नोत्तरी कॉन्फ़िगर करें",
      "arena-label-category": "विषय श्रेणी",
      "arena-label-difficulty": "कठिनाई का चयन करें",
      "arena-label-mode": "खेल मोड",
      "arena-desc-mode-classic": "क्लासिक मोड: मानक 10 प्रश्न समय सीमा।",
      "arena-label-practice": "अभ्यास मोड (कोई अंक दंड नहीं, असीमित प्रयास)",
      "arena-label-practice-timer": "अभ्यास में टाइमर सक्षम करें",
      "arena-btn-start": "क्विज़ प्रारंभ करें 🚀",
      "daily-challenge-title": "दैनिक चुनौती",
      "daily-challenge-desc": "हर 24 घंटे में ताज़ा किए जाने वाले 10 नए प्रश्न। विशेष उपलब्धियों के लिए खेलें!",
      "daily-challenge-status": "दैनिक चुनौती स्थिति:",
      "achievements-title": "उपलब्धियां और बैज",
      "achievements-desc": "बैज अनलॉक करने के लिए प्रश्नोत्तरी पूरी करें",
      "bookmarks-title": "सहेजे गए प्रश्न",
      "bookmarks-desc": "अपने सहेजे गए तकनीकी प्रश्नों का अध्ययन करें",
      "bookmarks-empty": "अभी तक कोई प्रश्न सहेजा नहीं गया है! खेलते समय बचाने के लिए बुकमार्क आइकन दबाएं।",
      "history-title": "गतिविधि इतिहास और आँकड़े",
      "history-skill-tier": "अनुमानित कौशल स्तर:",
      "history-correct-ratio": "सही उत्तरों का अनुपात:",
      "profile-card-title": "प्रोफ़ाइल अनुकूलन",
      "profile-label-avatar-emoji": "अवतार इमोजी",
      "profile-label-username": "उपयोगकर्ता नाम बदलें",
      "profile-label-bio": "लघु जीवनी (बायो)",
      "profile-label-fav-cat": "पसंदीदा तकनीकी श्रेणी",
      "profile-label-theme": "सक्रिय थीम चुनें (थीम दुकान से खरीदी जानी चाहिए)",
      "profile-btn-save": "परिवर्तन सहेजें",
      "certs-card-title": "मेरे अर्जित प्रमाणपत्र",
      "certs-card-desc": "आपके सत्यापित प्रमाणपत्रों की सूची (80% सटीकता)",
      "certs-empty": "अभी तक कोई प्रमाणपत्र अर्जित नहीं किया गया है। 80% सटीकता के साथ प्रश्नोत्तरी पूरी करें।",
      "history-sessions-title": "सक्रिय सत्र और लॉगिन इतिहास",
      "history-sessions-desc": "सुरक्षा ऑडिट डिवाइस एक्सेस लॉग",
      "shop-card-title": "सौंदर्य प्रसाधन पुरस्कार की दुकान",
      "shop-card-desc": "सिक्कों का उपयोग करके अवतार फ्रेम, थीम और गेमप्ले लाभ अनलॉक करें",
      "shop-balance": "सिक्कों का संतुलन:",
      "shop-inventory-title": "आपके द्वारा खरीदी गई वस्तुएं",
      "predictor-card-title": "भविष्य के कौशल और कैरियर भविष्यवक्ता",
      "predictor-desc": "सर्वोत्तम कैरियर पथों की अनुशंसा करने के लिए आपके प्रश्नोत्तरी इतिहास का विश्लेषण करता है",
      "predictor-skills-title": "विषय कौशल विभाजन",
      "predictor-checkpoints-title": "कैरियर पथ मील के पत्थर",
      "predictor-month-title": "प्रदर्शन रुझान सूचकांक",
      "quiz-label-timer": "समय:",
      "quiz-label-lifelines": "लाइफलाइन:",
      "tutor-header-title": "एआई ट्यूटर बातचीत",
      "tutor-status-online": "सक्रिय है (संकेत प्रथम मोड)",
      "chip-hint": "💡 मुझे एक संकेत दें",
      "chip-concept": "📖 अवधारणा समझाएं",
      "chip-answer": "🔑 उत्तर समझाएं",
      "tutor-input-placeholder": "अगला प्रश्न पूछें...",
      "btn-tutor-chat-send": "भेजें ➡️",
      "lb-title": "🏆 वैश्विक रैंकिंग",
      "lb-desc": "दुनिया भर के इंजीनियरों के साथ प्रतिस्पर्धा करें। कुल एक्सपी (XP) के आधार पर।",
      "lb-period-all": "सर्वकालिक",
      "lb-period-weekly": "साप्ताहिक",
      "lb-period-monthly": "मासिक",
      "lb-th-rank": "रैंक",
      "lb-th-username": "उपयोगकर्ता नाम",
      "lb-th-xp": "कुल एक्सपी",
      "lb-th-quizzes": "प्रश्नोत्तरी पूर्ण",
      "lb-th-perfect": "उत्कृष्ट स्कोर",
      "lb-th-streak": "सिलसिला दिन",
      "lb-th-actions": "कार्रवाई",
      "summary-headline": "प्रश्नोत्तरी पूरी हुई!",
      "summary-meta-desc": "आपने सफलतापूर्वक चुनौती पूरी कर ली है",
      "summary-score-label": "सही उत्तर",
      "summary-rating-title": "अपने अनुभव को रेट करें:",
      "summary-review-title": "प्रश्न-दर-प्रश्न विश्लेषण",
      "reset-title": "पासवर्ड रिकवरी",
      "reset-email-desc": "रिकवरी कोड प्राप्त करने के लिए अपना ईमेल दर्ज करें।",
      "reset-email-label": "ईमेल पता",
      "reset-btn-send": "रिकवरी कोड भेजें",
      "reset-btn-cancel": "रद्द करें",
      "reset-code-desc": "कोड दर्ज करें और एक नया पासवर्ड चुनें।",
      "reset-code-label": "सत्यापन कोड",
      "reset-pass-label": "नया पासवर्ड",
      "reset-btn-submit": "पासवर्ड रीसेट करें",
      "report-title": "प्रश्न की रिपोर्ट करें",
      "report-label-reason": "कारण चुनें",
      "report-reason-wrong": "गलत उत्तर",
      "report-reason-incorrect": "गलत प्रश्न",
      "report-reason-typo": "वर्तनी की गलती",
      "report-reason-dup": "डुप्लिकेट प्रश्न",
      "report-reason-other": "अन्य",
      "report-comments-label": "अतिरिक्त टिप्पणियाँ",
      "report-btn-submit": "रिपोर्ट सबमिट करें",
      "report-btn-cancel": "रद्द करें",
      "cert-congrats": "बधाई हो!",
      "cert-title-cert": "उपलब्धि प्रमाण पत्र",
      "cert-name-lbl": "यह गर्व के साथ प्रस्तुत किया जाता है",
      "cert-desc-lbl": "एआई क्विज चुनौती को सफलतापूर्वक पूरा करने और तकनीकी विषय श्रेणी में उत्कृष्ट ज्ञान प्रदर्शित करने के लिए।",
      "btn-cert-download-pdf": "पीडीएफ डाउनलोड",
      "btn-cert-download-png": "पीएनजी डाउनलोड",
      "btn-cert-share": "प्रमाणपत्र साझा करें",
      "btn-cert-close": "मुख्य पृष्ठ पर जाएं",
      "admin-title": "व्यवस्थापक नियंत्रण कंसोल",
      "admin-tab-q": "प्रश्न",
      "admin-tab-u": "उपयोगकर्ता",
      "admin-tab-f": "प्रतिक्रियाएं",
      "admin-tab-r": "रिपोर्ट",
      "admin-tab-b": "प्रसारण",
      "admin-tab-l": "लॉगिन रिकॉर्ड",
      "admin-q-form-title": "नया क्विज़ प्रश्न जोड़ें",
      "admin-q-label-cat": "श्रेणी",
      "admin-q-label-diff": "कठिनाई",
      "admin-q-label-prompt": "प्रश्न पाठ",
      "admin-q-label-a": "विकल्प A",
      "admin-q-label-b": "विकल्प B",
      "admin-q-label-c": "विकल्प C",
      "admin-q-label-d": "विकल्प D",
      "admin-q-label-correct": "सही विकल्प",
      "admin-q-label-explain": "स्पष्टीकरण",
      "admin-q-label-hint": "संकेत",
      "btn-admin-q-submit": "प्रश्न जोड़ें",
      "btn-admin-q-cancel": "संपादन रद्द करें",
      "admin-q-repo-title": "प्रश्न भंडार",
      "admin-q-search-placeholder": "प्रश्न खोजें...",
      "btn-admin-search": "खोजें",
      "admin-users-title": "पंजीकृत उपयोगकर्ता प्रबंधक",
      "admin-feedback-title": "मूल्यांकन समीक्षाएँ",
      "admin-reports-title": "चिह्नित प्रश्न रिपोर्ट",
      "admin-broadcast-title": "सिस्टम उद्घोषक",
      "admin-broadcast-label": "उद्घोषणा पाठ",
      "btn-admin-broadcast-submit": "उद्घोषणा भेजें",
      "admin-broadcast-history-title": "उद्घोषणा इतिहास",
      "admin-logs-title": "पहुंच ऑडिट सुरक्षा लॉगिन"
    }
  };

  window.currentLang = 'en';
  function translateUI(lang) {
    window.currentLang = lang;
    const dict = Translations[lang] || Translations.en;

    // 1. Translate by ID
    for (const id in dict) {
      const el = document.getElementById(id);
      if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[id];
        } else {
          el.innerText = dict[id];
        }
      }
    }

    // 2. Translate by class dict-key
    document.querySelectorAll('.dict-key').forEach(el => {
      const key = el.dataset.key || el.getAttribute('data-key');
      if (key && dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerText = dict[key];
        }
      }
    });

    // 3. Translate page placeholders & selectors options
    const langSel = document.getElementById('select-language-toggle');
    if (langSel) langSel.value = lang;

    // 4. If in gameplay, redraw active question instantly!
    if (AppState.activeView === 'quiz' && AppState.quiz && AppState.quiz.questions && AppState.quiz.questions.length > 0) {
      // Redraw question texts instantly in active lang without resetting countdown timers
      const qRaw = AppState.quiz.questions[AppState.quiz.currentIndex];
      const q = translateQuestion(qRaw, lang);

      document.getElementById('quiz-badge-category').innerText = AppState.quiz.isDailyChallenge ? (lang === 'ta' ? 'தினசரி சவால்' : lang === 'hi' ? 'दैनिक चुनौती' : 'Daily Challenge') : q.category;
      document.getElementById('quiz-badge-difficulty').innerText = q.difficulty.toUpperCase();
      document.getElementById('quiz-question-text').innerText = q.question_text;

      // Re-draw option buttons text but keep their buttons reference
      const buttons = document.querySelectorAll('.option-btn');
      if (buttons.length === 4 && AppState.quiz.currentOptions) {
        buttons.forEach((btn) => {
          const indexSpan = btn.querySelector('.option-index');
          if (indexSpan) {
            const key = indexSpan.innerText;
            const opt = AppState.quiz.currentOptions.find(o => o.displayKey === key);
            if (opt) {
              const optTextTrans = translateQuestionOption(opt.text, lang);
              btn.innerHTML = `<span class="option-index">${key}</span> <span class="option-text">${optTextTrans}</span>`;
            }
          }
        });
      }

      // Refresh explanations or hint boxes text
      const hintBox = document.getElementById('hint-text-box');
      if (hintBox && !hintBox.classList.contains('hidden')) {
        if (hintBox.innerHTML.includes('Explanation:')) {
          hintBox.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
        } else {
          hintBox.innerHTML = `Hint: ${q.hint}`;
        }
      }
    }

    // Translate achievements/badges names and descriptions
    document.querySelectorAll('.badge-item').forEach(bEl => {
      const id = bEl.getAttribute('data-badge');
      const badgeTrans = badgeTranslations[lang]?.[id] || badgeTranslations.en?.[id];
      if (badgeTrans) {
        const nameEl = bEl.querySelector('.badge-name');
        const descEl = bEl.querySelector('.badge-desc');
        if (nameEl) nameEl.innerText = badgeTrans.name;
        if (descEl) descEl.innerText = badgeTrans.desc;
        bEl.setAttribute('title', badgeTrans.desc);
      }
    });

    // 5. If dashboard or leaderboard is active, trigger refreshes
    if (AppState.activeView === 'dashboard') {
      ViewRefresher.refreshDashboard();
    } else if (AppState.activeView === 'leaderboard') {
      ViewRefresher.refreshLeaderboard();
    }
  }

  function translateQuestionOption(text, lang) {
    if (!lang || lang === 'en') return text;

    const translations = {
      ta: {
        "Algorithms that enable computers to learn from and make predictions based on data.": "கணினிகள் தரவுகளிலிருந்து கற்றுக்கொள்ளவும் கணிப்புகளைச் செய்யவும் உதவும் வழிமுறைகள்.",
        "Natural Language Processing": "இயற்கை மொழி செயலாக்கம்",
        "Systems that understand, interpret, and process human text and spoken language.": "மனித உரை மற்றும் பேச்சு மொழியைப் புரிந்துகொள்ளும், விளக்கும் மற்றும் செயலாக்கும் அமைப்புகள்.",
        "Technology designed to extract information and understand digital images and videos.": "டிஜிட்டல் படங்கள் மற்றும் வீடியோக்களிலிருந்து தகவல்களைப் பிரித்தெடுக்கவும் புரிந்து கொள்ளவும் வடிவமைக்கப்பட்ட தொழில்நுட்பம்.",
        "Neural networks with multiple hidden layers that extract complex features from raw inputs.": "மூல உள்ளீடுகளிலிருந்து சிக்கலான அம்சங்களைப் பிரித்தெடுக்கும் பல மறைக்கப்பட்ட அடுக்குகளைக் கொண்ட நரம்பியல் நெட்வொர்க்குகள்.",
        "AI models trained to create new text, images, or synthetic data matching training distributions.": "பயிற்சி விநியோகங்களுடன் பொருந்தக்கூடிய புதிய உரை, படங்கள் அல்லது செயற்கை தரவை உருவாக்க பயிற்சி பெற்ற AI மாதிரிகள்.",
        "An agent learning optimal sequences of actions in an environment to maximize cumulative rewards.": "திரண்ட வெகுமதிகளை அதிகரிக்க ஒரு சூழலில் உகந்த செயல்களின் வரிசைகளைக் கற்கும் ஒரு முகவர்.",
        "Training machine learning algorithms using labeled datasets with explicit inputs and targets.": "வெளிப்படையான உள்ளீடுகள் மற்றும் இலக்குகளுடன் லேபிளிடப்பட்ட தரவுத்தொகுப்புகளைப் பயன்படுத்தி இயந்திர கற்றல் வழிமுறைகளைப் பயிற்றுவித்தல்.",
        "Discovering hidden structures, groupings, or dimensions in unlabeled datasets.": "லேபிளிடப்படாத தரவுத்தொகுப்புகளில் மறைக்கப்பட்ட கட்டமைப்புகள், குழுக்கள் அல்லது பரிமாணங்களைக் கண்டறிதல்.",
        "Interconnected layers of processing nodes mimicking biological brain structures to process parameters.": "அளபுருக்களை செயலாக்க உயிரியல் மூளை அமைப்புகளைப் பிரதிபलिக்கும் செயலாக்க முனைகளின் ஒன்றோடொன்று இணைக்கப்பட்ட அடுக்குகள்.",
        "Logical decision engines emulating human logical expertise using a static set of rules.": "நிலையான விதிகளைப் பயன்படுத்தி மனித தர்க்கரீதியான நிபுணத்துவத்தைப் பிரதிபலிக்கும் தர்க்கரீதியான முடிவு இயந்திரங்கள்.",
        "Sets the foreground text color of page elements.": "பக்க உறுப்புகளின் முன் உரை நிறத்தை அமைக்கிறது.",
        "Configures the background color of an element's box model area.": "ஒரு உறுப்பின் பெட்டி மாதிரி பகுதியின் பின்னணி நிறத்தை உள்ளமைக்கிறது.",
        "Controls the sizing scale of typography fonts.": "அச்சுக்கலை எழுத்துருக்களின் அளவு அளவைக் கட்டுப்படுத்துகிறது.",
        "Defines outer spacing boundaries around elements, outside of borders.": "எல்லைகளுக்கு வெளியே, உறுப்புகளைச் சுற்றி வெளிப்புற இடைவெளி எல்லைகளை வரையறுக்கிறது.",
        "Defines inner spacing margins between elements content and their borders.": "உறுப்புகளின் உள்ளடக்கம் மற்றும் அவற்றின் எல்லைகளுக்கு இடையே உள்ள உள் இடைவெளி வரம்புகளை வரையறுக்கிறது.",
        "Sets borders thickness, line styles, and color boundaries around boxes.": "பெட்டிகளைச் சுற்றி எல்லைகளின் தடிமன், வரி பாணிகள் மற்றும் வண்ண எல்லைகளை அமைக்கிறது.",
        "Sets the horizontal layout dimension size of elements.": "உறுப்புகளின் கிடைமட்ட தளவமைப்பு பரிமாண அளவை அமைக்கிறது.",
        "Sets the vertical layout dimension size of elements.": "உறுப்புகளின் செங்குத்து தளவமைப்பு பரிமாண அளவை அமைக்கிறது.",
        "Configures horizontal alignment (left, right, center, justify) of inline text contents.": "உள் உரை உள்ளடக்கங்களின் கிடைமட்ட சீரமைப்பை (இடது, வலது, மையம், சீரமை) உள்ளமைக்கிறது.",
        "Sets the layout display type (block, inline, flex, grid, none) of boxes.": "பெட்டிகளின் தளவமைப்பு காட்சி வகையை (block, inline, flex, grid, none) அமைக்கிறது.",
        "Alternative mechanism for AI development.": "AI மேம்பாட்டிற்கான மாற்று வழிமுறை.",
        "Standard configuration module in AI application.": "AI பயன்பாட்டில் நிலையான உள்ளமைவு தொகுதி.",
        "Process optimization handler in AI framework.": "AI கட்டமைப்பில் செயல்முறை தேர்வுமுறை ஹேண்ட்லர்."
      },
      hi: {
        "Algorithms that enable computers to learn from and make predictions based on data.": "एल्गोरिदम जो कंप्यूटर को डेटा से सीखने और भविष्यवाणी करने में सक्षम बनाते हैं।",
        "Natural Language Processing": "प्राकृतिक भाषा प्रसंस्करण",
        "Systems that understand, interpret, and process human text and spoken language.": "सिस्टम जो मानव पाठ और बोली जाने वाली भाषा को समझते, व्याख्या करते और संसाधित करते हैं।",
        "Technology designed to extract information and understand digital images and videos.": "डिजिटल छवियों और वीडियो से जानकारी निकालने और समझने के लिए डिज़ाइन की गई तकनीक।",
        "Neural networks with multiple hidden layers that extract complex features from raw inputs.": "कच्चे इनपुट से जटिल विशेषताओं को निकालने वाले कई छिपे हुए परतों वाले न्यूरल नेटवर्क।",
        "AI models trained to create new text, images, or synthetic data matching training distributions.": "प्रशिक्षण वितरण से मेल खाने वाले नए पाठ, चित्र या सिंथेटिक डेटा बनाने के लिए प्रशिक्षित एआई मॉडल।",
        "An agent learning optimal sequences of actions in an environment to maximize cumulative rewards.": "संचयी पुरस्कारों को अधिकतम करने के लिए वातावरण में कार्रवाई के इष्टतम अनुक्रम सीखने वाला एजेंट।",
        "Training machine learning algorithms using labeled datasets with explicit inputs and targets.": "स्पष्ट इनपुट और लक्ष्यों के साथ लेबल किए गए डेटासेट का उपयोग करके मशीन लर्निंग एल्गोरिदम को प्रशिक्षित करना।",
        "Discovering hidden structures, groupings, or dimensions in unlabeled datasets.": "लेबल रहित डेटासेट में छिपी हुई संरचनाओं, समूहों या आयामों की खोज करना।",
        "Interconnected layers of processing nodes mimicking biological brain structures to process parameters.": "मापदंडों को संसाधित करने के लिए जैविक मस्तिष्क संरचनाओं की नकल करने वाले प्रसंस्करण नोड्स की इंटरकनेक्टेड परतें।",
        "Logical decision engines emulating human logical expertise using a static set of rules.": "नियमों के एक स्थिर सेट का उपयोग करके मानव तार्किक विशेषज्ञता का अनुकरण करने वाले तार्किक निर्णय इंजन।",
        "Sets the foreground text color of page elements.": "पेज तत्वों के अग्रभूमि पाठ का रंग सेट करता है।",
        "Configures the background color of an element's box model area.": "किसी तत्व के बॉक्स मॉडल क्षेत्र के पृष्ठभूमि रंग को कॉन्फ़िगर करता है।",
        "Controls the sizing scale of typography fonts.": "टाइपोोग्राफी फ़ॉन्ट के आकार के पैमाने को नियंत्रित करता है।",
        "Defines outer spacing boundaries around elements, outside of borders.": "तत्वों के चारों ओर बाहरी रिक्ति सीमाओं को परिभाषित करता है, सीमाओं के बाहर।",
        "Defines inner spacing margins between elements content and their borders.": "तत्वों की सामग्री और उनकी सीमाओं के बीच आंतरिक रिक्ति मार्जिन को परिभाषित करता है।",
        "Sets borders thickness, line styles, and color boundaries around boxes.": "बक्से के चारों ओर सीमाओं की मोटाई, रेखा शैलियों और रंग सीमाओं को सेट करता है।",
        "Sets the horizontal layout dimension size of elements.": "तत्वों के क्षैतिज लेआउट आयाम आकार को सेट करता है।",
        "Sets the vertical layout dimension size of elements.": "तत्वों के लंबवत लेआउट आयाम आकार को सेट करता है।",
        "Configures horizontal alignment (left, right, center, justify) of inline text contents.": "इनलाइन पाठ सामग्री के क्षैतिज संरेखण (बाएं, दाएं, केंद्र, न्यायसंगत) को कॉन्फ़िगर करता है।",
        "Sets the layout display type (block, inline, flex, grid, none) of boxes.": "बक्से के लेआउट डिस्प्ले प्रकार (ब्लॉक, इनलाइन, फ्लेक्स, ग्रिड, कोई नहीं) को सेट करता है।",
        "Alternative mechanism for AI development.": "एआई विकास के लिए वैकल्पिक तंत्र।",
        "Standard configuration module in AI application.": "एआई अनुप्रयोग में मानक कॉन्फ़िगरेशन मॉड्यूल।",
        "Process optimization handler in AI framework.": "एआई ढांचे में प्रक्रिया अनुकूलन हैंडलर।"
      }
    };

    return translations[lang]?.[text] || text;
  }

  const categoryTranslations = {
    ta: { "AI": "செயற்கை நுண்ணறிவு", "HTML": "HTML", "CSS": "CSS", "JavaScript": "JavaScript", "Java": "Java", "Python": "Python", "C": "C Programming", "C++": "C++", "DBMS": "DBMS", "SQL": "SQL", "MongoDB": "MongoDB", "NodeJS": "Node.js", "React": "React", "DSA": "Data Structures", "OS": "Operating Systems", "CN": "Computer Networks", "SE": "Software Engineering" },
    hi: { "AI": "कृत्रिम बुद्धिमत्ता", "HTML": "HTML", "CSS": "CSS", "JavaScript": "जावास्क्रिप्ट", "Java": "जावा", "Python": "पायथन", "C": "सी प्रोग्रामिंग", "C++": "सी++", "DBMS": "डीबीएमएस", "SQL": "एसक्यूएल", "MongoDB": "मोंगोडीबी", "NodeJS": "नोड जेएस", "React": "रिएक्ट", "DSA": "डेटा संरचनाएं", "OS": "ऑपरेटिंग सिस्टम", "CN": "कंप्यूटर नेटवर्क", "SE": "सॉफ्टवेयर इंजीनियरिंग" }
  };

  const difficultyTranslations = {
    ta: { "easy": "எளிதானது", "medium": "நடுத்தரமானது", "hard": "கடினமானது", "EASY": "எளிதானது", "MEDIUM": "நடுத்தரமானது", "HARD": "கடினமானது" },
    hi: { "easy": "आसान", "medium": "मध्यम", "hard": "कठिन", "EASY": "आसान", "MEDIUM": "मध्यम", "HARD": "कठिन" }
  };

  const badgeTranslations = {
    en: {
      "first_step": { name: "First Step", desc: "Complete 1 quiz" },
      "quiz_streak_5": { name: "5 Quiz Streak", desc: "5-day streak" },
      "perfect_10": { name: "10 Perfect Quizzes", desc: "10 perfect scores" },
      "completed_25": { name: "25 Quizzes Completed", desc: "25 quizzes done" },
      "xp_1000": { name: "Earn 1000 XP", desc: "Earn 1000 XP" },
      "perfectionist": { name: "Perfectionist", desc: "Perfect score" },
      "quiz_master": { name: "Quiz Master", desc: "10 quizzes done" },
      "legendary_brain": { name: "Legendary Brain", desc: "Perfect on Hard" },
      "dedicated_scholar": { name: "Scholar", desc: "3+ Day streak" },
      "ai_guru": { name: "AI Guru", desc: "Perfect in AI" },
      "speed_demon": { name: "Speed Demon", desc: "Speed run complete" },
      "survivor": { name: "Survivor", desc: "20+ in Survival" },
      "marathon_runner": { name: "Marathoner", desc: "Marathon complete" },
      "half_century": { name: "Half Century", desc: "50 quizzes done" },
      "century_club": { name: "Century Club", desc: "100 quizzes done" },
      "streak_king": { name: "Streak King", desc: "7+ Day streak" },
      "unstoppable": { name: "Unstoppable", desc: "14+ Day streak" },
      "perfectionist_elite": { name: "Elite Perfect", desc: "5 perfect quizzes" },
      "no_lifeline": { name: "No Lifeline", desc: "Perfect on Hard with no aid" },
      "night_owl": { name: "Night Owl", desc: "Active 12AM-5AM" },
      "early_bird": { name: "Early Bird", desc: "Active 5AM-7AM" },
      "jack_of_all_trades": { name: "Jack of Trades", desc: "Try all 10 topics" },
      "category_master": { name: "Cat Master", desc: "Perfect in 5 topics" }
    },
    ta: {
      "first_step": { name: "முதல் படி", desc: "1 வினாடி வினாவை முடிக்கவும்" },
      "quiz_streak_5": { name: "5 வினாடி வினா தொடர்", desc: "5 நாட்கள் தொடர்" },
      "perfect_10": { name: "10 சரியான வினாடி வினாக்கள்", desc: "10 சரியான மதிப்பெண்கள்" },
      "completed_25": { name: "25 வினாடி வினாக்கள் முடிந்தது", desc: "25 வினாடி வினாக்கள் முடிந்தது" },
      "xp_1000": { name: "1000 எக்ஸ்பி பெறுங்கள்", desc: "1000 எக்ஸ்பி பெறுங்கள்" },
      "perfectionist": { name: "துல்லியமானவர்", desc: "முழு மதிப்பெண்" },
      "quiz_master": { name: "வினாடி வினா மாஸ்டர்", desc: "10 வினாடி வினாக்கள் முடிந்தது" },
      "legendary_brain": { name: "புகழ்பெற்ற மூளை", desc: "கடினமான நிலையில் முழு மதிப்பெண்" },
      "dedicated_scholar": { name: "அறிஞர்", desc: "3+ நாட்கள் தொடர்" },
      "ai_guru": { name: "AI குரு", desc: "AI பிரிவில் முழு மதிப்பெண்" },
      "speed_demon": { name: "வேக அரக்கன்", desc: "வேக ஓட்டம் முடிந்தது" },
      "survivor": { name: "உயிர் பிழைத்தவர்", desc: "சர்வைவலில் 20+ மதிப்பெண்" },
      "marathon_runner": { name: "மராத்தான் வீரர்", desc: "மராத்தான் முடிந்தது" },
      "half_century": { name: "அரை சதம்", desc: "50 வினாடி வினாக்கள் முடிந்தது" },
      "century_club": { name: "சதக் கிளப்", desc: "100 வினாடி வினாக்கள் முடிந்தது" },
      "streak_king": { name: "தொடர் மன்னன்", desc: "7+ நாட்கள் தொடர்" },
      "unstoppable": { name: "தடுக்க முடியாதவர்", desc: "14+ நாட்கள் தொடர்" },
      "perfectionist_elite": { name: "எலைட் பெர்பெக்ட்", desc: "5 சரியான வினாடி வினாக்கள்" },
      "no_lifeline": { name: "லைஃப்லைன் இல்லை", desc: "உதவி இல்லாமல் கடினமான நிலையில் முழு மதிப்பெண்" },
      "night_owl": { name: "இரவு ஆந்தை", desc: "இரவு 12 - அதிகாலை 5 மணி வரை" },
      "early_bird": { name: "அதிகாலை பறவை", desc: "அதிகாலை 5 - 7 மணி வரை" },
      "jack_of_all_trades": { name: "பல்முக திறமையாளர்", desc: "10 பிரிவுகளையும் முயற்சிக்கவும்" },
      "category_master": { name: "பிரிவு மாஸ்டர்", desc: "5 பிரிவுகளில் முழு மதிப்பெண்" }
    },
    hi: {
      "first_step": { name: "पहला कदम", desc: "1 प्रश्नोत्तरी पूरी करें" },
      "quiz_streak_5": { name: "5 प्रश्नोत्तरी सिलसिला", desc: "5-दिवसीय सिलसिला" },
      "perfect_10": { name: "10 उत्तम प्रश्नोत्तरी", desc: "10 पूर्ण स्कोर" },
      "completed_25": { name: "25 प्रश्नोत्तरी पूरी", desc: "25 प्रश्नोत्तरी पूर्ण" },
      "xp_1000": { name: "1000 एक्सपी कमाएं", desc: "1000 एक्सपी प्राप्त करें" },
      "perfectionist": { name: "उत्कृष्टतावादी", desc: "पूर्ण स्कोर" },
      "quiz_master": { name: "क्विज मास्टर", desc: "10 प्रश्नोत्तरी पूर्ण" },
      "legendary_brain": { name: "महान मस्तिष्क", desc: "कठिन स्तर पर पूर्ण स्कोर" },
      "dedicated_scholar": { name: "विद्वान", desc: "3+ दिन का सिलसिला" },
      "ai_guru": { name: "एआई गुरु", desc: "एआई में पूर्ण स्कोर" },
      "speed_demon": { name: "गति का सौदागर", desc: "स्पीड रन पूरा हुआ" },
      "survivor": { name: "सर्वाइवर", desc: "सर्वाइवल में 20+ स्कोर" },
      "marathon_runner": { name: "मैराथन धावक", desc: "मैराथन पूर्ण" },
      "half_century": { name: "अर्धशतक", desc: "50 प्रश्नोत्तरी पूरी" },
      "century_club": { name: "शतक क्लब", desc: "100 प्रश्नोत्तरी पूरी" },
      "streak_king": { name: "सिलसिला राजा", desc: "7+ दिन का सिलसिला" },
      "unstoppable": { name: "अजेय", desc: "14+ दिन का सिलसिला" },
      "perfectionist_elite": { name: "अभिजात वर्ग उत्तम", desc: "5 पूर्ण प्रश्नोत्तरी" },
      "no_lifeline": { name: "कोई लाइफलाइन नहीं", desc: "बिना सहायता के कठिन स्तर पर पूर्ण स्कोर" },
      "night_owl": { name: "रात का उल्लू", desc: "रात 12 - सुबह 5 बजे के बीच" },
      "early_bird": { name: "प्रातःकाल पक्षी", desc: "सुबह 5 - 7 बजे के बीच" },
      "jack_of_all_trades": { name: "हरफनमौला", desc: "सभी 10 विषयों को आजमाएं" },
      "category_master": { name: "श्रेणी मास्टर", desc: "5 श्रेणियों में पूर्ण स्कोर" }
    }
  };

  function getTranslatedCategory(cat, lang) {
    return categoryTranslations[lang]?.[cat] || cat;
  }

  function getTranslatedDifficulty(diff, lang) {
    return difficultyTranslations[lang]?.[diff.toLowerCase()] || diff;
  }

  function translateQuestion(q, lang) {
    if (!lang || lang === 'en') return q;

    const catName = getTranslatedCategory(q.category, lang);
    const diffName = getTranslatedDifficulty(q.difficulty, lang);

    // Extract concept in quotes
    const conceptMatch = q.question_text.match(/\"([^\"]+)\"/);
    const concept = conceptMatch ? conceptMatch[1] : '';

    // Look up concept name translation
    const conceptNames = {
      ta: {
        "Machine Learning": "இயந்திர கற்றல் (Machine Learning)",
        "Natural Language Processing": "இயற்கை மொழி செயலாக்கம் (NLP)",
        "Computer Vision": "கணினி பார்வை (Computer Vision)",
        "Deep Learning": "ஆழ்ந்த கற்றல் (Deep Learning)",
        "Generative AI": "உருவாக்கும் ஏஐ (Generative AI)",
        "Supervised Learning": "கண்காணிக்கப்படும் கற்றல் (Supervised Learning)",
        "Unsupervised Learning": "கண்காணிக்கப்படாத கற்றல் (Unsupervised Learning)",
        "Neural Networks": "நரம்பியல் நெட்வொர்க்குகள் (Neural Networks)",
        "Expert Systems": "நிபுணர் அமைப்புகள் (Expert Systems)",
        "K-Means Clustering": "K-Means கிளஸ்டரிங்",
        "Support Vector Machines (SVM)": "சப்போர்ட் வெக்டர் மெஷின்கள் (SVM)",
        "Decision Trees": "முடிவு மரங்கள் (Decision Trees)",
        "Random Forest": "ரேண்டம் ஃபாரஸ்ட் (Random Forest)",
        "Convolutional Neural Networks (CNN)": "சிஎன்என் (CNN)",
        "Recurrent Neural Networks (RNN)": "ஆர்என்என் (RNN)",
        "Q-Learning": "க்யூ-கற்றல் (Q-Learning)",
        "Gradient Boosting": "கிரேடியண்ட் பூஸ்டிங்",
        "Principal Component Analysis (PCA)": "பிசிஏ (PCA)",
        "Naive Bayes": "நேவ் பேய்ஸ் (Naive Bayes)"
      },
      hi: {
        "Machine Learning": "मशीन लर्निंग (Machine Learning)",
        "Natural Language Processing": "प्राकृतिक भाषा प्रसंस्करण (NLP)",
        "Computer Vision": "कंप्यूटर विज़न (Computer Vision)",
        "Deep Learning": "डीप लर्निंग (Deep Learning)",
        "Generative AI": "जेनरेटिव एआई (Generative AI)",
        "Supervised Learning": "सुपरवाइज्ड लर्निंग",
        "Unsupervised Learning": "अनसुपरवाइज्ड लर्निंग",
        "Neural Networks": "न्यूरल नेटवर्क (Neural Networks)",
        "Expert Systems": "विशेषज्ञ प्रणालियाँ (Expert Systems)",
        "K-Means Clustering": "के-मीन्स क्लस्टरिंग",
        "Support Vector Machines (SVM)": "सपोर्ट वेक्टर मशीनें (SVM)",
        "Decision Trees": "निर्णय पेड़ (Decision Trees)",
        "Random Forest": "रैंडम फ़ॉरेस्ट",
        "Convolutional Neural Networks (CNN)": "सीएनएन (CNN)",
        "Recurrent Neural Networks (RNN)": "आरएनएन (RNN)",
        "Q-Learning": "क्यू-लर्निंग (Q-Learning)",
        "Gradient Boosting": "ग्रेडिएंट बूस्टिंग",
        "Principal Component Analysis (PCA)": "पीसीए (PCA)",
        "Naive Bayes": "नाइव बेयस (Naive Bayes)"
      }
    };

    const conceptTrans = conceptNames[lang]?.[concept] || concept;
    let qText = q.question_text;
    if (q.question_text.includes('primary role or definition')) {
      qText = lang === 'ta'
        ? `${catName} மேம்பாட்டில், "${conceptTrans}" இன் முதன்மை பங்கு அல்லது வரையறை என்ன?`
        : `${catName} विकास में, "${conceptTrans}" की प्राथमिक भूमिका या परिभाषा क्या है?`;
    } else if (q.question_text.includes('best describes the functionality')) {
      qText = lang === 'ta'
        ? `பின்வருவனவற்றில் எது ${catName} இல் "${conceptTrans}" இன் செயல்பாடு அல்லது வரையறையைச் சிறந்த முறையில் விளக்குகிறது?`
        : `निम्नलिखित में से कौन सा ${catName} में "${conceptTrans}" की कार्यक्षमता या परिभाषा का सबसे अच्छा वर्णन करता है?`;
    } else if (q.question_text.includes('typically defined or utilized')) {
      qText = lang === 'ta'
        ? `${catName} இன் சூழலில் "${conceptTrans}" என்ற கருத்து பொதுவாக எவ்வாறு வரையறுக்கப்படுகிறது அல்லது பயன்படுத்தப்படுகிறது?`
        : `${catName} के संदर्भ में अवधारणा "${conceptTrans}" को आमतौर पर कैसे परिभाषित या उपयोग किया जाता है?`;
    } else if (q.question_text.includes('statement accurately represents')) {
      qText = lang === 'ta'
        ? `${catName} தொழில்நுட்பத்தின் வரம்பிற்குள், எந்தக் கூற்று "${conceptTrans}" ஐத் துல்லியமாகக் குறிக்கிறது?`
        : `${catName} प्रौद्योगिकी के दायरे में, कौन सा कथन "${conceptTrans}" का सटीक प्रतिनिधित्व करता है?`;
    } else if (q.question_text.includes('core purpose or behavioral mechanism')) {
      qText = lang === 'ta'
        ? `${catName} இல் "${conceptTrans}" இன் முக்கிய நோக்கம் அல்லது செயல்பாட்டு வழிமுறை என்ன?`
        : `${catName} के भीतर "${conceptTrans}" का मूल उद्देश्य या व्यावहारिक तंत्र क्या है?`;
    }

    const qIdMatch = q.question_text.match(/\(Q-ID: [^\)]+\)/) || q.question_text.match(/\(Dynamic Q-ID: [^\)]+\)/);
    if (qIdMatch) {
      qText += ' ' + qIdMatch[0];
    }

    const optA = translateQuestionOption(q.option_a, lang);
    const optB = translateQuestionOption(q.option_b, lang);
    const optC = translateQuestionOption(q.option_c, lang);
    const optD = translateQuestionOption(q.option_d, lang);

    const explanationText = lang === 'ta'
      ? `"${conceptTrans}" என்பது ${catName} இல் குறியீட்டை உருவாக்க, நினைவகத்தை நிர்வகிக்க அல்லது செயல்பாடுகளை இயக்கப் பயன்படுத்தப்படும் ஒரு முக்கிய அங்கமாகும்.`
      : `"${conceptTrans}" ${catName} में कोड को संरचित करने, मेमोरी को प्रबंधित करने या संचालन को निष्पादित करने के लिए उपयोग किया जाने वाला एक आवश्यक घटक या तरीका है।`;

    const hintText = lang === 'ta'
      ? `அடிப்படை ${catName} பண்புகள் மற்றும் தரநிலைகளை அடிப்படையாகக் கொண்டது.`
      : `यह मुख्य ${catName} गुणों और मानकों पर निर्भर करता है।`;

    return {
      ...q,
      category: catName,
      question_text: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      explanation: explanationText,
      hint: hintText
    };
  }

  // Expose translation functions globally on window
  window.translateQuestion = translateQuestion;
  window.translateQuestionOption = translateQuestionOption;
  window.translateUI = translateUI;
  window.getTranslatedCategory = getTranslatedCategory;
  window.getTranslatedDifficulty = getTranslatedDifficulty;

  document.getElementById('select-language-toggle').addEventListener('change', (e) => {
    translateUI(e.target.value);
  });

  // 2. DASHBOARD SUB-NAVIGATION WORKSPACE TABS TOGGLING
  const dashTabs = ['arena', 'profile', 'shop', 'predictor'];
  dashTabs.forEach(t => {
    const tabEl = document.getElementById(`tab-dash-${t}`);
    if (tabEl) {
      tabEl.addEventListener('click', () => {
        AudioSynth.playClick();
        dashTabs.forEach(tb => {
          document.getElementById(`tab-dash-${tb}`).classList.remove('active');
          document.getElementById(`panel-dash-${tb}`).classList.add('hidden');
        });
        tabEl.classList.add('active');
        document.getElementById(`panel-dash-${t}`).classList.remove('hidden');

        // Lazy load custom panels metrics
        if (t === 'profile') loadProfileCustomizer();
        if (t === 'shop') loadShopItemsCatalog();
        if (t === 'predictor') loadSkillPredictorMetrics();
      });
    }
  });

  // 3. VOICE-BASED TEXT-TO-SPEECH (TTS) SYSTEM CONTROLLER
  const VoiceQuizController = {
    utterance: null,
    synth: window.speechSynthesis,
    isPaused: false,
    statusIndicator: document.getElementById('voice-status-indicator'),

    init() {
      this.synth.cancel();
      this.isPaused = false;
      if (this.statusIndicator) this.statusIndicator.className = 'voice-status-glow';
      document.getElementById('btn-voice-pause').classList.add('hidden');
      document.getElementById('btn-voice-stop').classList.add('hidden');
    },

    speakText(text, langCode = 'en') {
      this.init();
      if (!text) return;

      this.utterance = new SpeechSynthesisUtterance(text);

      // Choose appropriate voice patterns matching localized Tamil/Hindi selections
      if (this.synth.getVoices().length > 0) {
        const voices = this.synth.getVoices();
        let selectedVoice = voices.find(v => v.lang.startsWith(langCode));
        if (!selectedVoice && langCode === 'ta') selectedVoice = voices.find(v => v.lang.includes('IN'));
        if (!selectedVoice && langCode === 'hi') selectedVoice = voices.find(v => v.lang.includes('IN'));
        if (selectedVoice) {
          this.utterance.voice = selectedVoice;
        }
      }

      this.utterance.onstart = () => {
        if (this.statusIndicator) this.statusIndicator.classList.add('active');
        document.getElementById('btn-voice-pause').classList.remove('hidden');
        document.getElementById('btn-voice-stop').classList.remove('hidden');
      };

      this.utterance.onend = () => {
        if (this.statusIndicator) this.statusIndicator.classList.remove('active');
        document.getElementById('btn-voice-pause').classList.add('hidden');
        document.getElementById('btn-voice-stop').classList.add('hidden');
      };

      this.synth.speak(this.utterance);
    },

    pause() {
      if (this.synth.speaking && !this.isPaused) {
        this.synth.pause();
        this.isPaused = true;
        document.getElementById('btn-voice-pause').innerText = '▶️ Resume';
      } else if (this.isPaused) {
        this.synth.resume();
        this.isPaused = false;
        document.getElementById('btn-voice-pause').innerText = '⏸️ Pause';
      }
    },

    stop() {
      this.synth.cancel();
      this.init();
    }
  };

  document.getElementById('btn-voice-speak').addEventListener('click', () => {
    AudioSynth.playClick();
    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    if (!q) return;
    const ttsText = `Question: ${q.question_text}. Option A: ${q.option_a}. Option B: ${q.option_b}. Option C: ${q.option_c}. Option D: ${q.option_d}.`;
    VoiceQuizController.speakText(ttsText, window.currentLang);
  });

  document.getElementById('btn-voice-pause').addEventListener('click', () => {
    AudioSynth.playClick();
    VoiceQuizController.pause();
  });

  document.getElementById('btn-voice-stop').addEventListener('click', () => {
    AudioSynth.playClick();
    VoiceQuizController.stop();
  });

  // 4. MOCK GOOGLE AUTHENTICATION SYSTEM BINDINGS
  document.getElementById('btn-google-auth').addEventListener('click', async () => {
    AudioSynth.playClick();
    try {
      // Generate secure simulated credentials
      const googleMockUser = {
        username: 'google_scholar',
        password: 'GoogleScholarSecureMockPasswordPassword123'
      };

      // Register or login background
      try {
        await NetworkClient.request('/auth/register', 'POST', { username: googleMockUser.username, password: googleMockUser.password, email: 'scholar@gmail.com' });
      } catch (e) { } // bypass if already registered

      const loginData = await NetworkClient.request('/auth/login', 'POST', googleMockUser);
      AppState.token = loginData.token;
      localStorage.setItem('quiz_token', loginData.token);

      // Migrate guest attempts if present
      const guestHistory = JSON.parse(localStorage.getItem('guest_history') || '[]');
      if (guestHistory.length > 0) {
        try {
          await NetworkClient.request('/quiz/sync', 'POST', { attempts: guestHistory });
          localStorage.removeItem('guest_history');
          localStorage.removeItem('guest_progress');
          localStorage.removeItem('guest_achievements');
        } catch (e) {
          console.error('Failed to migrate guest history:', e);
        }
      }

      ViewController.switchView('dashboard');
      ViewRefresher.refreshDashboard();
      alert('Logged in successfully via Google Sign In simulation!');
    } catch (err) {
      alert('Mock Google Login Failed: ' + err.message);
    }
  });

  // 5. SECURE FORGOT PASSWORD VERIFICATION OTP FLOWS
  document.getElementById('btn-auth-forgot').addEventListener('click', () => {
    AudioSynth.playClick();
    document.getElementById('modal-password-reset').classList.remove('hidden');
    document.getElementById('form-reset-send-otp').classList.remove('hidden');
    document.getElementById('form-reset-password').classList.add('hidden');
  });

  document.querySelectorAll('.btn-close-reset').forEach(b => {
    b.addEventListener('click', () => {
      AudioSynth.playClick();
      document.getElementById('modal-password-reset').classList.add('hidden');
    });
  });

  document.getElementById('form-reset-send-otp').addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();
    const email = document.getElementById('reset-email').value;
    try {
      const res = await NetworkClient.request('/auth/otp/send', 'POST', { email });
      alert(res.message + ' (Use code: 123456 offline)');
      document.getElementById('form-reset-send-otp').classList.add('hidden');
      document.getElementById('form-reset-password').classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('form-reset-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();
    const email = document.getElementById('reset-email').value;
    const code = document.getElementById('reset-code').value;
    const newPassword = document.getElementById('reset-new-password').value;

    try {
      await NetworkClient.request('/auth/otp/verify', 'POST', { email, code });
      const res = await NetworkClient.request('/auth/reset-password', 'POST', { email, newPassword });
      alert(res.message);
      document.getElementById('modal-password-reset').classList.add('hidden');
    } catch (err) {
      alert(err.message);
    }
  });

  // 6. QUESTION REPORT FLAG DIALOG MODAL BINDINGS
  document.getElementById('btn-quiz-report').addEventListener('click', () => {
    AudioSynth.playClick();
    const q = AppState.quiz.questions[AppState.quiz.currentIndex];
    if (!q) return;
    document.getElementById('report-q-id').value = q.id;
    document.getElementById('modal-report-question').classList.remove('hidden');
  });

  document.getElementById('btn-close-report-modal').addEventListener('click', () => {
    AudioSynth.playClick();
    document.getElementById('modal-report-question').classList.add('hidden');
  });

  document.getElementById('form-report-question').addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();
    const qId = document.getElementById('report-q-id').value;
    const reason = document.querySelector('input[name="report-reason"]:checked').value;
    const comments = document.getElementById('report-comments').value;

    try {
      const res = await NetworkClient.request('/feedback/report', 'POST', { questionId: qId, reason, comments });
      alert(res.message);
      document.getElementById('modal-report-question').classList.add('hidden');
      document.getElementById('report-comments').value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  // 7. RATING FEEDBACK WIDGET STAR SELECTION
  let selectedRating = 0;
  document.querySelectorAll('#feedback-star-row .star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AudioSynth.playClick();
      selectedRating = parseInt(btn.getAttribute('data-value'));
      document.querySelectorAll('#feedback-star-row .star-btn').forEach(s => {
        const val = parseInt(s.getAttribute('data-value'));
        s.innerText = val <= selectedRating ? '★' : '☆';
      });
    });
  });

  document.getElementById('btn-submit-feedback').addEventListener('click', async () => {
    AudioSynth.playClick();
    if (selectedRating === 0) {
      alert('Please select a star rating first!');
      return;
    }
    const comment = document.getElementById('feedback-comment').value;
    try {
      const res = await NetworkClient.request('/feedback', 'POST', { rating: selectedRating, comment });
      document.getElementById('feedback-success-msg').classList.remove('hidden');
      setTimeout(() => {
        document.getElementById('feedback-success-msg').classList.add('hidden');
        document.getElementById('feedback-comment').value = '';
        selectedRating = 0;
        document.querySelectorAll('#feedback-star-row .star-btn').forEach(s => { s.innerText = '☆'; });
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  });

  // 8. COSMETIC SHOP SHELVES RENDERING CATALOG
  async function loadShopItemsCatalog() {
    try {
      const items = await NetworkClient.request('/shop/items');
      const history = await NetworkClient.request('/shop/history');
      const ownedIds = history.map(h => h.item_id);

      const grid = document.getElementById('reward-shop-grid');
      grid.innerHTML = '';

      // Themes elements
      items.forEach(item => {
        const isOwned = ownedIds.includes(item.id) || (item.id === 'theme_dark'); // Dark default owned
        const card = document.createElement('div');
        card.className = `shop-card ${isOwned ? 'owned' : ''}`;

        let visualSymbol = '🪙';
        if (item.type === 'theme') visualSymbol = '🎨';
        if (item.type === 'avatar_frame') visualSymbol = '🖼️';
        if (item.type === 'avatar') visualSymbol = item.value;

        card.innerHTML = `
        <div class="shop-item-visual">${visualSymbol}</div>
        <div class="shop-item-name">${item.name}</div>
        <p style="font-size:11px; color:var(--text-muted); margin:0;">${item.description}</p>
        <div class="shop-item-cost">🪙 ${item.cost} Coins</div>
        <button class="action-btn btn-block ${isOwned ? 'btn-secondary' : 'btn-gradient'} buy-item-btn">${isOwned ? 'Equip / Owned' : 'Unlock Item'}</button>
      `;

        card.querySelector('.buy-item-btn').onclick = async () => {
          AudioSynth.playClick();
          if (isOwned) {
            // Equip cosmetic
            equipItemCosmetics(item);
          } else {
            // Unlock item
            if (!confirm(`Unlock ${item.name} for ${item.cost} coins?`)) return;
            try {
              await NetworkClient.request('/shop/purchase', 'POST', { itemId: item.id, itemName: item.name, itemType: item.type, cost: item.cost });
              alert(`${item.name} unlocked successfully!`);
              loadShopItemsCatalog();
              ViewRefresher.refreshDashboard();
            } catch (err) {
              alert(err.message);
            }
          }
        };
        grid.appendChild(card);
      });

      // Populate purchases log table
      const tbody = document.getElementById('shop-purchases-tbody');
      tbody.innerHTML = '';
      if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No purchases logged.</td></tr>`;
      } else {
        history.forEach(h => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
          <td><strong>${h.item_name}</strong></td>
          <td><span class="badge">${h.item_type.toUpperCase()}</span></td>
          <td>🪙 ${h.cost}</td>
          <td>${new Date(h.purchased_at).toLocaleDateString()}</td>
        `;
          tbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Failed to load shop:', err);
    }
  }

  async function equipItemCosmetics(item) {
    try {
      const payload = {};
      if (item.type === 'theme') payload.theme = item.value;
      if (item.type === 'avatar') payload.avatar = item.value;
      if (item.type === 'avatar_frame') payload.avatar_frame = item.value;

      await NetworkClient.request('/profile', 'PUT', payload);
      alert(`${item.name} equipped successfully!`);
      ViewRefresher.refreshDashboard();
    } catch (err) {
      console.error(err);
    }
  }

  // 9. PROFILE CUSTOMIZER CONTROLLER
  async function loadProfileCustomizer() {
    try {
      const profile = await NetworkClient.request('/auth/me');
      const history = await NetworkClient.request('/shop/history');
      const ownedThemeIds = history.filter(h => h.item_type === 'theme').map(h => h.item_id);

      // Seed fields
      document.getElementById('profile-username').value = profile.user.username;
      document.getElementById('profile-bio-input').value = profile.user.bio || '';
      document.getElementById('profile-fav-cat').value = profile.user.fav_category || 'AI';

      // Enable themes options if purchased
      const themeSelect = document.getElementById('profile-theme');
      themeSelect.value = profile.progress.selected_theme || 'dark';

      Array.from(themeSelect.options).forEach(opt => {
        if (opt.value === 'dark' || opt.value === 'light') {
          opt.disabled = false;
        } else {
          const owned = ownedThemeIds.includes(opt.value);
          opt.disabled = !owned;
          if (owned) opt.innerText = opt.innerText.replace(' (Shop Item)', '');
        }
      });

      // Populate avatars grid chooser
      const avatarGrid = document.getElementById('avatar-selector-grid');
      avatarGrid.innerHTML = '';
      const emojis = ['👤', '🤖', '🧠', '🥷', '🧙‍♂️', '🦉', '🦊', '🦁', '🐼', '🚀', '💻', '🎓'];

      emojis.forEach(emo => {
        const span = document.createElement('div');
        span.className = `avatar-select-option ${profile.progress.avatar === emo ? 'active' : ''}`;
        span.innerText = emo;
        span.onclick = () => {
          AudioSynth.playClick();
          document.querySelectorAll('.avatar-select-option').forEach(s => s.classList.remove('active'));
          span.classList.add('active');
          AppState.quiz.selectedAvatarEmoji = emo;
        };
        avatarGrid.appendChild(span);
      });

      // Setup base64 photo uploader
      const picContainer = document.getElementById('profile-pic-container');
      const fileInput = document.getElementById('input-profile-pic');

      if (profile.user.profile_pic) {
        picContainer.innerHTML = `<img src="${profile.user.profile_pic}" alt="Custom Profile Photo"><div class="avatar-frame-overlay" id="profile-frame-overlay"></div><span class="uploader-hover-label">Change Photo</span>`;
      }

      // Add frames overlays
      const frameOverlay = document.getElementById('profile-frame-overlay');
      if (frameOverlay && profile.progress.avatar_frame) {
        frameOverlay.className = `avatar-frame-overlay avatar-frame-${profile.progress.avatar_frame}`;
      }

      picContainer.onclick = () => { fileInput.click(); };
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          picContainer.innerHTML = `<img src="${base64}" alt="Custom Photo"><div class="avatar-frame-overlay" id="profile-frame-overlay"></div><span class="uploader-hover-label">Change Photo</span>`;
          AppState.quiz.selectedBase64Photo = base64;
        };
        reader.readAsDataURL(file);
      };

      // Load claimable certificates
      const certsContainer = document.getElementById('certificates-list-container');
      certsContainer.innerHTML = '';
      const certs = await NetworkClient.request('/certificates');

      if (certs.length === 0) {
        certsContainer.innerHTML = `<div class="text-center text-muted" style="padding: 20px 0;">No claimed certificates found. Achieve >= 80% accuracy!</div>`;
      } else {
        certs.forEach(c => {
          const div = document.createElement('div');
          div.className = 'bookmark-item-card';
          div.innerHTML = `
          <div class="bookmark-details">
            <span class="badge" style="background: rgba(168,85,247,0.15); color:#c084fc;">ID: ${c.cert_id}</span>
            <div class="bookmark-question-text" style="font-weight:700;">Certificate: ${c.category} Completion</div>
            <div style="font-size:11px; color:var(--text-muted);">Accuracy: ${c.score} / ${c.total_questions} - Claimed: ${c.claimed_at}</div>
          </div>
          <button class="action-btn btn-secondary btn-sm claim-view-btn" style="border-radius: var(--radius-sm);">🎓 View</button>
        `;
          div.querySelector('.claim-view-btn').onclick = () => {
            showCertificateModalView(c);
          };
          certsContainer.appendChild(div);
        });
      }

      // Populate active device logs
      const loginHistory = await NetworkClient.request('/auth/login-history');
      const tbody = document.getElementById('login-logs-tbody');
      tbody.innerHTML = '';
      loginHistory.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td><code>${log.ip_address}</code></td>
        <td style="font-size:11px; max-width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${log.device_agent}">${log.device_agent}</td>
        <td>${new Date(log.logged_in_at).toLocaleString()}</td>
      `;
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error('Failed to load profile customization forms:', err);
    }
  }

  document.getElementById('form-profile-update').addEventListener('submit', async (e) => {
    e.preventDefault();
    AudioSynth.playClick();

    const payload = {
      username: document.getElementById('profile-username').value,
      bio: document.getElementById('profile-bio-input').value,
      fav_category: document.getElementById('profile-fav-cat').value,
      theme: document.getElementById('profile-theme').value
    };

    if (AppState.quiz.selectedAvatarEmoji) payload.avatar = AppState.quiz.selectedAvatarEmoji;
    if (AppState.quiz.selectedBase64Photo) payload.profile_pic = AppState.quiz.selectedBase64Photo;

    try {
      const res = await NetworkClient.request('/profile', 'PUT', payload);
      alert(res.message);
      ViewRefresher.refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  });

  // 10. PREMIUM HTML CERTIFICATES GENERATOR & PDF/PNG DOWNLOADS
  let activeClaimedCertificateObj = null;

  async function showCertificateModalView(certObj) {
    activeClaimedCertificateObj = certObj;

    document.getElementById('cert-user-name').innerText = certObj.user_name || 'Guest Player';
    document.getElementById('cert-category-text').innerText = certObj.category;
    document.getElementById('cert-score-text').innerText = `${certObj.score} / ${certObj.total_questions}`;
    document.getElementById('cert-date-text').innerText = certObj.claimed_at;
    document.getElementById('cert-id-text').innerText = `CERT-ID: ${certObj.cert_id}`;

    // Custom premium certificate aesthetics
    const captureNode = document.getElementById('certificate-capture-node');
    captureNode.className = 'certificate-layout-frame';
    if (certObj.category === 'AI') {
      captureNode.classList.add('style-cyberpunk');
    } else if (certObj.score === certObj.total_questions) {
      captureNode.classList.add('style-royalty');
    }

    document.getElementById('modal-certificate-preview').classList.remove('hidden');
  }

  document.getElementById('btn-cert-close').addEventListener('click', () => {
    AudioSynth.playClick();
    document.getElementById('modal-certificate-preview').classList.add('hidden');
  });

  document.getElementById('btn-cert-download-pdf').addEventListener('click', () => {
    AudioSynth.playClick();
    if (!activeClaimedCertificateObj) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [680, 420]
    });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 680, 420, 'F');

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(10);
    doc.rect(10, 10, 660, 400, 'S');

    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(2);
    doc.rect(18, 18, 644, 384, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 340, 60, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(156, 163, 175);
    doc.text('This is proudly presented to', 340, 100, { align: 'center' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(168, 85, 247);
    doc.text(activeClaimedCertificateObj.user_name || 'Guest Player', 340, 140, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(203, 213, 225);
    doc.text(`For successfully completing the AI Quiz Challenge in ${activeClaimedCertificateObj.category}`, 340, 180, { align: 'center' });
    doc.text(`with a final score of ${activeClaimedCertificateObj.score} / ${activeClaimedCertificateObj.total_questions}.`, 340, 200, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Completed on: ${activeClaimedCertificateObj.claimed_at}`, 340, 240, { align: 'center' });
    doc.text(`Verification ID: ${activeClaimedCertificateObj.cert_id}`, 340, 260, { align: 'center' });

    doc.line(100, 330, 240, 330);
    doc.text('AI Quiz Team Representative', 170, 345, { align: 'center' });

    doc.line(440, 330, 580, 330);
    doc.text('System Validator', 510, 345, { align: 'center' });

    doc.save(`Certificate-${activeClaimedCertificateObj.category}-${activeClaimedCertificateObj.cert_id}.pdf`);
  });

  document.getElementById('btn-cert-download-png').addEventListener('click', () => {
    AudioSynth.playClick();
    const captureNode = document.getElementById('certificate-capture-node');
    html2canvas(captureNode, { backgroundColor: '#0f172a' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Certificate-${AppState.quiz.category}-${activeClaimedCertificateObj ? activeClaimedCertificateObj.cert_id : 'verify'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  document.getElementById('btn-cert-share').addEventListener('click', () => {
    AudioSynth.playClick();
    if (!activeClaimedCertificateObj) return;
    const mockUrl = `http://localhost:5000/verify/certificate/${activeClaimedCertificateObj.cert_id}`;
    navigator.clipboard.writeText(mockUrl);
    alert('Certificate Verification Link copied to clipboard! Share it on social networks: \n' + mockUrl);
  });

  // Celebration screen bindings
  document.getElementById('btn-cel-claim').onclick = async () => {
    AudioSynth.playClick();
    document.getElementById('modal-quiz-celebration').classList.add('hidden');
    try {
      const cert = await NetworkClient.request('/certificates/claim', 'POST', {
        category: AppState.quiz.category,
        score: AppState.quiz.score,
        totalQuestions: AppState.quiz.questions.length
      });
      showCertificateModalView(cert);
    } catch (err) {
      alert(err.message);
    }
  };

  document.getElementById('btn-cel-share').onclick = () => {
    AudioSynth.playClick();
    const score = AppState.quiz.score;
    const total = AppState.quiz.questions.length;
    const text = `I just scored ${score}/${total} in ${AppState.quiz.category} on AI Quiz Challenge Arena! 🚀 Can you beat me?`;
    navigator.clipboard.writeText(text);
    alert('Share snippet copied to clipboard! \n"' + text + '"');
  };

  document.getElementById('btn-cel-continue').onclick = () => {
    AudioSynth.playClick();
    document.getElementById('modal-quiz-celebration').classList.add('hidden');
    ViewController.switchView('dashboard');
  };

  document.getElementById('btn-cel-home').onclick = () => {
    AudioSynth.playClick();
    document.getElementById('modal-quiz-celebration').classList.add('hidden');
    ViewController.switchView('landing');
  };

  // Hook claim certificate on summary page
  document.getElementById('btn-summary-certificate').onclick = async () => {
    AudioSynth.playClick();
    try {
      const cert = await NetworkClient.request('/certificates/claim', 'POST', {
        category: AppState.quiz.category,
        score: AppState.quiz.score,
        totalQuestions: AppState.quiz.questions.length
      });
      showCertificateModalView(cert);
    } catch (err) {
      alert(err.message);
    }
  };

  // 11. FUTURE SKILL PREDICTOR ANALYTICS & MONTHLY CHART
  async function loadSkillPredictorMetrics() {
    try {
      const profile = await NetworkClient.request('/auth/me');
      const history = await NetworkClient.request('/auth/me'); // load full attempts history
      const attempts = history.history || [];

      const strongContainer = document.getElementById('predictor-strong-skills');
      const weakContainer = document.getElementById('predictor-weak-skills');

      strongContainer.innerHTML = '';
      weakContainer.innerHTML = '';

      // Calculate score metrics per category
      const catScores = {};
      attempts.forEach(att => {
        if (!catScores[att.category]) {
          catScores[att.category] = { total: 0, score: 0, count: 0 };
        }
        catScores[att.category].total += att.total_questions;
        catScores[att.category].score += att.score;
        catScores[att.category].count += 1;
      });

      const categoryAccuracies = [];
      for (const cat in catScores) {
        const acc = Math.round((catScores[cat].score / catScores[cat].total) * 100);
        categoryAccuracies.push({ category: cat, accuracy: acc });
      }

      // Sort accuracies
      categoryAccuracies.sort((a, b) => b.accuracy - a.accuracy);

      const strong = categoryAccuracies.filter(c => c.accuracy >= 75);
      const weak = categoryAccuracies.filter(c => c.accuracy < 75);

      if (strong.length === 0) {
        strongContainer.innerHTML = '<div class="predictor-skill-tag strong">No strong categories yet. Keep studying!</div>';
      } else {
        strong.forEach(c => {
          strongContainer.innerHTML += `<div class="predictor-skill-tag strong"><span>${c.category}</span> <strong>${c.accuracy}%</strong></div>`;
        });
      }

      if (weak.length === 0 && strong.length > 0) {
        weakContainer.innerHTML = '<div class="predictor-skill-tag weak">Excellent! No weak categories detected.</div>';
      } else if (weak.length === 0) {
        weakContainer.innerHTML = '<div class="predictor-skill-tag weak">No attempts data yet. Solve some quizzes!</div>';
      } else {
        weak.forEach(c => {
          weakContainer.innerHTML += `<div class="predictor-skill-tag weak"><span>${c.category}</span> <strong>${c.accuracy}%</strong></div>`;
        });
      }

      // Suggested Professional Career Roles
      const careerDeck = document.getElementById('predictor-career-deck');
      careerDeck.innerHTML = '';

      const suggestedRoles = [
        { name: 'AI Research Engineer', category: 'AI', match: 92, icon: '🤖' },
        { name: 'Full-Stack Web Dev', category: 'JavaScript', match: 88, icon: '💻' },
        { name: 'Database Administrator', category: 'SQL', match: 84, icon: '💽' },
        { name: 'Python Systems Analyst', category: 'Python', match: 79, icon: '🐍' }
      ];

      suggestedRoles.forEach(role => {
        careerDeck.innerHTML += `
        <div class="career-role-card">
          <div class="role-badge-icon">${role.icon}</div>
          <div class="role-title">${role.name}</div>
          <p style="font-size:11px; color:var(--text-muted); margin: 4px 0;">Primary: ${role.category}</p>
          <div class="role-match-pct">${role.match}% Compatibility</div>
        </div>
      `;
      });

      // Suggested Study Pathways Nodes checklist
      const pathwayContainer = document.getElementById('predictor-learning-path');
      pathwayContainer.innerHTML = '';
      const paths = ['Introduction', 'Core Syntax', 'Query Pipelines', 'Neural Systems', 'Architecture Cert'];

      paths.forEach((step, idx) => {
        const activeIdx = Math.min(paths.length - 1, Math.floor(attempts.length / 5));
        pathwayContainer.innerHTML += `
        <div class="path-step-node ${idx <= activeIdx ? 'active' : ''}">
          ${idx < activeIdx ? '✅' : idx === activeIdx ? '⏳' : '🔒'} ${step}
        </div>
      `;
      });

      // Injected Dynamic SVG Progress Chart
      const svgContainer = document.getElementById('predictor-svg-chart-container');
      const chartScores = attempts.map(a => Math.round((a.score / a.total_questions) * 100)).slice(-6);

      if (chartScores.length < 2) {
        svgContainer.innerHTML = `<div class="text-muted" style="font-size:13px;">Complete at least 2 quizzes to plot line graph scores history!</div>`;
        return;
      }

      const svgWidth = 480;
      const svgHeight = 150;
      const points = [];
      const stepX = svgWidth / (chartScores.length - 1);

      chartScores.forEach((score, i) => {
        const x = i * stepX;
        const y = svgHeight - (score * (svgHeight - 20) / 100) - 10;
        points.push(`${x},${y}`);
      });

      const pointsStr = points.join(' ');

      // Gradient filling area coordinates
      const fillPointsStr = `${points[0].split(',')[0]},${svgHeight} ${pointsStr} ${points[points.length - 1].split(',')[0]},${svgHeight}`;

      svgContainer.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" style="overflow:visible;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Area -->
        <polygon points="${fillPointsStr}" fill="url(#chartGrad)"/>
        <!-- Grid lines -->
        <line x1="0" y1="${svgHeight / 2}" x2="${svgWidth}" y2="${svgHeight / 2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4,4"/>
        <line x1="0" y1="${svgHeight - 10}" x2="${svgWidth}" y2="${svgHeight - 10}" stroke="rgba(255,255,255,0.1)"/>
        <!-- Line -->
        <polyline points="${pointsStr}" fill="none" stroke="#6366f1" stroke-width="3"/>
        <!-- Dots -->
        ${points.map((p, idx) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="5" fill="#a855f7" stroke="#fff" stroke-width="2"/>`).join('')}
      </svg>
    `;

    } catch (err) {
      console.error('Skill predictor metrics failed to load:', err);
    }
  }

  // 12. OFFLINE SYNCING ENGINE DETECTOR
  window.addEventListener('online', () => {
    console.log('[Online Engine] Network connection restored. Checking synchronization queue...');
    NetworkClient.checkConnection().then(() => {
      if (AppState.isOnline && AppState.token) {
        syncOfflineAttempts();
      }
    });
  });

  async function syncOfflineAttempts() {
    const queue = JSON.parse(localStorage.getItem('offline_attempts_queue') || '[]');
    if (queue.length === 0) return;
    try {
      const res = await NetworkClient.request('/quiz/sync', 'POST', { attempts: queue });
      alert(`[Offline Practice Mode] Sync complete! Synced ${res.syncedCount} attempts. Added +${res.addedXp} XP and +${res.addedCoins} Coins!`);
      localStorage.setItem('offline_attempts_queue', JSON.stringify([]));
      ViewRefresher.refreshDashboard();
    } catch (err) {
      console.error('Offline syncing failed:', err);
    }
  }

  // Toggle Practice Mode timer fields
  document.getElementById('arena-practice-mode').addEventListener('change', (e) => {
    const practiceTimerGroup = document.getElementById('practice-timer-group');
    if (e.target.checked) {
      practiceTimerGroup.classList.remove('hidden');
    } else {
      practiceTimerGroup.classList.add('hidden');
    }
  });

  // Run offline attempts sync on login
  if (AppState.token) {
    setTimeout(() => {
      if (AppState.isOnline) syncOfflineAttempts();
    }, 3000);
  }

});