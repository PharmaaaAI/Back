const RecommendationService = require('../recom.js');
const User = require('../models/users.model.js');
const dotenv = require("dotenv");
dotenv.config();

const getChatRecommendations = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.currentUser?.userId;

    console.log('Extracted userId:', userId);

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'message is required and user must be authenticated'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const result = await RecommendationService.generateRecommendations(userId, message);

    res.json({
      success: true,
      message: result.message,
      recommendations: result.recommendations.map(product => ({
        _id: product._id,
        name: product.name,
        brandName: product.brandName,
        category: product.category,
        price: product.price,
        description: product.description,
        activeIngredients: product.activeIngredients,
      })),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        allergies: user.customerProfile?.allergies || [],
        chronicConditions: user.customerProfile?.chronicConditions || [],
        skinType: user.customerProfile?.skinType || 'unknown',
        skinConcerns: user.customerProfile?.skinConcerns || [],
        skinGoals: user.customerProfile?.skinGoals || [],
        budgetRange: user.customerProfile?.budgetRange || 'not_specified',
        gender: user.customerProfile?.gender || 'not_specified'
      }
    });

  } catch (error) {
    console.error('Error in chat recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getChatRecommendations };
