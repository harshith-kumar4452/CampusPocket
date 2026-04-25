const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY;

export const aiService = {
  // Generate Questions using Gemini
  async generateQuestionsFromText(text: string, count: number = 10): Promise<any[]> {
    if (!GEMINI_API_KEY) throw new Error("Gemini API key not found");
    
    const prompt = `Analyze the following educational text and generate exactly ${count} multiple-choice questions based on it. 
    Return the response ONLY as a JSON array of objects with this exact structure, with no markdown formatting or backticks:
    [
      {
        "question": "The question text?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "points": 1
      }
    ]
    
    Text to analyze:
    ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate questions');
    }

    try {
      const responseText = data.candidates[0].content.parts[0].text;
      // Clean up markdown code blocks if any
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      throw new Error("Invalid format received from AI");
    }
  },

  // Translate text using Sarvam AI
  async translateText(text: string, targetLanguage: 'hi-IN' | 'te-IN' | 'en-IN'): Promise<string> {
    if (!SARVAM_API_KEY) throw new Error("Sarvam API key not found");

    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text,
        source_language_code: 'en-IN',
        target_language_code: targetLanguage,
        speaker_gender: 'Male',
        mode: 'formal',
        model: 'sarvam-translate'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Sarvam Translation Error:", data);
      throw new Error('Failed to translate text');
    }

    return data.translated_text;
  }
};
