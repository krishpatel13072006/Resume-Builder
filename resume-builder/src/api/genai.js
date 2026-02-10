import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_AI_API_KEY not found in environment variables. Please add it to your .env file.');
  }
  return apiKey;
};

// 1. Validate API Key
export const validateApiKey = async (apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API key is required');
  try {
    const genAI = new GoogleGenerativeAI(keyToUse);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    return response.text() && response.text().length > 0;
  } catch (error) {
    console.error("API Key Validation Failed:", error);
    throw new Error('Invalid API Key');
  }
};

// 2. Generate Resume Summary
export const generateSummary = async (formData, apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API Key missing');
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const skills = formData.techSkills?.languages?.join(', ') || 'General';

  const prompt = `Write a professional, concise 2-3 sentence resume summary for a ${formData.title} named ${formData.name}.
  Context:
  - Education: ${formData.education?.[0]?.degree || 'N/A'}
  - Key Skills: ${skills}
  - Tone: Confident, modern, and professional.
  - Output: Just the summary text, no markdown or labels.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// 2b. Generate One-Line Executive Summary
export const generateOneLineSummary = async (formData, apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API Key missing');
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const skills = formData.techSkills?.languages?.join(', ') || 'General';
  const prompt = `Write exactly one compelling sentence (max 25 words) for a resume headline/tagline for ${formData.title} named ${formData.name}.
  Context: Education: ${formData.education?.[0]?.degree || 'N/A'}. Key skills: ${skills}.
  Output: Only the one sentence, no quotes or labels.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// 3. Improve Existing Text
export const improveContent = async (text, apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API Key missing');
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Rewrite the following resume bullet point to be more impactful. Use strong action verbs and professional phrasing.
  Original: "${text}"
  Output: Just the improved text, no quotes or explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// 4. Suggest Related Skills
export const suggestSkills = async (currentInput, apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API Key missing');
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `The user is typing "${currentInput}" for a resume skill. Suggest 5 related technical skills or tools that often go with this.
  Output: A simple comma-separated list (e.g. React, Redux, TypeScript).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// 5. Suggest Bullet Points for a Role
export const suggestBulletPoints = async (role, company, apiKey) => {
  const keyToUse = apiKey || getApiKey();
  if (!keyToUse) throw new Error('API Key missing');
  const genAI = new GoogleGenerativeAI(keyToUse);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Write 3 impressive resume bullet points for a ${role} position at ${company}.
  Focus on: Achievements, metrics, and technical contribution.
  Output: A list of 3 strings separated by newlines. No numbers or bullet characters at the start.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Cleanup response to get clean array
  return text.split('\n')
    .map(line => line.replace(/^[\d\.\-\•\*]\s*/, '').trim())
    .filter(line => line.length > 5)
    .slice(0, 3);
};
