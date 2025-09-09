import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const response = await model.embedContent(text.replace(/\n/g, " ").trim());

    return response.embedding; // embedding vector
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};
