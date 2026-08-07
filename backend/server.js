const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

// Controllers
const authController = require('./controllers/auth');
const quizController = require('./controllers/quiz');
const adminController = require('./controllers/admin');
const analyticsController = require('./controllers/analytics');
const featuresController = require('./controllers/features');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing with increased payload size limits for custom profile photo uploads
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Simple in-memory rate limiter for auth endpoints
const rateLimitMap = new Map();
function authRateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20;
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  if (entry.count > maxAttempts) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }
  next();
}

// Initialize Database schemas on startup
initDb().catch(err => {
  console.error('Database initialization failed:', err);
});

// ================= AUTHENTICATION ENDPOINTS =================
app.post('/api/auth/register', authRateLimit, authController.register);
app.post('/api/auth/login', authRateLimit, authController.login);
app.get('/api/auth/me', authController.verifyToken, authController.getProfile);

// ================= QUIZ ENGINE ENDPOINTS =================
app.get('/api/quiz/questions', quizController.getQuestions);
app.post('/api/quiz/submit', authController.verifyToken, quizController.submitQuiz);
app.get('/api/quiz/daily-challenge', quizController.getDailyChallenge);
app.get('/api/leaderboard', quizController.getLeaderboard);
app.delete('/api/leaderboard/:userId', authController.verifyToken, quizController.deleteLeaderboardScore);

// ================= ANALYTICS & BOOKMARKS ENDPOINTS =================
app.get('/api/analytics/category-breakdown', authController.verifyToken, analyticsController.getCategoryBreakdown);
app.get('/api/analytics/history', authController.verifyToken, analyticsController.getFullHistory);
app.post('/api/bookmarks/:questionId', authController.verifyToken, analyticsController.toggleBookmark);
app.get('/api/bookmarks', authController.verifyToken, analyticsController.getBookmarks);
app.get('/api/bookmarks/ids', authController.verifyToken, analyticsController.getBookmarkIds);

// ================= SECURE AUTH & LOGIN HISTORIES =================
app.post('/api/auth/otp/send', featuresController.sendOtp);
app.post('/api/auth/otp/verify', featuresController.verifyOtp);
app.post('/api/auth/reset-password', featuresController.resetPassword);
app.get('/api/auth/login-history', authController.verifyToken, featuresController.getLoginHistory);

// ================= CUSTOM FEATURES ENDPOINTS =================
app.put('/api/profile', authController.verifyToken, featuresController.updateProfile);

app.get('/api/shop/items', featuresController.getShopItems);
app.post('/api/shop/purchase', authController.verifyToken, featuresController.purchaseShopItem);
app.get('/api/shop/history', authController.verifyToken, featuresController.getPurchaseHistory);

app.post('/api/feedback', authController.verifyToken, featuresController.submitFeedback);
app.post('/api/feedback/report', authController.verifyToken, featuresController.reportQuestion);

app.get('/api/notifications', authController.verifyToken, featuresController.getNotifications);
app.post('/api/notifications', authController.verifyToken, featuresController.addUserNotification);
app.post('/api/notifications/read', authController.verifyToken, featuresController.markNotificationsRead);
app.delete('/api/notifications/:id', authController.verifyToken, featuresController.deleteNotification);
app.delete('/api/notifications', authController.verifyToken, featuresController.deleteAllNotifications);

app.post('/api/certificates/claim', authController.verifyToken, featuresController.claimCertificate);
app.get('/api/certificates', authController.verifyToken, featuresController.getCertificates);

app.post('/api/tutor/explain', featuresController.askAiTutor);
app.post('/api/predictor/chat', authController.verifyToken, featuresController.askSkillPredictor);
app.post('/api/quiz/sync', authController.verifyToken, featuresController.syncOfflineAttempts);

// ================= ADMIN CONSOLE ADDITIONS =================
app.get('/api/admin/feedback', authController.verifyAdmin, featuresController.adminGetFeedback);
app.get('/api/admin/reports', authController.verifyAdmin, featuresController.adminGetReports);
app.get('/api/admin/notifications', authController.verifyAdmin, featuresController.adminGetNotifications);
app.post('/api/admin/notifications', authController.verifyAdmin, featuresController.adminSendNotification);
app.get('/api/admin/rewards', authController.verifyAdmin, featuresController.adminGetRewards);
app.get('/api/admin/certificates', authController.verifyAdmin, featuresController.adminGetCertificates);
app.get('/api/admin/login-logs', authController.verifyAdmin, featuresController.adminGetLoginLogs);

// ================= ADMIN CONSOLE ENDPOINTS =================
app.get('/api/admin/questions/search', authController.verifyAdmin, adminController.searchQuestions);
app.post('/api/admin/questions', authController.verifyAdmin, adminController.createQuestion);
app.put('/api/admin/questions/:id', authController.verifyAdmin, adminController.updateQuestion);
app.delete('/api/admin/questions/:id', authController.verifyAdmin, adminController.deleteQuestion);
app.get('/api/admin/users', authController.verifyAdmin, adminController.getAllUsers);
app.delete('/api/admin/users/:id', authController.verifyAdmin, adminController.deleteUser);

// ================= STATIC FRONTEND SERVING =================
// Serve frontend static assets (index.html, script.js, style.css, assets/) from the parent directory
app.use(express.static(path.join(__dirname, '../')));

// Fallback for SPA routing: serve index.html for any unmapped get routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 AI Quiz Challenge Backend running on port ${PORT}`);
  console.log(`🔗 Access the web app at: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
