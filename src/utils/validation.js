import { body, param, query } from 'express-validator';

export const validateUserType = [
  body('user_type')
    .isIn(['child', 'adult'])
    .withMessage('User type must be either "child" or "adult"'),
];

export const validateQuizAnswer = [
  body('quiz_id')
    .notEmpty()
    .isUUID()
    .withMessage('Valid quiz ID is required'),
  body('user_answer')
    .notEmpty()
    .trim()
    .withMessage('Answer is required'),
  body('time_spent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer'),
];

export const validateQuizFilters = [
  query('target_audience')
    .optional()
    .isIn(['child', 'adult'])
    .withMessage('Invalid target audience'),
  query('quiz_type')
    .optional()
    .isIn(['ox', 'subjective'])
    .withMessage('Invalid quiz type'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
];

export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

export const validateUUID = (field) => [
  param(field)
    .isUUID()
    .withMessage(`Invalid ${field}`),
];