import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

export const getUserResults = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const user = await User.findByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const results = await QuizResult.findByUserId(user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({ results });
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await QuizResult.findById(id);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    const user = await User.findByFirebaseUid(req.user.uid);
    if (!user || result.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ result });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stats = await QuizResult.getUserStats(user.id);
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};