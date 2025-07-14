import Quiz from '../models/Quiz.js';
import QuizCategory from '../models/QuizCategory.js';
import User from '../models/User.js';
import { supabase } from '../config/database.js';

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
    
    if (!question || !quiz_type || !target_audience || !explanation || !quiz_answers || quiz_answers.length === 0) {
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

    if (quiz_type === 'ox' && quiz_answers.length !== 2) {
      return res.status(400).json({ error: 'OX quiz must have exactly 2 answers' });
    }

    const correctAnswers = quiz_answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) {
      return res.status(400).json({ error: 'At least one correct answer is required' });
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

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates = ['question', 'difficulty', 'explanation', 'category_id'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const quiz = await Quiz.update(id, filteredUpdates);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Quiz.delete(id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const category = await QuizCategory.create({ name, description });
    res.status(201).json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const category = await QuizCategory.update(id, updates);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await QuizCategory.delete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const { data: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    const { data: totalQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });
      
    const { data: totalResults, error: resultsError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });
      
    const { data: categories, error: categoriesError } = await supabase
      .from('quiz_categories')
      .select('*, quizzes(count)');

    const stats = {
      totalUsers: totalUsers?.count || 0,
      totalQuizzes: totalQuizzes?.count || 0,
      totalQuizAttempts: totalResults?.count || 0,
      categoriesWithCount: categories || []
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    res.json({ 
      users,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;
    
    if (typeof is_admin !== 'boolean') {
      return res.status(400).json({ error: 'is_admin must be a boolean' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_admin })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user admin status:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};