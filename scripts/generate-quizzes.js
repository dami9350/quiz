import { config } from 'dotenv';
import { supabase } from '../src/config/database.js';
import { generateQuizPrompt, parseQuizResponse } from '../src/utils/quiz-generator.js';
import Quiz from '../src/models/Quiz.js';

config();

const sampleQuizzes = {
  child: {
    ox: [
      {
        category: '동물',
        quizzes: [
          {
            question: '고양이는 개보다 수명이 더 길다.',
            answer: 'O',
            explanation: '일반적으로 고양이의 평균 수명은 12-18년으로, 개의 평균 수명인 10-13년보다 깁니다.'
          },
          {
            question: '펭귄은 북극에 산다.',
            answer: 'X',
            explanation: '펭귄은 남극과 남반구의 차가운 지역에 살며, 북극에는 살지 않습니다. 북극에는 북극곰이 삽니다.'
          },
          {
            question: '거미는 곤충이다.',
            answer: 'X',
            explanation: '거미는 곤충이 아니라 거미류입니다. 곤충은 다리가 6개이지만 거미는 다리가 8개입니다.'
          }
        ]
      },
      {
        category: '과학',
        quizzes: [
          {
            question: '물은 100도에서 끓는다.',
            answer: 'O',
            explanation: '물은 1기압에서 섭씨 100도에 끓습니다. 이것을 물의 끓는점이라고 합니다.'
          },
          {
            question: '번개는 소리보다 빠르다.',
            answer: 'O',
            explanation: '번개(빛)는 초속 30만km로 이동하고, 천둥(소리)은 초속 340m로 이동합니다. 그래서 번개가 먼저 보이고 천둥소리가 나중에 들립니다.'
          }
        ]
      }
    ]
  },
  adult: {
    subjective: [
      {
        category: '역사',
        quizzes: [
          {
            question: '대한민국의 첫 번째 대통령은 누구인가?',
            answers: ['이승만'],
            explanation: '이승만은 1948년 대한민국 정부 수립과 함께 초대 대통령으로 선출되었습니다.'
          },
          {
            question: '임진왜란이 일어난 연도는?',
            answers: ['1592년', '1592'],
            explanation: '임진왜란은 1592년(선조 25년)에 일본이 조선을 침략하여 시작된 전쟁입니다.'
          },
          {
            question: '세종대왕이 한글을 창제한 연도는?',
            answers: ['1443년', '1443'],
            explanation: '세종대왕은 1443년에 훈민정음을 창제하고, 1446년에 반포했습니다.'
          }
        ]
      },
      {
        category: '일반상식',
        quizzes: [
          {
            question: '대한민국의 최남단 섬은?',
            answers: ['마라도'],
            explanation: '마라도는 제주도 남쪽에 위치한 대한민국 최남단의 섬입니다.'
          },
          {
            question: '태양계에서 가장 큰 행성은?',
            answers: ['목성'],
            explanation: '목성은 태양계에서 가장 큰 행성으로, 지구의 약 11배 크기입니다.'
          }
        ]
      }
    ]
  }
};

async function generateAndSaveQuizzes() {
  try {
    console.log('퀴즈 생성 시작...');
    
    const { data: categories } = await supabase
      .from('quiz_categories')
      .select('*');
    
    if (!categories || categories.length === 0) {
      console.error('카테고리를 찾을 수 없습니다.');
      return;
    }
    
    let totalCreated = 0;
    
    for (const audience of ['child', 'adult']) {
      const quizType = audience === 'child' ? 'ox' : 'subjective';
      
      for (const category of categories) {
        const categoryQuizzes = sampleQuizzes[audience]?.[quizType]?.find(
          c => c.category === category.name
        );
        
        if (categoryQuizzes) {
          for (const quizData of categoryQuizzes.quizzes) {
            const quiz = {
              category_id: category.id,
              question: quizData.question,
              quiz_type: quizType,
              target_audience: audience,
              explanation: quizData.explanation,
              difficulty: audience === 'child' ? 'easy' : 'medium',
              quiz_answers: []
            };
            
            if (quizType === 'ox') {
              quiz.quiz_answers = [
                {
                  answer_text: 'O',
                  is_correct: quizData.answer === 'O'
                },
                {
                  answer_text: 'X',
                  is_correct: quizData.answer === 'X'
                }
              ];
            } else {
              quiz.quiz_answers = quizData.answers.map(answer => ({
                answer_text: answer,
                is_correct: true
              }));
            }
            
            try {
              await Quiz.create(quiz);
              totalCreated++;
              console.log(`생성됨: ${quiz.question}`);
            } catch (error) {
              console.error(`퀴즈 생성 실패: ${error.message}`);
            }
          }
        }
      }
    }
    
    console.log(`\n총 ${totalCreated}개의 퀴즈가 생성되었습니다.`);
  } catch (error) {
    console.error('퀴즈 생성 중 오류:', error);
  }
}

generateAndSaveQuizzes();