import { DataSource } from 'typeorm';
import { OnboardingQuestion } from '../onboarding/entities/onboarding-question.entity';

export async function seedOnboardingQuestions(dataSource: DataSource): Promise<void> {
  const onboardingQuestionRepository = dataSource.getRepository(OnboardingQuestion);

  const onboardingQuestions = [
    {
      questionText: 'What is your primary goal for using this vaccination training app?',
      questionImage: null,
      options: [
        'To learn proper vaccination protocols and procedures',
        'To improve my vaccination skills and knowledge',
        'To prepare for vaccination certification exams',
        'To stay updated with latest vaccination guidelines',
        'To practice and reinforce my existing knowledge',
      ],
      isActive: true,
    },
    {
      questionText: 'How much time can you commit to learning each day?',
      questionImage: null,
      options: [
        '5-10 minutes',
        '15-20 minutes',
        '30-45 minutes',
        '1 hour or more',
        'I prefer flexible learning without daily commitment',
      ],
      isActive: true,
    },
    {
      questionText: 'What is your current experience level with vaccination procedures?',
      questionImage: null,
      options: [
        'Beginner - I am new to vaccination procedures',
        'Intermediate - I have some experience with vaccinations',
        'Advanced - I have significant experience but want to improve',
        'Expert - I am experienced and want to stay updated',
      ],
      isActive: true,
    },
  ];

  for (const questionData of onboardingQuestions) {
    const existingQuestion = await onboardingQuestionRepository.findOne({
      where: { questionText: questionData.questionText },
    });

    if (!existingQuestion) {
      const question = onboardingQuestionRepository.create(questionData);
      await onboardingQuestionRepository.save(question);
      console.log(`✓ Created onboarding question: "${questionData.questionText.substring(0, 50)}..."`);
    } else {
      console.log(`- Onboarding question already exists: "${questionData.questionText.substring(0, 50)}..."`);
    }
  }
}

