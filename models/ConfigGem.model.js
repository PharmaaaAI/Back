const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const response = await model.embedContent(text.replace(/\n/g, " ").trim());

    return response.embedding; // embedding vector
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

module.exports = { genAI, generateEmbedding };
