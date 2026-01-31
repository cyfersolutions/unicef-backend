import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface QuestionSubmissionJob {
  lessonQuestionId: string;
  vaccinatorId: string;
  answer: any;
  questionId: string;
  questionXp: number;
  isCorrect: boolean;
  timestamp: Date;
}

export interface StreakProgressJob {
  streakProgressId: string;
  date: string;
  vaccinatorId: string;
}

export interface DailyGoalProgressJob {
  dailyGoalProgressId: string;
  userValue: number;
  vaccinatorId: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('question-submission')
    private questionSubmissionQueue: Queue<QuestionSubmissionJob>,
    @InjectQueue('streak-progress')
    private streakProgressQueue: Queue<StreakProgressJob>,
    @InjectQueue('daily-goal-progress')
    private dailyGoalProgressQueue: Queue<DailyGoalProgressJob>,
  ) {}

  async addQuestionSubmission(job: QuestionSubmissionJob) {
    return this.questionSubmissionQueue.add('process-question', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addStreakProgress(job: StreakProgressJob) {
    return this.streakProgressQueue.add('process-streak', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addDailyGoalProgress(job: DailyGoalProgressJob) {
    return this.dailyGoalProgressQueue.add('process-daily-goal', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}

