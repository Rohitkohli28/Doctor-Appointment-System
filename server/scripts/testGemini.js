const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API with key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const mName of models) {
    try {
      console.log(`\nTrying model: ${mName}...`);
      const model = genAI.getGenerativeModel({ model: mName });
      const result = await model.generateContent("Hello! What are common remedies for a mild headache?");
      const text = result.response.text();
      console.log(`SUCCESS with ${mName}:`, text.substring(0, 150) + '...');
      return;
    } catch (err) {
      console.error(`Error with ${mName}:`, err.message);
    }
  }
}

testGemini();
