import Quiz from '../models/Quiz.js';
import QuizCategory from '../models/QuizCategory.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

export const getQuizzes = async (req, res) => {
  try {
    const { target_audience, quiz_type, category_id, difficulty } = req.query;
    
    const filters = {};
    if (target_audience) filters.target_audience = target_audience;
    if (quiz_type) filters.quiz_type = quiz_type;
    if (category_id) filters.category_id = category_id;
    if (difficulty) filters.difficulty = difficulty;
    
    const quizzes = await Quiz.findAll(filters);
    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const getRandomQuiz = async (req, res) => {
  try {
    const { target_audience, quiz_type, category_id, difficulty } = req.query;
    
    let userId = null;
    if (req.user) {
      const user = await User.findByFirebaseUid(req.user.uid);
      if (user) {
        userId = user.id;
        
        if (user.user_type) {
          const expectedQuizType = user.user_type === 'child' ? 'ox' : 'subjective';
          if (quiz_type && quiz_type !== expectedQuizType) {
            return res.status(400).json({ 
              error: `Invalid quiz type for ${user.user_type} user` 
            });
          }
        }
      }
    }
    
    const filters = {};
    if (target_audience) filters.target_audience = target_audience;
    if (quiz_type) filters.quiz_type = quiz_type;
    if (category_id) filters.category_id = category_id;
    if (difficulty) filters.difficulty = difficulty;
    
    // 이미 푼 문제 제외
    const quiz = await Quiz.getRandomQuizExcludingSolved(filters, userId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'No quiz found with the specified criteria' });
    }
    
    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching random quiz:', error);
    res.status(500).json({ error: 'Failed to fetch random quiz' });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { quiz_id, user_answer, time_spent } = req.body;
    
    if (!quiz_id || !user_answer) {
      return res.status(400).json({ error: 'Quiz ID and answer are required' });
    }
    
    const user = await User.findByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const { isCorrect, correctAnswers } = await QuizResult.checkAnswer(quiz_id, user_answer);
    
    const result = await QuizResult.create({
      user_id: user.id,
      quiz_id,
      user_answer,
      is_correct: isCorrect,
      time_spent: time_spent || null
    });
    
    res.json({
      result: {
        id: result.id,
        is_correct: isCorrect,
        user_answer,
        correct_answers: correctAnswers,
        explanation: quiz.explanation
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await QuizCategory.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { 
      category_id, 
      question, 
      quiz_type, 
      difficulty, 
      target_audience, 
      explanation, 
      quiz_answers 
    } = req.body;
    
    if (!question || !quiz_type || !target_audience || !explanation || !quiz_answers) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    if (!['ox', 'subjective'].includes(quiz_type)) {
      return res.status(400).json({ error: 'Invalid quiz type' });
    }
    
    if (!['child', 'adult'].includes(target_audience)) {
      return res.status(400).json({ error: 'Invalid target audience' });
    }
    
    const quiz = await Quiz.create({
      category_id,
      question,
      quiz_type,
      difficulty,
      target_audience,
      explanation,
      quiz_answers
    });
    
    res.status(201).json({ quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};