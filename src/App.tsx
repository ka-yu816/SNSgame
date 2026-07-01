/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Smartphone,
  Info,
  Award,
  Flame,
  Globe,
  Share2,
  ThumbsUp,
  GraduationCap
} from 'lucide-react';
import { QUESTIONS } from './data';
import { GameState, QuizQuestion, AgeGroup } from './types';
import PhoneFrame from './components/PhoneFrame';

const INITIAL_STATE: GameState = {
  ageGroup: 'junior_high',
  currentQuestionIndex: 0,
  flameMeter: 0,
  followers: 100,
  score: 0,
  isGameOver: false,
  isGameCleared: false,
  selectedChoiceId: null,
  showExplanation: false,
  history: []
};

function shuffleArray<T>(array: T[]): T[] {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [showAgeSelection, setShowAgeSelection] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(false);

  const currentQuestion: QuizQuestion | undefined = activeQuestions[gameState.currentQuestionIndex];

  // クイズ選択時の処理
  const handleSelectChoice = (choiceId: number) => {
    if (gameState.selectedChoiceId !== null || !currentQuestion) return; // 選択済みなら何もしない

    setGameState(prev => {
      const question = activeQuestions[prev.currentQuestionIndex];
      const choice = question.choices.find(c => c.id === choiceId)!;
      
      const newFlameMeter = Math.min(100, Math.max(0, prev.flameMeter + choice.flameChange));
      const newFollowers = Math.max(0, prev.followers + choice.followerChange);
      const isGameOver = newFlameMeter >= 100;
      
      const isCorrect = choice.flameChange === 0;
      const newScore = prev.score + (isCorrect ? 100 : 0);

      const nextHistory = [...prev.history, { questionId: question.id, choiceId }];

      return {
        ...prev,
        flameMeter: newFlameMeter,
        followers: newFollowers,
        score: newScore,
        selectedChoiceId: choiceId,
        showExplanation: true,
        isGameOver,
        history: nextHistory
      };
    });
  };

  // 次の問題へ進む、またはクリア判定
  const handleNext = () => {
    setGameState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isCleared = nextIndex >= activeQuestions.length;

      if (isCleared) {
        return {
          ...prev,
          isGameCleared: true,
          selectedChoiceId: null,
          showExplanation: false
        };
      } else {
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          selectedChoiceId: null,
          showExplanation: false
        };
      }
    });
  };

  // ゲームリセット・年齢層選択から
  const handleRestart = () => {
    setGameState(INITIAL_STATE);
    setActiveQuestions([]);
    setShowAgeSelection(true);
    setShowIntro(false);
  };

  // 年齢層選択決定
  const selectAgeGroup = (group: AgeGroup) => {
    // 1. 選択された年齢層に適合する問題をフィルター
    const filtered = QUESTIONS.filter(q => {
      if (!q.targetAgeGroups) return true;
      return q.targetAgeGroups.includes(group);
    });

    // 2. 問題をシャッフル
    const shuffledQuestions = shuffleArray(filtered);

    // 3. 各問題の選択肢もシャッフル
    const finalizedQuestions = shuffledQuestions.map(q => ({
      ...q,
      choices: shuffleArray(q.choices)
    }));

    setActiveQuestions(finalizedQuestions);
    setGameState(prev => ({
      ...prev,
      ageGroup: group
    }));
    setShowAgeSelection(false);
    setShowIntro(true); // 年齢選択の次はルールイントロ画面を表示
  };

  const selectedChoice = currentQuestion?.choices.find(c => c.id === gameState.selectedChoiceId);

  // 難易度（年齢層）に応じた表示テキストの抽出
  const getQuestionText = (q: QuizQuestion | undefined) => {
    if (!q) return { title: '', scenario: '' };
    if (gameState.ageGroup === 'elementary') {
      return {
        title: q.titleElementary || q.title,
        scenario: q.scenarioElementary || q.scenario
      };
    } else if (gameState.ageGroup === 'adult') {
      return {
        title: q.titleAdult || q.title,
        scenario: q.scenarioAdult || q.scenario
      };
    }
    return {
      title: q.title,
      scenario: q.scenario
    };
  };

  const getChoiceText = (choice: any) => {
    if (gameState.ageGroup === 'elementary') {
      return choice.textElementary || choice.text;
    } else if (gameState.ageGroup === 'adult') {
      return choice.textAdult || choice.text;
    }
    return choice.text;
  };

  const getExplanationText = (choice: any) => {
    if (gameState.ageGroup === 'elementary') {
      return choice.explanationElementary || choice.explanation;
    } else if (gameState.ageGroup === 'adult') {
      return choice.explanationAdult || choice.explanation;
    }
    return choice.explanation;
  };

  // ランク判定
  const getRankInfo = () => {
    if (gameState.flameMeter >= 100) {
      return {
        grade: 'D',
        title: gameState.ageGroup === 'elementary' ? 'えんじょうインフルエンサー' : '炎上インフルエンサー',
        desc: gameState.ageGroup === 'elementary' 
          ? 'SNSの使い方を見直そう！周りの人や作った人にめいわくをかけちゃっているかも。' 
          : 'SNSの使い方を見直そう！周りの人や法律に迷惑をかけてしまっているかも。',
        color: 'text-rose-600 border-rose-200 bg-rose-50'
      };
    }
    const correctCount = gameState.score / 100;
    const totalQuestions = activeQuestions.length || QUESTIONS.length;
    if (correctCount === totalQuestions && gameState.flameMeter === 0) {
      return {
        grade: 'S',
        title: gameState.ageGroup === 'elementary' ? 'ネチケットまもり神' : '神リテラシー超人',
        desc: gameState.ageGroup === 'elementary' 
          ? 'かんぺきです！ルールをバッチリりかいして、安全にSNSをつかえています！' 
          : '完璧です！著作権や個人情報のルールをバッチリ理解して、スマートにSNSを使えています！',
        color: 'text-indigo-600 border-indigo-200 bg-indigo-50'
      };
    } else if (correctCount >= 4) {
      return {
        grade: 'A',
        title: gameState.ageGroup === 'elementary' ? 'やさしいSNSリーダー' : '優等生SNSリーダー',
        desc: gameState.ageGroup === 'elementary' 
          ? '素晴らしい！安全で楽しいつかい方を知っています。このちょうしで発信しよう！' 
          : 'とても素晴らしい！安全で楽しいSNSの使い方を知っています。この調子で発信しよう！',
        color: 'text-emerald-600 border-emerald-200 bg-emerald-50'
      };
    } else if (correctCount >= 2) {
      return {
        grade: 'B',
        title: gameState.ageGroup === 'elementary' ? 'ふつうのSNSユーザー' : '中堅SNSユーザー',
        desc: gameState.ageGroup === 'elementary' 
          ? 'すこしおしいところがありました。もう一回クイズをして、あやしいルールをべんきょうしよう。' 
          : '少し惜しいところがありました。もう一度クイズをやって、怪しいルールをおさらいしてみよう。',
        color: 'text-sky-600 border-sky-200 bg-sky-50'
      };
    } else {
      return {
        grade: 'C',
        title: gameState.ageGroup === 'elementary' ? 'すれすれネット市民' : 'すれすれネット市民',
        desc: gameState.ageGroup === 'elementary' 
          ? 'ちょっとあぶない投稿が多めです。わるぎがなくてもえんじょうするかも。かいせつを読もう！' 
          : 'ちょっと危ない投稿が多めです。悪気がなくても炎上してしまうかも。解説をしっかり読もう！',
        color: 'text-orange-600 border-orange-200 bg-orange-50'
      };
    }
  };

  const rank = getRankInfo();
  const activeTexts = getQuestionText(currentQuestion);

  return (
    <div id="app-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 overflow-x-hidden font-sans">
      {/* 左側：ゲーム紹介・ルール説明パネル（Sleek Interface仕様の高級ホワイトカード） */}
      <div id="intro-panel" className="max-w-md w-full flex flex-col gap-6 text-center md:text-left bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider mx-auto md:mx-0">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            Sleek SNS Literacy Simulator
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            SNSリテラシー・ディフェンダー
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            対象: 小学生・中学生・高校生・大人まで
          </p>
          <div className="w-12 h-1 bg-indigo-600 rounded-full mx-auto md:mx-0 my-2"></div>
          <p className="text-xs text-slate-500 leading-relaxed text-justify">
            SNSはとても便利で楽しい道具ですが、何気ない一つの投稿が「著作権侵害」や「個人情報特定」の引き金になり、一瞬で大炎上してしまう危険を孕んでいます。
            本シミュレーターでは、小学生から大人まで、自身の年齢・立場に最も適した難易度のケーススタディを通して、安全で実用的なSNSリテラシーを楽しみながら養うことができます。
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <h2 className="font-bold text-slate-700 text-xs flex items-center gap-2 justify-center md:justify-start uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            ミッション・ルール
          </h2>
          <ul className="text-xs text-slate-500 space-y-2 text-left list-none">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">A</span>
              <span>直面するSNSシーンで「最も適切で安全な行動」を選択してください。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">🔥</span>
              <span>不適切な発信を選ぶと、<strong>炎上リスクメーター</strong>が上昇します。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">⚡</span>
              <span>炎上リスクが100%に達すると、社会的信頼を失い<strong>ゲームオーバー</strong>になります。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">👥</span>
              <span>優れた投稿は新たなファンを呼び、<strong>フォロワー数</strong>が劇的に増加します！</span>
            </li>
          </ul>
        </div>

        <div className="hidden md:flex items-center justify-center p-3 border border-dashed border-slate-200 rounded-2xl text-[10px] text-slate-400 gap-2">
          <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
          <span>スマートフォン内の操作パネルをタッチしてスタート！</span>
        </div>
      </div>

      {/* 右側：スマートフォン画面（インナーは明るいSleekテーマ） */}
      <div id="phone-container" className="w-full max-w-[340px] flex justify-center">
        <PhoneFrame>
          <AnimatePresence mode="wait">
            {/* A. 年齢層選択画面（最初に必ず選ぶ） */}
            {showAgeSelection && (
              <motion.div
                key="age-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                    <GraduationCap className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">年齢層（対象）を選んでね！</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                    選んだ難易度に応じて、解説の細かさや言葉遣い、漢字のふりがなが切り替わります。
                  </p>
                </div>

                <div className="space-y-3 my-auto">
                  {/* 小学生 */}
                  <button
                    id="age-elementary-btn"
                    onClick={() => selectAgeGroup('elementary')}
                    className="w-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl p-4 text-left transition-all transform active:scale-98 flex items-center gap-4 group shadow-sm"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl font-bold text-amber-600 group-hover:scale-105 transition-transform">
                      🎒
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">小学生（しょうがくせい）</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">ひらがな多め、やさしく基本ルールを学べる</div>
                    </div>
                  </button>

                  {/* 中学生・高校生 */}
                  <button
                    id="age-junior-btn"
                    onClick={() => selectAgeGroup('junior_high')}
                    className="w-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 text-left transition-all transform active:scale-98 flex items-center gap-4 group shadow-sm"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600 group-hover:scale-105 transition-transform">
                      ✏️
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">中学生・高校生</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">標準的な漢字表記、大切なネットマナーの習得</div>
                    </div>
                  </button>

                  {/* 大人・一般 */}
                  <button
                    id="age-adult-btn"
                    onClick={() => selectAgeGroup('adult')}
                    className="w-full bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-2xl p-4 text-left transition-all transform active:scale-98 flex items-center gap-4 group shadow-sm"
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-xl font-bold text-slate-700 group-hover:scale-105 transition-transform">
                      💼
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">大人・一般</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">実践的な法的リスク解説・本格ファクトチェック</div>
                    </div>
                  </button>
                </div>

                <div className="text-center text-[10px] text-slate-400 pb-2">
                  ※ ゲームの途中でいつでもリセットできます。
                </div>
              </motion.div>
            )}

            {/* B. イントロ説明画面 */}
            {!showAgeSelection && showIntro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <motion.div
                    animate={{ rotate: [0, -4, 4, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative w-20 h-20 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200 mb-2"
                  >
                    <Flame className="w-10 h-10 text-white animate-pulse" />
                  </motion.div>

                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {gameState.ageGroup === 'elementary' ? '配信デビュー！' : 'SNSシミュレーター'}
                  </h2>
                  
                  <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-100">
                    設定難易度: {
                      gameState.ageGroup === 'elementary' ? '小学生向け' :
                      gameState.ageGroup === 'junior_high' ? '中学生・高校生向け' : '大人・一般向け'
                    }
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">
                    {gameState.ageGroup === 'elementary' ? (
                      <span>
                        きみは新しくSNS（エスエヌエス）をはじめたよ！<br />
                        ルールをまもりながら、みんなからよろこばれる投稿（とうこう）をしてフォロワーをふやそう！
                      </span>
                    ) : (
                      <span>
                        あなたは新規のアカウントを開設したクリエイターです。<br />
                        日常の出来事を投稿しながらフォロワーを増やしてください。ただし、炎上リスクをいかにゼロに抑えられるかが鍵となります。
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    id="start-game-btn"
                    onClick={() => setShowIntro(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all transform active:scale-95 text-xs tracking-wider"
                  >
                    シミュレーションを開始する
                  </button>
                  <button
                    onClick={() => setShowAgeSelection(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-6 rounded-xl transition-all transform active:scale-95 text-[10px]"
                  >
                    年齢層を変更する
                  </button>
                </div>
              </motion.div>
            )}

            {/* C. ゲームオーバー（炎上）画面 */}
            {!showAgeSelection && !showIntro && gameState.isGameOver && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600 animate-bounce">
                    <ShieldAlert className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-black text-rose-600">
                    {gameState.ageGroup === 'elementary' ? '大えんじょう！ゲームオーバー' : '大炎上！GAME OVER'}
                  </h3>
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 leading-relaxed text-left">
                    {gameState.ageGroup === 'elementary' ? (
                      <span>
                        <strong>炎上メーターが100%になってしまいました！</strong><br />
                        よくない投稿によって、ネット上が大あれし、お友だちや学校の先生にもおこられてしまいました。アカウントは消去となりました…。
                      </span>
                    ) : (
                      <span>
                        <strong>炎上リスクメーターが100%に到達しました！</strong><br />
                        ネット上で大批判を浴び、社会的信用の失墜、場合によっては法的・民事的な責任問題や学校での処分など、現実的に非常に深刻な損害が発生してしまいました。
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-100 p-4 rounded-2xl text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">最終フォロワー数</div>
                  <div className="text-xl font-black text-slate-800 flex items-center justify-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    {gameState.followers} 人
                  </div>
                </div>

                <button
                  id="retry-btn-gameover"
                  onClick={handleRestart}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  もう一度チャレンジする
                </button>
              </motion.div>
            )}

            {/* D. ゲームクリア画面 */}
            {!showAgeSelection && !showIntro && !gameState.isGameOver && gameState.isGameCleared && (
              <motion.div
                key="clear"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-sm">
                    <Award className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {gameState.ageGroup === 'elementary' ? 'とうこうテストがすべておわったよ！' : '全シーンのシミュレート完了！'}
                  </h3>
                  
                  {/* ランク表示 */}
                  <div className={`border p-4 rounded-2xl text-left space-y-1 ${rank.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">診断ランク</span>
                      <span className="text-2xl font-black">{rank.grade}</span>
                    </div>
                    <div className="font-bold text-xs">{rank.title}</div>
                    <p className="text-[11px] leading-relaxed opacity-90">{rank.desc}</p>
                  </div>
                </div>

                {/* リザルトステータス */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-100 p-3 rounded-2xl text-center border border-slate-200/50">
                    <div className="text-[9px] text-slate-400 font-bold">フォロワー数</div>
                    <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {gameState.followers}人
                    </div>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl text-center border border-slate-200/50">
                    <div className="text-[9px] text-slate-400 font-bold">最終炎上度</div>
                    <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {gameState.flameMeter}%
                    </div>
                  </div>
                </div>

                <button
                  id="restart-btn"
                  onClick={handleRestart}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs mt-3"
                >
                  <RotateCcw className="w-4 h-4" />
                  もう一度あそぶ
                </button>
              </motion.div>
            )}

            {/* E. クイズプレイ画面 */}
            {!showAgeSelection && !showIntro && !gameState.isGameOver && !gameState.isGameCleared && currentQuestion && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* 画面ヘッダー: ステータスメーター */}
                <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    {/* フォロワー数 */}
                    <div className="flex items-center gap-1 text-slate-600 font-bold">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{gameState.ageGroup === 'elementary' ? 'フォロワー:' : 'フォロワー数:'}</span>
                      <span className="font-extrabold text-indigo-600">{gameState.followers}人</span>
                    </div>

                    {/* 進行度 */}
                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {gameState.ageGroup === 'elementary' ? 'とうこう:' : 'シーン:'} {gameState.currentQuestionIndex + 1} / {activeQuestions.length}
                    </div>
                  </div>

                  {/* 炎上メーター */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {gameState.ageGroup === 'elementary' ? 'えんじょうメーター' : '炎上リスクメーター'}
                      </span>
                      <span className={gameState.flameMeter >= 60 ? 'text-red-600 font-extrabold' : 'text-slate-600'}>
                        {gameState.flameMeter}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-400 to-red-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${gameState.flameMeter}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 投稿の下書きプレビュー（SNS風UI） */}
                <div className="flex-1 p-4 space-y-4">
                  {/* お題カテゴリ */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {currentQuestion.categoryLabel}
                    </span>
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      {gameState.ageGroup === 'elementary' ? 'じょうきょうをよく読んでね' : '状況を確認して適切な判断を'}
                    </span>
                  </div>

                  {/* 状況（シナリオ）説明：平仮名部分のバグをここで解決 */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed shadow-sm">
                    <p className="font-bold text-slate-800 mb-1">
                      {gameState.ageGroup === 'elementary' ? '【いまの状況】' : '【現在の状況】'}
                    </p>
                    {activeTexts.scenario}
                  </div>

                  {/* 擬似投稿プレビュー */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 relative shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white select-none shadow-sm">
                        Me
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {gameState.ageGroup === 'elementary' ? 'わたし' : '私 (発信アカウント)'}
                        </div>
                        <div className="text-[9px] text-slate-400">@newbie_creator</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed font-sans">
                      {currentQuestion.postText}
                    </div>

                    {/* フッターアクションバー（SNS風） */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 border-t border-slate-100 pt-2 select-none font-bold">
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {gameState.ageGroup === 'elementary' ? 'シェア' : '共有'}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {gameState.ageGroup === 'elementary' ? 'いいね' : 'いいね'}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {gameState.ageGroup === 'elementary' ? '全員に見せる' : '全員に公開'}</span>
                    </div>
                  </div>

                  {/* 選択肢セクション */}
                  <AnimatePresence mode="wait">
                    {!gameState.showExplanation ? (
                      <motion.div
                        key="choices"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2 pt-2"
                      >
                        <p className="text-[11px] font-bold text-slate-500 px-1">
                          {gameState.ageGroup === 'elementary' ? 'どうやってとうこうする？' : 'どのように対応しますか？'}
                        </p>
                        {currentQuestion.choices.map((choice) => (
                          <button
                            key={choice.id}
                            id={`choice-${choice.id}`}
                            onClick={() => handleSelectChoice(choice.id)}
                            className="w-full text-left text-xs bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 leading-relaxed transition-all transform hover:scale-[1.01] active:scale-[0.99] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                          >
                            {getChoiceText(choice)}
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      // 解説・結果フィードバック
                      <motion.div
                        key="explanation"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 pt-2"
                      >
                        {selectedChoice && (
                          <div className={`p-4 rounded-2xl border ${
                            selectedChoice.flameChange === 0 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                              : selectedChoice.flameChange > 30 
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : 'bg-orange-50 border-orange-200 text-orange-800'
                          }`}>
                            <div className="flex items-center gap-2 font-bold text-sm mb-2">
                              {selectedChoice.flameChange === 0 ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <span>
                                    {gameState.ageGroup === 'elementary' ? '大せいかい！安全な投稿！' : '大正解！完全にクリーンな投稿！'}
                                  </span>
                                </>
                              ) : selectedChoice.flameChange > 30 ? (
                                <>
                                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                  <span>
                                    {gameState.ageGroup === 'elementary' ? 'あぶない！炎上するよ！' : '大炎上のリスク発生！'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                                  <span>
                                    {gameState.ageGroup === 'elementary' ? '注意！すこし危ないかも' : '要注意！リスクを含んでいます'}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* 変化パラメータ */}
                            <div className="flex gap-4 text-[10px] font-bold font-mono mb-3 bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/50 w-fit">
                              <div>
                                {gameState.ageGroup === 'elementary' ? 'えんじょう:' : '炎上度変化:'} 
                                <span className={`font-extrabold ml-1 ${selectedChoice.flameChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {selectedChoice.flameChange > 0 ? `+${selectedChoice.flameChange}%` : '±0%'}
                                </span>
                              </div>
                              <div>
                                {gameState.ageGroup === 'elementary' ? 'フォロワー:' : 'フォロワー数:'} 
                                <span className={`font-extrabold ml-1 ${selectedChoice.followerChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {selectedChoice.followerChange >= 0 ? `+${selectedChoice.followerChange}人` : `${selectedChoice.followerChange}人`}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs leading-relaxed text-slate-700">
                              {getExplanationText(selectedChoice)}
                            </p>
                          </div>
                        )}

                        <button
                          id="next-question-btn"
                          onClick={handleNext}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs shadow-md"
                        >
                          {gameState.currentQuestionIndex + 1 >= activeQuestions.length ? '結果発表へ' : '次の投稿を判定する'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PhoneFrame>
      </div>
    </div>
  );
}
