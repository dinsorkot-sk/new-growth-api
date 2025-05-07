const { User } = require('../../models');

exports.createUserLogin = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.create({ ip });

    res.status(201).json({
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
