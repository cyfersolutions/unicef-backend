import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaccinatorUnitGameProgress } from './entities/vaccinator-unit-game-progress.entity';
import { UnitGame } from './entities/unit-game.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { SubmitGameProgressDto } from './dto/submit-game-progress.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(VaccinatorUnitGameProgress)
    private vaccinatorUnitGameProgressRepository: Repository<VaccinatorUnitGameProgress>,
    @InjectRepository(UnitGame)
    private unitGameRepository: Repository<UnitGame>,
    @InjectRepository(Vaccinator)
    private vaccinatorRepository: Repository<Vaccinator>,
  ) {}

  async submitGameProgress(dto: SubmitGameProgressDto) {
    // Validate unit game exists
    const unitGame = await this.unitGameRepository.findOne({
      where: { id: dto.unitGameId },
      relations: ['game', 'unit', 'lesson'],
    });

    if (!unitGame) {
      throw new NotFoundException(`Unit game with ID ${dto.unitGameId} not found`);
    }

    // Validate vaccinator exists
    const vaccinator = await this.vaccinatorRepository.findOne({
      where: { id: dto.vaccinatorId },
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${dto.vaccinatorId} not found`);
    }

    // Check if score meets passing score
    const isPassed = dto.isPassed && dto.score >= unitGame.passingScore;

    // Calculate XP earned (you can customize this logic)
    const xpEarned = this.calculateXpEarned(dto.score, unitGame.passingScore, isPassed);

    // Check if this attempt already exists
    const existingProgress = await this.vaccinatorUnitGameProgressRepository.findOne({
      where: {
        unitGameId: dto.unitGameId,
        vaccinatorId: dto.vaccinatorId,
        attempt: dto.attempt,
      },
    });

    let gameProgress: VaccinatorUnitGameProgress;

    if (existingProgress) {
      // Update existing progress
      existingProgress.score = dto.score;
      existingProgress.ratings = dto.ratings ?? null;
      existingProgress.otherFields = dto.otherFields ?? null;
      existingProgress.isPassed = isPassed;
      existingProgress.isCompleted = true;
      existingProgress.xpEarned = xpEarned;
      gameProgress = await this.vaccinatorUnitGameProgressRepository.save(existingProgress);
    } else {
      // Create new progress
      gameProgress = this.vaccinatorUnitGameProgressRepository.create({
        unitGameId: dto.unitGameId,
        vaccinatorId: dto.vaccinatorId,
        score: dto.score,
        attempt: dto.attempt,
        ratings: dto.ratings ?? null,
        otherFields: dto.otherFields ?? null,
        isPassed: isPassed,
        isCompleted: true,
        xpEarned: xpEarned,
      });

      gameProgress = await this.vaccinatorUnitGameProgressRepository.save(gameProgress);
    }

    // Load relations for response
    const savedProgress = await this.vaccinatorUnitGameProgressRepository.findOne({
      where: { id: gameProgress.id },
      relations: ['unitGame', 'unitGame.game', 'unitGame.unit', 'vaccinator'],
    });

    return {
      success: true,
      message: 'Game progress saved successfully',
      data: {
        id: savedProgress?.id,
        unitGameId: savedProgress?.unitGameId,
        vaccinatorId: savedProgress?.vaccinatorId,
        score: savedProgress?.score,
        attempt: savedProgress?.attempt,
        ratings: savedProgress?.ratings,
        otherFields: savedProgress?.otherFields,
        isCompleted: savedProgress?.isCompleted,
        isPassed: savedProgress?.isPassed,
        xpEarned: savedProgress?.xpEarned,
        game: {
          id: savedProgress?.unitGame?.game?.id,
          title: savedProgress?.unitGame?.game?.title,
        },
        unit: {
          id: savedProgress?.unitGame?.unit?.id,
        },
        createdAt: savedProgress?.createdAt,
        updatedAt: savedProgress?.updatedAt,
      },
    };
  }

  private calculateXpEarned(score: number, passingScore: number, isPassed: boolean): number {
    // Base XP calculation logic
    // You can customize this based on your requirements
    if (!isPassed) {
      return Math.floor(score / 10); // Small XP even if not passed
    }

    // Bonus XP for passing
    const baseXp = passingScore / 10;
    const bonusXp = (score - passingScore) / 10;
    return Math.floor(baseXp + bonusXp);
  }
}

