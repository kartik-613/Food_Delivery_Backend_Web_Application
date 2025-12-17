const jwt = require('jsonwebtoken');

const genToken = async (userId) => {
    try {
      const token = await jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
      if (!token) {
        throw new Error('Failed to generate token');
      }
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Failed to generate token');
    }
};

module.exports = { genToken };
