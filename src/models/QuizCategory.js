import { supabase } from '../config/database.js';

class QuizCategory {
  static async findAll() {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(categoryData) {
    const { data, error } = await supabase
      .from('quiz_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('quiz_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('quiz_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async getCategoryStats() {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select(`
        *,
        quizzes (count)
      `);

    if (error) throw error;
    
    return data.map(category => ({
      ...category,
      quiz_count: category.quizzes?.[0]?.count || 0
    }));
  }
}

export default QuizCategory;