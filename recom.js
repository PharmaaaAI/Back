const { genAI } = require('./models/ConfigGem.model.js');
const User = require('./models/users.model.js');
const Product = require('./models/product.model.js');
const dotenv = require('dotenv');
dotenv.config();

class RecommendationService {
  static async getSafeProducts(userProfile, searchQuery = '', limit = 10) {
    try {
      // Build MongoDB filter
      const filter = { $and: [] };

      // budget range
      if (userProfile.budgetRange) {
        const budgetRanges = {
          under_25: { price: { $lt: 25 } },
          '25_50': { price: { $gte: 25, $lt: 50 } },
          '50_100': { price: { $gte: 50, $lt: 100 } },
          '100_200': { price: { $gte: 100, $lt: 200 } },
          over_200: { price: { $gte: 200 } },
        };
        if (budgetRanges[userProfile.budgetRange]) {
          filter.$and.push(budgetRanges[userProfile.budgetRange]);
        }
      }

      // allergies filter
      if (userProfile.allergies && userProfile.allergies.length > 0) {
        filter.$and.push({
          activeIngredients: {
            $not: {
              $elemMatch: {
                $in: userProfile.allergies,
              },
            },
          },
        });
      }

      // skin concerns filter
      if (userProfile.skinConcerns && userProfile.skinConcerns.length > 0) {
        const concernRegex = userProfile.skinConcerns.join('|');
        filter.$and.push({
          $or: [
            { category: { $regex: concernRegex, $options: 'i' } },
            { subcategory: { $regex: concernRegex, $options: 'i' } },
            { description: { $regex: concernRegex, $options: 'i' } },
            ...(userProfile.skinConcerns.includes('dark spots')
              ? [
                  {
                    subcategory: {
                      $regex: 'anti-aging|brightening',
                      $options: 'i',
                    },
                  },
                ]
              : []),
          ],
        });
      }

      // stock filter
      filter.$and.push({ quantity: { $gt: 0 } });

      if (filter.$and.length === 0) delete filter.$and;

      console.log('MongoDB Filter:', JSON.stringify(filter, null, 2));

      const products = await Product.find(filter).limit(limit);
      console.log(`Found ${products.length} products matching criteria`);

      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error getting safe products:', error);
      return [];
    }
  }

  static async generateRecommendations(userId, userQuery) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Extract nested customerProfile fields safely
      const userProfile = {
        allergies: user.customerProfile?.allergies || [],
        skinType: user.customerProfile?.skinType || null,
        skinConcerns: user.customerProfile?.skinConcerns || [],
        skinGoals: user.customerProfile?.skinGoals || [],
        budgetRange: user.customerProfile?.budgetRange || null,
        currentMedications: user.customerProfile?.currentMedications || [],
      };

      console.log('User Profile for filtering:', userProfile);

      // products that suit the user
      const safeProducts = await this.getSafeProducts(userProfile, userQuery, 10);

      if (!Array.isArray(safeProducts) || safeProducts.length === 0) {
        return {
          message:
            "I couldn't find any safe products matching your criteria. Please consult with a pharmacist.",
          recommendations: [],
        };
      }

      const prompt = `You are PharmaAI, a pharmacy assistant. Recommend products ONLY from the provided list based on the user's profile and query.

USER PROFILE:
- Allergies: ${userProfile.allergies.join(', ') || 'None specified'}
- Skin Type: ${userProfile.skinType || 'Not specified'}
- Skin Concerns: ${userProfile.skinConcerns.join(', ') || 'None specified'}
- Skin Goals: ${userProfile.skinGoals.join(', ') || 'None specified'}
- Budget: ${userProfile.budgetRange || 'Not specified'}
- Current Medications: ${userProfile.currentMedications.join(', ') || 'None specified'}

SAFETY RULES:
1. NEVER recommend products containing user's allergens
2. Always mention relevant warnings and side effects
3. Only recommend from the provided product list
4. Explain why each product is suitable for the user's specific needs
5. Consider the user's budget constraints

User Query: "${userQuery}"

AVAILABLE PRODUCTS:
${safeProducts
  .map(
    (product, idx) => `
${idx + 1}. ${product.name}
   Brand: ${product.brandName || 'N/A'}
   Category: ${product.category}
   Price: $${product.price}
   Description: ${product.description}
   Active Ingredients: ${product.activeIngredients?.join(', ') || 'N/A'}
   Side Effects: ${product.sideEffects?.join(', ') || 'None listed'}
   Stock: ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}`
  )
  .join('\n')}

Based on the user's profile and query, recommend 2-3 most suitable products with detailed explanations for each choice.`;

      console.log(
        'Loaded key (first 10 chars):',
        process.env.GEMINI_API_KEY?.slice(0, 10)
      );

      // GEMINI API CALL
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
        },
      });

      const result = await model.generateContent(prompt);
      const aiMessage = result.response.text();

      return {
        message: aiMessage,
        recommendations: safeProducts.slice(0, 3),
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
}

module.exports = RecommendationService;
