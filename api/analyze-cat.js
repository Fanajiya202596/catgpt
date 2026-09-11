import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { image, questions, language, talkStyle } = req.body;

    // Check whether image exists
    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({
        error: "Cat image is required.",
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured.",
      });
    }

    const selectedQuestions = Array.isArray(questions)
      ? questions
      : ["mood", "thought", "personality"];

    const selectedLanguage = language || "english";
    const selectedStyle = talkStyle || "funny";

    const prompt = `
You are CatGPT, an entertaining AI cat interpreter.

Analyze the uploaded cat image and provide a fun, clearly labeled interpretation.

IMPORTANT:
- This is entertainment, NOT a scientifically valid diagnosis.
- Do not claim that you can truly know the cat's thoughts or emotions.
- Base your interpretation only on visible cues such as posture, facial expression,
  ears, eyes, body position, surroundings and activity.
- Use phrases such as "AI estimated mood", "looks like", or "seems".
- Never make medical diagnoses.
- Do not identify the owner or any person in the image.
- Be playful and entertaining.

The user selected these questions:
${selectedQuestions.join(", ")}

Language:
${selectedLanguage}

Talking style:
${selectedStyle}

Return ONLY valid JSON.

For the selected questions, provide:

mood:
- emoji
- name
- score from 0 to 100
- short explanation

thought:
- a funny imagined thought

personality:
- personality name
- short explanation

doing:
- what the cat appears to be doing

want:
- what the cat might want

fun:
- one fun observation

Only include answers that are relevant to the user's selected questions.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            mood: {
              type: Type.OBJECT,
              properties: {
                emoji: {
                  type: Type.STRING,
                },
                name: {
                  type: Type.STRING,
                },
                score: {
                  type: Type.NUMBER,
                },
                text: {
                  type: Type.STRING,
                },
              },
            },

            thought: {
              type: Type.STRING,
            },

            personality: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                },
                text: {
                  type: Type.STRING,
                },
              },
            },

            doing: {
              type: Type.STRING,
            },

            want: {
              type: Type.STRING,
            },

            fun: {
              type: Type.STRING,
            },
          },
        },
      },
    });

    const resultText = response.text;

    if (!resultText) {
      return res.status(500).json({
        error: "Gemini returned an empty response.",
      });
    }

    let result;

    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Gemini response:", resultText);

      return res.status(500).json({
        error: "Gemini returned an invalid response.",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("CatGPT API error:", error);

    return res.status(500).json({
      error: "Cat analysis failed.",
      details: error.message,
    });
  }
}