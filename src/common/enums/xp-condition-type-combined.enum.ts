// Combined enum for XP condition types
// Includes BaseConditionType and XpConditionType values
export enum XpConditionTypeCombined {
  // From BaseConditionType
  COMPLETION = 'COMPLETION',
  ACCURACY_PERCENTAGE = 'ACCURACY_PERCENTAGE',
  MASTERY_PERCENTAGE = 'MASTERY_PERCENTAGE',
  STREAK_DAYS = 'STREAK_DAYS',
  // From XpConditionType
  TIME_MINUTES = 'TIME_MINUTES',
  TIME_SECONDS = 'TIME_SECONDS',
}

