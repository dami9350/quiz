import { supabase } from '../config/database.js';

class QuizResult {
  static async create(resultData) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([resultData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUserId(userId, options = {}) {
    let query = supabase
      .from('quiz_results')
      .select(`
        *,
        quizzes (
          id,
          question,
          quiz_type,
          difficulty,
          target_audience,
          explanation,
          quiz_categories (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        *,
        users (
          id,
          email,
          name,
          user_type
        ),
        quizzes (
          id,
          question,
          quiz_type,
          difficulty,
          target_audience,
          explanation,
          quiz_categories (
            id,
            name
          ),
          quiz_answers (
            id,
            answer_text,
            is_correct
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserStats(userId) {
    const { data: results, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const totalQuizzes = results.length;
    const correctAnswers = results.filter(r => r.is_correct).length;
    const incorrectAnswers = totalQuizzes - correctAnswers;
    const accuracy = totalQuizzes > 0 ? (correctAnswers / totalQuizzes) * 100 : 0;
    const totalTimeSpent = results.reduce((sum, r) => sum + (r.time_spent || 0), 0);
    const averageTimePerQuiz = totalQuizzes > 0 ? totalTimeSpent / totalQuizzes : 0;

    const { data: categoryStats, error: categoryError } = await supabase
      .from('quiz_results')
      .select(`
        is_correct,
        quizzes (
          quiz_categories (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (categoryError) throw categoryError;

    const statsByCategory = {};
    categoryStats.forEach(result => {
      const category = result.quizzes?.quiz_categories;
      if (category) {
        if (!statsByCategory[category.id]) {
          statsByCategory[category.id] = {
            name: category.name,
            total: 0,
            correct: 0
          };
        }
        statsByCategory[category.id].total++;
        if (result.is_correct) {
          statsByCategory[category.id].correct++;
        }
      }
    });

    return {
      totalQuizzes,
      correctAnswers,
      incorrectAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      totalTimeSpent,
      averageTimePerQuiz: Math.round(averageTimePerQuiz),
      categoryStats: Object.values(statsByCategory).map(cat => ({
        ...cat,
        accuracy: Math.round((cat.correct / cat.total) * 10000) / 100
      }))
    };
  }

  static async checkAnswer(quizId, userAnswer) {
    const { data: answers, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('is_correct', true);

    if (error) throw error;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const isCorrect = answers.some(answer => 
      answer.answer_text.trim().toLowerCase() === normalizedUserAnswer
    );

    return { isCorrect, correctAnswers: answers.map(a => a.answer_text) };
  }
}

export default QuizResult;