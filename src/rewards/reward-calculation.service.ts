import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RewardRule } from '../reward-rules/entities/reward-rule.entity';
import { RuleContext } from '../common/enums/rule-context.enum';
import { ConditionOperator } from '../common/enums/condition-operator.enum';
import { LessonProgress } from '../lessons/entities/lesson-progress.entity';
import { UnitProgress } from '../units/entities/unit-progress.entity';
import { ModuleProgress } from '../modules/entities/module-progress.entity';
import { LessonQuestionProgress } from '../lessons/entities/lesson-question-progress.entity';
import { VaccinatorBadge } from '../badges/entities/vaccinator-badge.entity';
import { VaccinatorCertificate } from '../certificates/entities/vaccinator-certificate.entity';
import { StreakProgress } from '../streaks/entities/streak-progress.entity';
import { DailyGoalProgress } from '../daily-goals/entities/daily-goal-progress.entity';

export interface CalculateRewardsInput {
  lessonQuestionId: string;
  vaccinatorId: string;
  questionXp: number;
  lessonProgress: LessonProgress | null;
  unitProgress: UnitProgress | null;
  moduleProgress: ModuleProgress | null;
  lessonId: string;
  unitId: string;
  moduleId: string;
  transactionManager?: any; // Optional EntityManager for transaction support
}

export interface CalculatedRewards {
  xp: number;
  badges: string[]; // Array of badge IDs awarded
  certificates: string[]; // Array of certificate IDs awarded
}

@Injectable()
export class RewardCalculationService {
  constructor(
    @InjectRepository(RewardRule)
    private rewardRuleRepository: Repository<RewardRule>,
    @InjectRepository(VaccinatorBadge)
    private vaccinatorBadgeRepository: Repository<VaccinatorBadge>,
    @InjectRepository(VaccinatorCertificate)
    private vaccinatorCertificateRepository: Repository<VaccinatorCertificate>,
  ) {}

  async calculateRewards(input: CalculateRewardsInput): Promise<CalculatedRewards> {
    const { lessonId, unitId, moduleId, questionXp, lessonProgress, unitProgress, moduleProgress, vaccinatorId } = input;

    // Get all active reward rules for LESSON, UNIT, and MODULE contexts
    const rewardRules = await this.rewardRuleRepository.find({
      where: [
        { context: RuleContext.LESSON, contextEntityId: lessonId, isActive: true },
        { context: RuleContext.LESSON, contextEntityId: IsNull(), isActive: true },
        { context: RuleContext.UNIT, contextEntityId: unitId, isActive: true },
        { context: RuleContext.UNIT, contextEntityId: IsNull(), isActive: true },
        { context: RuleContext.MODULE, contextEntityId: moduleId, isActive: true },
        { context: RuleContext.MODULE, contextEntityId: IsNull(), isActive: true },
      ],
      order: { priority: 'DESC' },
    });

    const rewards: CalculatedRewards = {
      xp: 0, // Start with 0, we'll add bonus XP from rules
      badges: [],
      certificates: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for date comparison

    // Process each rule
    for (const rule of rewardRules) {
      if (this.evaluateRule(rule, input)) {
        // Apply XP rewards
        if (rule.xpValue !== null) {
          rewards.xp += rule.xpValue;
        } else if (rule.xpPercentage !== null && rule.xpRuleType) {
          const baseXp = questionXp;
          const bonusXp = Math.floor((baseXp * rule.xpPercentage) / 100);
          rewards.xp += bonusXp;
        }

        // Award badge if rule has badgeId
        if (rule.badgeId) {
          const badgeAwarded = await this.awardBadge(vaccinatorId, rule.badgeId, today, input.transactionManager);
          if (badgeAwarded) {
            rewards.badges.push(rule.badgeId);
          }
        }

        // Award certificate if rule has certificateId
        if (rule.certificateId) {
          const certificateAwarded = await this.awardCertificate(vaccinatorId, rule.certificateId, today, input.transactionManager);
          if (certificateAwarded) {
            rewards.certificates.push(rule.certificateId);
          }
        }
      }
    }

    return rewards;
  }

  private async awardBadge(vaccinatorId: string, badgeId: string, date: Date, transactionManager?: any): Promise<boolean> {
    const badgeRepo = transactionManager ? transactionManager.getRepository(VaccinatorBadge) : this.vaccinatorBadgeRepository;

    // Check if badge already awarded to this vaccinator
    const existingBadge = await badgeRepo.findOne({
      where: {
        vaccinatorId,
        badgeId,
      },
    });

    if (existingBadge) {
      return false; // Badge already awarded
    }

    // Create new badge record
    const vaccinatorBadge = badgeRepo.create({
      vaccinatorId,
      badgeId,
      date,
    });

    await badgeRepo.save(vaccinatorBadge);
    return true;
  }

  private async awardCertificate(vaccinatorId: string, certificateId: string, date: Date, transactionManager?: any): Promise<boolean> {
    const certificateRepo = transactionManager ? transactionManager.getRepository(VaccinatorCertificate) : this.vaccinatorCertificateRepository;

    // Check if certificate already awarded to this vaccinator
    const existingCertificate = await certificateRepo.findOne({
      where: {
        vaccinatorId,
        certificateId,
      },
    });

    if (existingCertificate) {
      return false; // Certificate already awarded
    }

    // Create new certificate record
    const vaccinatorCertificate = certificateRepo.create({
      vaccinatorId,
      certificateId,
      date,
    });

    await certificateRepo.save(vaccinatorCertificate);
    return true;
  }

  private evaluateRule(rule: RewardRule, input: CalculateRewardsInput): boolean {
    // Get the progress entity based on rule context
    let progressEntity: LessonProgress | UnitProgress | ModuleProgress | null = null;

    switch (rule.context) {
      case RuleContext.LESSON:
        progressEntity = input.lessonProgress;
        break;
      case RuleContext.UNIT:
        progressEntity = input.unitProgress;
        break;
      case RuleContext.MODULE:
        progressEntity = input.moduleProgress;
        break;
      default:
        return false;
    }

    // If no progress entity exists, rule cannot be evaluated
    if (!progressEntity) {
      return false;
    }

    // Check if rule applies to specific entity or all entities
    if (rule.contextEntityId) {
      const entityId = this.getEntityId(rule.context, input);
      if (entityId !== rule.contextEntityId) {
        return false;
      }
    }

    // Get condition value from progress table column
    const conditionValue = this.getConditionValue(rule.condition, progressEntity);

    // Evaluate condition based on operator
    switch (rule.conditionOperator) {
      case ConditionOperator.EQUALS:
        return conditionValue === (rule.conditionValueInt ?? 0);
      case ConditionOperator.GREATER_THAN_OR_EQUAL:
        return conditionValue >= (rule.conditionValueInt || 0);
      case ConditionOperator.LESS_THAN_OR_EQUAL:
        return conditionValue <= (rule.conditionValueInt || 0);
      case ConditionOperator.BETWEEN:
        return (
          conditionValue >= (rule.conditionValueInt || 0) &&
          conditionValue <= (rule.conditionValueIntMax || Infinity)
        );
      default:
        return false;
    }
  }

  private getEntityId(context: RuleContext, input: CalculateRewardsInput): string {
    switch (context) {
      case RuleContext.LESSON:
        return input.lessonId;
      case RuleContext.UNIT:
        return input.unitId;
      case RuleContext.MODULE:
        return input.moduleId;
      default:
        return '';
    }
  }

  private getConditionValue(
    condition: string,
    progressEntity: LessonProgress | UnitProgress | ModuleProgress,
  ): number {
    // Get the value from the progress entity based on condition column name
    // The condition is a column name in the progress table (e.g., 'is_completed', 'mastery_level', 'xp_earned')
    const normalizedCondition = condition.toLowerCase().replace(/_/g, '');

    // Handle different progress entity types
    let value: any;

    if ('questionsCompleted' in progressEntity) {
      // LessonProgress
      const lessonProgress = progressEntity as LessonProgress;
      switch (normalizedCondition) {
        case 'iscompleted':
          value = lessonProgress.isCompleted;
          break;
        case 'masterylevel':
          value = lessonProgress.masteryLevel;
          break;
        case 'xpearned':
          value = lessonProgress.xpEarned;
          break;
        case 'questionscompleted':
          value = lessonProgress.questionsCompleted;
          break;
        default:
          return 0;
      }
    } else if ('lessonsCompleted' in progressEntity) {
      // UnitProgress
      const unitProgress = progressEntity as UnitProgress;
      switch (normalizedCondition) {
        case 'iscompleted':
          value = unitProgress.isCompleted;
          break;
        case 'masterylevel':
          value = unitProgress.masteryLevel;
          break;
        case 'xpearned':
          value = unitProgress.xpEarned;
          break;
        case 'lessonscompleted':
          value = unitProgress.lessonsCompleted;
          break;
        default:
          return 0;
      }
    } else if ('unitsCompleted' in progressEntity) {
      // ModuleProgress
      const moduleProgress = progressEntity as ModuleProgress;
      switch (normalizedCondition) {
        case 'iscompleted':
          value = moduleProgress.isCompleted;
          break;
        case 'masterylevel':
          value = moduleProgress.masteryLevel;
          break;
        case 'xpearned':
          value = moduleProgress.xpEarned;
          break;
        case 'unitscompleted':
          value = moduleProgress.unitsCompleted;
          break;
        default:
          return 0;
      }
    } else {
      return 0;
    }

    // Convert boolean to number if needed
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    // Convert number to number (handles decimal)
    if (typeof value === 'number') {
      return value;
    }

    return 0;
  }

  async calculateStreakRewards(input: {
    streakProgressId: string;
    vaccinatorId: string;
    streakId: string;
    streakProgress: StreakProgress;
    transactionManager?: any;
  }): Promise<CalculatedRewards> {
    const { streakId, vaccinatorId, streakProgress, transactionManager } = input;

    // Get all active reward rules for STREAK context
    const rewardRules = await this.rewardRuleRepository.find({
      where: [
        { context: RuleContext.STREAK, contextEntityId: streakId, isActive: true },
        { context: RuleContext.STREAK, contextEntityId: IsNull(), isActive: true },
      ],
      order: { priority: 'DESC' },
    });

    const rewards: CalculatedRewards = {
      xp: 0,
      badges: [],
      certificates: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process each rule
    for (const rule of rewardRules) {
      if (this.evaluateStreakRule(rule, streakProgress, streakId)) {
        // Apply XP rewards
        if (rule.xpValue !== null) {
          rewards.xp += rule.xpValue;
        } else if (rule.xpPercentage !== null && rule.xpRuleType) {
          // For streaks, base XP could be current streak value
          const baseXp = streakProgress.currentStreakValue;
          const bonusXp = Math.floor((baseXp * rule.xpPercentage) / 100);
          rewards.xp += bonusXp;
        }

        // Award badge if rule has badgeId
        if (rule.badgeId) {
          const badgeAwarded = await this.awardBadge(vaccinatorId, rule.badgeId, today, transactionManager);
          if (badgeAwarded) {
            rewards.badges.push(rule.badgeId);
          }
        }

        // Award certificate if rule has certificateId
        if (rule.certificateId) {
          const certificateAwarded = await this.awardCertificate(
            vaccinatorId,
            rule.certificateId,
            today,
            transactionManager,
          );
          if (certificateAwarded) {
            rewards.certificates.push(rule.certificateId);
          }
        }
      }
    }

    return rewards;
  }

  private evaluateStreakRule(rule: RewardRule, streakProgress: StreakProgress, streakId: string): boolean {
    // Check if rule applies to specific streak or all streaks
    if (rule.contextEntityId && rule.contextEntityId !== streakId) {
      return false;
    }

    // Get condition value from streak progress table column
    const conditionValue = this.getStreakConditionValue(rule.condition, streakProgress);

    // Evaluate condition based on operator
    switch (rule.conditionOperator) {
      case ConditionOperator.EQUALS:
        return conditionValue === (rule.conditionValueInt ?? 0);
      case ConditionOperator.GREATER_THAN_OR_EQUAL:
        return conditionValue >= (rule.conditionValueInt || 0);
      case ConditionOperator.LESS_THAN_OR_EQUAL:
        return conditionValue <= (rule.conditionValueInt || 0);
      case ConditionOperator.BETWEEN:
        return (
          conditionValue >= (rule.conditionValueInt || 0) &&
          conditionValue <= (rule.conditionValueIntMax || Infinity)
        );
      default:
        return false;
    }
  }

  private getStreakConditionValue(condition: string, streakProgress: StreakProgress): number {
    const normalizedCondition = condition.toLowerCase().replace(/_/g, '');

    switch (normalizedCondition) {
      case 'isachieved':
        return streakProgress.isAchieved ? 1 : 0;
      case 'inprogress':
        return streakProgress.inProgress ? 1 : 0;
      case 'currentstreakvalue':
      case 'currentstreak':
        return streakProgress.currentStreakValue;
      default:
        return 0;
    }
  }

  async calculateDailyGoalRewards(input: {
    dailyGoalProgressId: string;
    vaccinatorId: string;
    goalId: string;
    dailyGoalProgress: DailyGoalProgress;
    transactionManager?: any;
  }): Promise<CalculatedRewards> {
    const { goalId, vaccinatorId, dailyGoalProgress, transactionManager } = input;

    // Get all active reward rules for DAILY_GOAL context
    const rewardRules = await this.rewardRuleRepository.find({
      where: [
        { context: RuleContext.DAILY_GOAL, contextEntityId: goalId, isActive: true },
        { context: RuleContext.DAILY_GOAL, contextEntityId: IsNull(), isActive: true },
      ],
      order: { priority: 'DESC' },
    });

    const rewards: CalculatedRewards = {
      xp: 0,
      badges: [],
      certificates: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process each rule
    for (const rule of rewardRules) {
      if (this.evaluateDailyGoalRule(rule, dailyGoalProgress, goalId)) {
        // Apply XP rewards
        if (rule.xpValue !== null) {
          rewards.xp += rule.xpValue;
        } else if (rule.xpPercentage !== null && rule.xpRuleType) {
          // For daily goals, base XP could be current goal value or goal value
          const baseXp = dailyGoalProgress.goalValue;
          const bonusXp = Math.floor((baseXp * rule.xpPercentage) / 100);
          rewards.xp += bonusXp;
        }

        // Award badge if rule has badgeId
        if (rule.badgeId) {
          const badgeAwarded = await this.awardBadge(vaccinatorId, rule.badgeId, today, transactionManager);
          if (badgeAwarded) {
            rewards.badges.push(rule.badgeId);
          }
        }

        // Award certificate if rule has certificateId
        if (rule.certificateId) {
          const certificateAwarded = await this.awardCertificate(
            vaccinatorId,
            rule.certificateId,
            today,
            transactionManager,
          );
          if (certificateAwarded) {
            rewards.certificates.push(rule.certificateId);
          }
        }
      }
    }

    return rewards;
  }

  private evaluateDailyGoalRule(rule: RewardRule, dailyGoalProgress: DailyGoalProgress, goalId: string): boolean {
    // Check if rule applies to specific goal or all goals
    if (rule.contextEntityId && rule.contextEntityId !== goalId) {
      return false;
    }

    // Get condition value from daily goal progress table column
    const conditionValue = this.getDailyGoalConditionValue(rule.condition, dailyGoalProgress);

    // Evaluate condition based on operator
    switch (rule.conditionOperator) {
      case ConditionOperator.EQUALS:
        return conditionValue === (rule.conditionValueInt ?? 0);
      case ConditionOperator.GREATER_THAN_OR_EQUAL:
        return conditionValue >= (rule.conditionValueInt || 0);
      case ConditionOperator.LESS_THAN_OR_EQUAL:
        return conditionValue <= (rule.conditionValueInt || 0);
      case ConditionOperator.BETWEEN:
        return (
          conditionValue >= (rule.conditionValueInt || 0) &&
          conditionValue <= (rule.conditionValueIntMax || Infinity)
        );
      default:
        return false;
    }
  }

  private getDailyGoalConditionValue(condition: string, dailyGoalProgress: DailyGoalProgress): number {
    const normalizedCondition = condition.toLowerCase().replace(/_/g, '');

    switch (normalizedCondition) {
      case 'isachieved':
        return dailyGoalProgress.isAchieved ? 1 : 0;
      case 'inprogress':
        return dailyGoalProgress.inProgress ? 1 : 0;
      case 'currentgoalvalue':
      case 'currentgoal':
        return dailyGoalProgress.currentGoalValue;
      case 'goalvalue':
      case 'goal':
      case 'threshold':
        return dailyGoalProgress.goalValue;
      default:
        return 0;
    }
  }
}

