import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RuleContext } from '../../common/enums/rule-context.enum';
import { XPRuleType } from '../../common/enums/xp-rule-type.enum';
import { ConditionOperator } from '../../common/enums/condition-operator.enum';
import { Badge } from '../../badges/entities/badge.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { Streak } from '../../streaks/entities/streak.entity';
import { DailyGoal } from '../../daily-goals/entities/daily-goal.entity';

@Entity('rules')
export class RewardRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: RuleContext,
    nullable: false,
  })
  context: RuleContext;

  @Column({ type: 'uuid', nullable: true, name: 'context_entity_id' })
  contextEntityId: string | null;

  @Column({ type: 'varchar', nullable: false })
  condition: string;

  @Column({
    type: 'enum',
    enum: ConditionOperator,
    nullable: false,
    name: 'condition_operator',
  })
  conditionOperator: ConditionOperator;

  @Column({ type: 'int', nullable: true, name: 'condition_value_int' })
  conditionValueInt: number | null;

  @Column({ type: 'int', nullable: true, name: 'condition_value_int_max' })
  conditionValueIntMax: number | null;

  @Column({ type: 'uuid', nullable: true, name: 'condition_value_uuid' })
  conditionValueUuid: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'condition_value_string' })
  conditionValueString: string | null;

  @Column({ type: 'int', nullable: true, name: 'xp_value' })
  xpValue: number | null;

  @Column({ type: 'int', nullable: true, name: 'xp_percentage' })
  xpPercentage: number | null;

  @Column({
    type: 'enum',
    enum: XPRuleType,
    nullable: false,
    name: 'xp_rule_type',
  })
  xpRuleType: XPRuleType;

  @Column({ type: 'uuid', nullable: true, name: 'badge_id' })
  badgeId: string | null;

  @ManyToOne(() => Badge, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge | null;

  @Column({ type: 'uuid', nullable: true, name: 'certificate_id' })
  certificateId: string | null;

  @ManyToOne(() => Certificate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'certificate_id' })
  certificate: Certificate | null;

  @Column({ type: 'uuid', nullable: true, name: 'streak_id' })
  streakId: string | null;

  @ManyToOne(() => Streak, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'streak_id' })
  streak: Streak | null;

  @Column({ type: 'uuid', nullable: true, name: 'daily_goal_id' })
  dailyGoalId: string | null;

  @ManyToOne(() => DailyGoal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'daily_goal_id' })
  dailyGoal: DailyGoal | null;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
