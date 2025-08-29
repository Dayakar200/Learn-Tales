
export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ScoringModel {
  class_level: string;
  subject: string;
  topic: string;
  expected_quiz_score: number;
  difficulty: string;
  tags: string[];
}

export interface VyasAIOutput {
  story: string;
  quiz: QuizItem[];
  takeaways: string[];
  scoringModel: ScoringModel;
  image_prompt: string;
}
