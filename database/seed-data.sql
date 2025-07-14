-- Insert sample categories
INSERT INTO quiz_categories (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '과학', '자연과학과 관련된 상식 퀴즈'),
  ('550e8400-e29b-41d4-a716-446655440002', '역사', '한국사와 세계사 관련 퀴즈'),
  ('550e8400-e29b-41d4-a716-446655440003', '일반상식', '일상생활 관련 기본 상식'),
  ('550e8400-e29b-41d4-a716-446655440004', '동물', '동물에 대한 재미있는 사실들');

-- Insert sample quizzes for children (OX)
INSERT INTO quizzes (id, category_id, question, quiz_type, difficulty, target_audience, explanation) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '펭귄은 날 수 있다.', 'ox', 'easy', 'child', '펭귄은 날 수 없습니다. 펭귄은 날개가 있지만 하늘을 나는 대신 물속에서 헤엄치는 데 사용합니다.'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '무지개는 7가지 색으로 이루어져 있다.', 'ox', 'easy', 'child', '맞습니다! 무지개는 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라의 7가지 색으로 이루어져 있습니다.'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '하루는 정확히 24시간이다.', 'ox', 'medium', 'child', '거의 맞지만, 정확히는 아닙니다. 하루는 약 23시간 56분 4초입니다. 그래서 4년마다 윤년이 있는 것입니다.');

-- Insert answers for OX quizzes
INSERT INTO quiz_answers (quiz_id, answer_text, is_correct) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'X', true),
  ('650e8400-e29b-41d4-a716-446655440001', 'O', false),
  ('650e8400-e29b-41d4-a716-446655440002', 'O', true),
  ('650e8400-e29b-41d4-a716-446655440002', 'X', false),
  ('650e8400-e29b-41d4-a716-446655440003', 'X', true),
  ('650e8400-e29b-41d4-a716-446655440003', 'O', false);

-- Insert sample quizzes for adults (subjective)
INSERT INTO quizzes (id, category_id, question, quiz_type, difficulty, target_audience, explanation) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '조선을 건국한 왕은 누구인가?', 'subjective', 'easy', 'adult', '이성계(태조)가 1392년에 조선을 건국했습니다. 그는 고려 말기의 무신으로 위화도 회군을 통해 권력을 잡고 새로운 왕조를 열었습니다.'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '지구에서 가장 가까운 항성은 무엇인가?', 'subjective', 'medium', 'adult', '태양입니다. 태양은 지구에서 약 1억 5천만 km 떨어진 가장 가까운 항성으로, 우리 태양계의 중심입니다.'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '한국의 수도는 어디인가?', 'subjective', 'easy', 'adult', '서울(서울특별시)입니다. 서울은 조선시대부터 현재까지 600년 이상 한국의 수도 역할을 하고 있습니다.');

-- Insert answers for subjective quizzes
INSERT INTO quiz_answers (quiz_id, answer_text, is_correct) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '이성계', true),
  ('750e8400-e29b-41d4-a716-446655440001', '태조', true),
  ('750e8400-e29b-41d4-a716-446655440002', '태양', true),
  ('750e8400-e29b-41d4-a716-446655440003', '서울', true),
  ('750e8400-e29b-41d4-a716-446655440003', '서울특별시', true);