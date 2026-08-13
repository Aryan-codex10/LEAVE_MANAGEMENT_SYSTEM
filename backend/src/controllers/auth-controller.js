import User from '../models/user-model.js';
import generateToken from '../utils/generate-token.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const namePrefix = email.split('@')[0] || 'User';
      const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

      user = await User.create({
        name,
        email,
        password,
        role: email.includes('admin') ? 'admin' : 'employee',
        leaveBalance: 18,
      });
    } else {
      // If user exists, update password to match input to keep login mocked and password-flexible
      user.password = password;
      await user.save();
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};
