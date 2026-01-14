import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  MinLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RuleContext } from '../../common/enums/rule-context.enum';
import { XPRuleType } from '../../common/enums/xp-rule-type.enum';
import { ConditionOperator } from '../../common/enums/condition-operator.enum';

export class CreateRewardRuleDto {
  @ApiProperty({
    description: 'Name of the rule',
    example: 'Complete Lesson in 10-20 Minutes',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    description: 'Context where this rule applies',
    enum: RuleContext,
    example: RuleContext.LESSON,
  })
  @IsEnum(RuleContext, { message: 'Context must be a valid RuleContext enum value' })
  context: RuleContext;

  @ApiProperty({
    description: 'Entity ID if rule applies to specific lesson/unit/module, null for all',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Context entity ID must be a valid UUID' })
  contextEntityId?: string | null;

  @ApiProperty({
    description: 'Condition column name from the context table (e.g., "completion_time_minutes", "accuracy_percentage", "completion_percentage")',
    example: 'completion_time_minutes',
  })
  @IsString({ message: 'Condition must be a string' })
  @MinLength(1, { message: 'Condition must be at least 1 character long' })
  condition: string;

  @ApiProperty({
    description: 'Condition operator',
    enum: ConditionOperator,
    example: ConditionOperator.GREATER_THAN_OR_EQUAL,
  })
  @IsEnum(ConditionOperator, { message: 'Condition operator must be a valid ConditionOperator enum value' })
  conditionOperator: ConditionOperator;

  @ApiProperty({
    description: 'Numeric condition value',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Condition value int must be an integer' })
  conditionValueInt?: number | null;

  @ApiProperty({
    description: 'Maximum value for BETWEEN operator',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Condition value int max must be an integer' })
  @ValidateIf((o) => o.conditionOperator === ConditionOperator.BETWEEN)
  conditionValueIntMax?: number | null;

  @ApiProperty({
    description: 'UUID condition value',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Condition value UUID must be a valid UUID' })
  conditionValueUuid?: string | null;

  @ApiProperty({
    description: 'String condition value',
    example: 'completed',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Condition value string must be a string' })
  conditionValueString?: string | null;

  @ApiProperty({
    description: 'Fixed XP value to grant',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'XP value must be an integer' })
  @Min(0, { message: 'XP value must be at least 0' })
  xpValue?: number | null;

  @ApiProperty({
    description: 'Percentage of base XP (0-100)',
    example: 50,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt({ message: 'XP percentage must be an integer' })
  @Min(0, { message: 'XP percentage must be at least 0' })
  @Max(100, { message: 'XP percentage must be at most 100' })
  xpPercentage?: number | null;

  @ApiProperty({
    description: 'Type of XP rule',
    enum: XPRuleType,
    example: XPRuleType.BONUS,
  })
  @IsEnum(XPRuleType, { message: 'XP rule type must be a valid XPRuleType enum value' })
  xpRuleType: XPRuleType;

  @ApiProperty({
    description: 'Badge ID to award (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Badge ID must be a valid UUID' })
  badgeId?: string | null;

  @ApiProperty({
    description: 'Certificate ID to award (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Certificate ID must be a valid UUID' })
  certificateId?: string | null;

  @ApiProperty({
    description: 'Streak ID to award (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Streak ID must be a valid UUID' })
  streakId?: string | null;

  @ApiProperty({
    description: 'Daily goal ID to award (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Daily goal ID must be a valid UUID' })
  dailyGoalId?: string | null;

  @ApiProperty({
    description: 'Priority for rule evaluation (higher evaluated first)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Priority must be an integer' })
  priority?: number;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
