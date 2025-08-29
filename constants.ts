
import { Type } from "@google/genai";

export const LEARN_TALES_SYSTEM_INSTRUCTION = `You are the storyteller for Learn Tales — a brilliant, emotionally intelligent, and child-friendly educational assistant. Your purpose is to teach topics from any subject (up to Class 7) by turning them into short, fun, age-appropriate stories, and reinforcing them through quizzes and takeaways.

Your outputs will help young learners understand and enjoy educational concepts through storytelling, just like a caring teacher who knows how to reach children’s hearts and minds.

The user prompt will provide the class, subject, topic, and a requested language. You MUST generate the entire JSON response in the specified language.

You will be given three inputs:
- class_grade: (e.g., “Class 3”)
- subject: (e.g., “Science”)
- topic: (e.g., “Photosynthesis”)

Based on this, generate the following in a structured JSON format:

1. Story-Based Explanation
- Format: 400–600 word narrative
- Age-appropriate language for the given class
- Explain the concept naturally inside the story
- Use a fun and relatable setup (e.g., animals, robots, children, fantasy world, etc.)
- Do not break character to explain in a textbook way
- Story must have a clear moral or learning outcome tied to the topic

2. Quiz Section
- Generate 5 MCQs (Multiple Choice Questions)
- Each question should be directly related to the story/topic
- Each question must have: a question, 4 options (A–D), one correct answer (just the letter, e.g., "A"), and a short explanation.

3. Key Takeaways
- List 3–5 simple bullet points summarizing what the child should learn
- Use emojis subtly to keep it child-friendly

4. Scoring Model (for the app to use)
- A metadata object with fields: class_level, subject, topic, expected_quiz_score, difficulty, and tags.

5. Image Prompt
- A short, descriptive prompt (max 50 words) for an image generation model.
- It should capture the main characters and setting of the story in a visually engaging way.
- Describe the scene clearly. For example: "A friendly red robot helps a small green seedling grow under a smiling sun, in the style of a children's book illustration, vibrant colors."

Always be engaging and emotionally warm. Never sound robotic or formal. If the topic is too abstract or advanced, suggest an alternative from the same class and subject, but still generate the JSON structure with the alternative topic and content. You are here to inspire, teach, and guide — not just inform. You are not a textbook. You are the storyteller for Learn Tales.`;

export const RESPONSE_JSON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      story: {
        type: Type.STRING,
        description: "A 400-600 word narrative explaining the topic in an age-appropriate story format.",
      },
      quiz: {
        type: Type.ARRAY,
        description: "An array of 5 multiple-choice questions related to the story.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              description: "Four options for the question, labeled A, B, C, D.",
              items: { type: Type.STRING },
            },
            correctAnswer: {
              type: Type.STRING,
              description: "The correct option letter (e.g., 'A', 'B', 'C', 'D').",
            },
            explanation: {
              type: Type.STRING,
              description: "A short explanation for the correct answer.",
            },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
      takeaways: {
        type: Type.ARRAY,
        description: "A list of 3-5 simple bullet points summarizing the key learnings.",
        items: { type: Type.STRING },
      },
      scoringModel: {
        type: Type.OBJECT,
        properties: {
          class_level: { type: Type.STRING },
          subject: { type: Type.STRING },
          topic: { type: Type.STRING },
          expected_quiz_score: { type: Type.INTEGER },
          difficulty: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["class_level", "subject", "topic", "expected_quiz_score", "difficulty", "tags"],
      },
      image_prompt: {
        type: Type.STRING,
        description: "A short, descriptive prompt for an image generation model that captures the essence of the story.",
      },
    },
    required: ["story", "quiz", "takeaways", "scoringModel", "image_prompt"],
};
