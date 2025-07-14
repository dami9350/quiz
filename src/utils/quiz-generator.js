import dotenv from 'dotenv';

dotenv.config();

export const generateQuizPrompt = (category, targetAudience, quizType, count = 5) => {
  const audienceKorean = targetAudience === 'child' ? '어린이' : '성인';
  const quizTypeKorean = quizType === 'ox' ? 'OX' : '주관식';
  
  if (quizType === 'ox') {
    return `
다음 조건에 맞는 ${audienceKorean}용 OX 퀴즈를 ${count}개 생성해주세요:
- 카테고리: ${category}
- 난이도: ${targetAudience === 'child' ? '쉬움' : '보통'}
- 정답은 O와 X가 골고루 섞여있어야 함
- 각 문제마다 상세한 해설 포함

형식:
1. 문제: [문제 내용]
   정답: [O 또는 X]
   해설: [왜 그런지 자세한 설명]
`;
  } else {
    return `
다음 조건에 맞는 ${audienceKorean}용 주관식 퀴즈를 ${count}개 생성해주세요:
- 카테고리: ${category}
- 난이도: 보통
- 다양한 정답 형태 허용 (동의어, 다른 표현 등)
- 각 문제마다 상세한 해설 포함

형식:
1. 문제: [문제 내용]
   정답: [주요 정답], [대체 정답1], [대체 정답2]
   해설: [왜 그런지 자세한 설명]
`;
  }
};

export const parseQuizResponse = (response, quizType, targetAudience, categoryId) => {
  const quizzes = [];
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentQuiz = null;
  
  lines.forEach(line => {
    if (line.match(/^\d+\.\s*문제:/)) {
      if (currentQuiz) {
        quizzes.push(formatQuiz(currentQuiz, quizType, targetAudience, categoryId));
      }
      currentQuiz = {
        question: line.replace(/^\d+\.\s*문제:\s*/, '').trim()
      };
    } else if (line.match(/^\s*정답:/)) {
      if (currentQuiz) {
        currentQuiz.answer = line.replace(/^\s*정답:\s*/, '').trim();
      }
    } else if (line.match(/^\s*해설:/)) {
      if (currentQuiz) {
        currentQuiz.explanation = line.replace(/^\s*해설:\s*/, '').trim();
      }
    }
  });
  
  if (currentQuiz) {
    quizzes.push(formatQuiz(currentQuiz, quizType, targetAudience, categoryId));
  }
  
  return quizzes;
};

const formatQuiz = (quiz, quizType, targetAudience, categoryId) => {
  const baseQuiz = {
    category_id: categoryId,
    question: quiz.question,
    quiz_type: quizType,
    target_audience: targetAudience,
    explanation: quiz.explanation,
    difficulty: targetAudience === 'child' ? 'easy' : 'medium'
  };
  
  if (quizType === 'ox') {
    baseQuiz.quiz_answers = [
      {
        answer_text: 'O',
        is_correct: quiz.answer.toUpperCase() === 'O'
      },
      {
        answer_text: 'X',
        is_correct: quiz.answer.toUpperCase() === 'X'
      }
    ];
  } else {
    const answers = quiz.answer.split(',').map(a => a.trim());
    baseQuiz.quiz_answers = answers.map(answer => ({
      answer_text: answer,
      is_correct: true
    }));
  }
  
  return baseQuiz;
};