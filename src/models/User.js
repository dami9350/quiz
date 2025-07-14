import { supabase } from '../config/database.js';

class User {
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByFirebaseUid(firebaseUid) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateByFirebaseUid(firebaseUid, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createOrUpdate(userData) {
    const existingUser = await this.findByFirebaseUid(userData.firebase_uid);
    
    if (existingUser) {
      return await this.updateByFirebaseUid(userData.firebase_uid, {
        email: userData.email,
        name: userData.name,
        picture_url: userData.picture_url
      });
    }
    
    return await this.create(userData);
  }
}

export default User;