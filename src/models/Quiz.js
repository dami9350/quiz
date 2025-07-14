import { supabase } from '../config/database.js';

class Quiz {
  static async findAll(filters = {}) {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        quiz_categories (
          id,
          name,
          description
        ),
        quiz_answers (
          id,
          answer_text,
          is_correct
        )
      `);

    if (filters.target_audience) {
      query = query.eq('target_audience', filters.target_audience);
    }

    if (filters.quiz_type) {
      query = query.eq('quiz_type', filters.quiz_type);
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_categories (
          id,
          name,
          description
        ),
        quiz_answers (
          id,
          answer_text,
          is_correct
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getRandomQuiz(filters = {}) {
    const allQuizzes = await this.findAll(filters);
    
    if (allQuizzes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * allQuizzes.length);
    return allQuizzes[randomIndex];
  }

  static async getRandomQuizExcludingSolved(filters = {}, userId = null) {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        quiz_categories (
          id,
          name,
          description
        ),
        quiz_answers (
          id,
          answer_text,
          is_correct
        )
      `);

    // 필터 적용
    if (filters.target_audience) {
      query = query.eq('target_audience', filters.target_audience);
    }
    if (filters.quiz_type) {
      query = query.eq('quiz_type', filters.quiz_type);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data: allQuizzes, error } = await query;
    if (error) throw error;

    // 사용자가 로그인한 경우, 이미 푼 문제 제외
    let availableQuizzes = allQuizzes;
    if (userId) {
      const { data: solvedQuizIds, error: resultError } = await supabase
        .from('quiz_results')
        .select('quiz_id')
        .eq('user_id', userId);

      if (!resultError && solvedQuizIds) {
        const solvedIds = solvedQuizIds.map(r => r.quiz_id);
        availableQuizzes = allQuizzes.filter(q => !solvedIds.includes(q.id));
      }
    }

    if (availableQuizzes.length === 0) {
      // 모든 문제를 풀었다면 전체 문제에서 다시 선택
      availableQuizzes = allQuizzes;
    }

    if (availableQuizzes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
    return availableQuizzes[randomIndex];
  }

  static async create(quizData) {
    const { quiz_answers, ...quizInfo } = quizData;

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([quizInfo])
      .select()
      .single();

    if (quizError) throw quizError;

    if (quiz_answers && quiz_answers.length > 0) {
      const answersWithQuizId = quiz_answers.map(answer => ({
        ...answer,
        quiz_id: quiz.id
      }));

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answersWithQuizId);

      if (answersError) throw answersError;
    }

    return await this.findById(quiz.id);
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export default Quiz;