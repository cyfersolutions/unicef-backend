import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaccinatorUnitGameProgress } from './entities/vaccinator-unit-game-progress.entity';
import { UnitGame } from './entities/unit-game.entity';
import { Game } from './entities/game.entity';
import { Unit } from '../units/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Vaccinator } from '../users/entities/vaccinator.entity';
import { SubmitGameProgressDto } from './dto/submit-game-progress.dto';
import { SubmitGameCompletionDto } from './dto/submit-game-completion.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { AssignGameToUnitLessonDto } from './dto/assign-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(UnitGame)
    private unitGameRepository: Repository<UnitGame>,
    @InjectRepository(VaccinatorUnitGameProgress)
    private vaccinatorUnitGameProgressRepository: Repository<VaccinatorUnitGameProgress>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
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

  async createGame(dto: CreateGameDto) {
    const game = this.gameRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      url: dto.url ?? null,
      isActive: dto.isActive ?? true,
    });

    const savedGame = await this.gameRepository.save(game);

    return {
      success: true,
      message: 'Game created successfully',
      data: savedGame,
    };
  }

  async updateGame(id: string, dto: UpdateGameDto) {
    const game = await this.gameRepository.findOne({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Update only provided fields
    if (dto.title !== undefined) game.title = dto.title;
    if (dto.description !== undefined) game.description = dto.description;
    if (dto.url !== undefined) game.url = dto.url;
    if (dto.isActive !== undefined) game.isActive = dto.isActive;

    const updatedGame = await this.gameRepository.save(game);

    return {
      success: true,
      message: 'Game updated successfully',
      data: updatedGame,
    };
  }

  async assignGameToUnitLesson(dto: AssignGameToUnitLessonDto) {
    // Validate game exists
    const game = await this.gameRepository.findOne({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Validate unit exists
    const unit = await this.unitRepository.findOne({
      where: { id: dto.unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${dto.unitId} not found`);
    }

    // Validate lesson exists
    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${dto.lessonId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.unitGameRepository.findOne({
      where: {
        gameId: dto.gameId,
        unitId: dto.unitId,
        lessonId: dto.lessonId,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Game is already assigned to this unit and lesson. Use update endpoint to modify the assignment.`,
      );
    }

    // Create new assignment
    const unitGame = this.unitGameRepository.create({
      gameId: dto.gameId,
      unitId: dto.unitId,
      lessonId: dto.lessonId,
      passingScore: dto.passingScore,
    });

    const savedUnitGame = await this.unitGameRepository.save(unitGame);

    // Load relations for response
    const assignment = await this.unitGameRepository.findOne({
      where: { id: savedUnitGame.id },
      relations: ['game', 'unit', 'lesson'],
    });

    return {
      success: true,
      message: 'Game assigned to unit and lesson successfully',
      data: {
        id: assignment?.id,
        game: {
          id: assignment?.game?.id,
          title: assignment?.game?.title,
          url: assignment?.game?.url,
        },
        unit: {
          id: assignment?.unit?.id,
          title: assignment?.unit?.title,
        },
        lesson: {
          id: assignment?.lesson?.id,
          title: assignment?.lesson?.title,
        },
        passingScore: assignment?.passingScore,
        createdAt: assignment?.createdAt,
        updatedAt: assignment?.updatedAt,
      },
    };
  }

  async submitGameCompletion(dto: SubmitGameCompletionDto, vaccinatorId: string) {
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
      where: { id: vaccinatorId },
    });

    if (!vaccinator) {
      throw new NotFoundException(`Vaccinator with ID ${vaccinatorId} not found`);
    }

    // Check if score meets passing score
    const isPassed = dto.score >= unitGame.passingScore;

    // Calculate XP earned
    const xpEarned = this.calculateXpEarned(dto.score, unitGame.passingScore, isPassed);

    // Check if this attempt already exists
    const existingProgress = await this.vaccinatorUnitGameProgressRepository.findOne({
      where: {
        unitGameId: dto.unitGameId,
        vaccinatorId,
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
      existingProgress.isCompleted = true; // Always set to true on completion
      existingProgress.xpEarned = xpEarned;
      gameProgress = await this.vaccinatorUnitGameProgressRepository.save(existingProgress);
    } else {
      // Create new progress
      gameProgress = this.vaccinatorUnitGameProgressRepository.create({
        unitGameId: dto.unitGameId,
        vaccinatorId,
        score: dto.score,
        attempt: dto.attempt,
        ratings: dto.ratings ?? null,
        otherFields: dto.otherFields ?? null,
        isPassed: isPassed,
        isCompleted: true, // Always set to true on completion
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
      message: 'Game completed successfully',
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
          url: savedProgress?.unitGame?.game?.url,
        },
        unit: {
          id: savedProgress?.unitGame?.unit?.id,
          title: savedProgress?.unitGame?.unit?.title,
        },
        lesson: {
          id: savedProgress?.unitGame?.lesson?.id,
          title: savedProgress?.unitGame?.lesson?.title,
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

