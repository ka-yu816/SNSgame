export type AgeGroup = 'elementary' | 'junior_high' | 'adult';

export interface Choice {
  id: number;
  text: string;
  textElementary?: string; // 小学生向け（ひらがな多め、ルビ付きなど）
  textAdult?: string; // 大人向け（よりフォーマル、実用的な表現）
  flameChange: number; // 炎上度の変化量 (正: 炎上度アップ、負/ゼロ: 安全)
  followerChange: number; // フォロワー数の変化量
  explanation: string; // 選んだ後の解説
  explanationElementary?: string; // 小学生向けの解説
  explanationAdult?: string; // 大人向けの解説
}

export interface QuizQuestion {
  id: number;
  title: string;
  titleElementary?: string;
  titleAdult?: string;
  category: 'copyright' | 'privacy' | 'communication' | 'fakenews';
  categoryLabel: string;
  scenario: string; // 投稿しようとしている内容や状況の説明
  scenarioElementary?: string; // 小学生向け状況説明
  scenarioAdult?: string; // 大人向け状況説明
  postImage?: string; // (任意) 投稿しようとしている画像の説明
  postText: string; // 投稿テキスト案
  choices: Choice[];
  targetAgeGroups?: AgeGroup[];
}

export interface GameState {
  ageGroup: AgeGroup; // 選択された年齢層
  currentQuestionIndex: number;
  flameMeter: number; // 0 - 100%
  followers: number;
  score: number;
  isGameOver: boolean;
  isGameCleared: boolean;
  selectedChoiceId: number | null;
  showExplanation: boolean;
  history: {
    questionId: number;
    choiceId: number;
  }[];
}

