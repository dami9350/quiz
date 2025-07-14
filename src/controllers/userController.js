import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByFirebaseUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { user_type } = req.body;
    
    const userData = {
      firebase_uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture_url: req.user.picture,
      user_type
    };
    
    const user = await User.createOrUpdate(userData);
    res.json({ user });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    res.status(500).json({ error: 'Failed to create/update user profile' });
  }
};

export const updateUserType = async (req, res) => {
  try {
    const { user_type } = req.body;
    
    if (!['child', 'adult'].includes(user_type)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }
    
    const user = await User.updateByFirebaseUid(req.user.uid, { user_type });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user type:', error);
    res.status(500).json({ error: 'Failed to update user type' });
  }
};