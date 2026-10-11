'use strict';

const Roadmap              = require('../models/Roadmap');
const analyticsService     = require('./analyticsService');
const roadmapPromptBuilder = require('../utils/roadmapPromptBuilder');
const responseParser       = require('../utils/responseParser');
const AppError             = require('../utils/AppError');
const env                  = require('../config/env');

const roadmapService = {
  async generateRoadmap(userId) {
    const [overview, topics, companies, breakdown] = await Promise.all([
      analyticsService.getOverview(userId),
      analyticsService.getTopicAnalysis(userId),
      analyticsService.getCompanyStats(userId),
      analyticsService.getDifficultyBreakdown(userId),
    ]);

    if ((overview.totalSessions || 0) < 1) {
      throw AppError.badRequest(
        'Complete at least 1 interview before generating a roadmap. ' +
        'Your roadmap needs performance data to be personalised.'
      );
    }

    const messages = roadmapPromptBuilder.buildRoadmapPrompt({
      overview, topics, companies, breakdown,
    });

 // ── Step 4: Call AI ──────────────────────────────────────────────────────
// ── Step 4: Call AI ──────────────────────────────────────────────────────
let rawResponse;

if (env.USE_AI_MOCK) {
  const weakNames   = (topics?.weak  || []).map(t => t.topic);
  const primaryWeak = weakNames[0] || 'Algorithms';
  const secondWeak  = weakNames[1] || 'System Design';
  const avgScore    = overview?.avgOverallScore || 5;
  const sessions    = overview?.totalSessions   || 1;

  const mockRoadmap = {
    title:          `${sessions}-Session Analysis: Your Personalised Interview Roadmap`,
    summary:        `Based on your ${sessions} completed interview${sessions !== 1 ? 's' : ''} with an average score of ${avgScore}/10, this roadmap targets your weak areas. Focus on consistency over the next 4 weeks.`,
    targetScore:    Math.min(avgScore + 2, 10),
    estimatedWeeks: 4,
    phases: [
      {
        phase:     1,
        title:     'Foundation Repair',
        weekRange: 'Weeks 1–2',
        focus:     `Strengthen weak areas: ${primaryWeak}`,
        weeks: [
          {
            week:  1,
            theme: `Master ${primaryWeak} fundamentals`,
            goal:  `Solve 10 LeetCode problems in ${primaryWeak} with 7+ correct`,
            dailyTasks: [
              { day: 'Monday',    task: `Study ${primaryWeak} theory and patterns`,       duration: '90 minutes', category: 'technical',     difficulty: 'easy',   resource: 'NeetCode.io Roadmap' },
              { day: 'Tuesday',   task: 'Solve 3 LeetCode Easy problems',                duration: '60 minutes', category: 'technical',     difficulty: 'easy',   resource: 'LeetCode #1 Two Sum, #217 Contains Duplicate, #242 Valid Anagram' },
              { day: 'Wednesday', task: 'Record yourself explaining a solution out loud', duration: '45 minutes', category: 'behavioral',    difficulty: 'easy',   resource: 'YouTube: How to explain code in interviews' },
              { day: 'Thursday',  task: 'Solve 2 LeetCode Medium problems',              duration: '90 minutes', category: 'technical',     difficulty: 'medium', resource: 'LeetCode #49 Group Anagrams, #347 Top K Frequent Elements' },
              { day: 'Friday',    task: 'Prepare 2 STAR behavioral stories',             duration: '60 minutes', category: 'behavioral',    difficulty: 'easy',   resource: 'Amazon Leadership Principles — levels.fyi' },
            ],
            weeklyChallenge: 'LeetCode #200 Number of Islands — solve without hints',
            successMetric:   '7+ correct solutions and can explain time complexity for each',
          },
          {
            week:  2,
            theme: `${secondWeak} introduction + ${primaryWeak} medium problems`,
            goal:  `Understand ${secondWeak} basics and solve 5 medium problems`,
            dailyTasks: [
              { day: 'Monday',    task: `Introduction to ${secondWeak}`,                  duration: '90 minutes', category: 'system-design', difficulty: 'medium', resource: 'Grokking the System Design Interview — Module 1' },
              { day: 'Tuesday',   task: '2 LeetCode Medium problems',                    duration: '90 minutes', category: 'technical',     difficulty: 'medium', resource: 'NeetCode 150 — Medium section' },
              { day: 'Wednesday', task: 'Mock interview practice (verbal explanation)',   duration: '60 minutes', category: 'practice',      difficulty: 'medium', resource: 'Pramp.com — free peer mock interviews' },
              { day: 'Thursday',  task: `${secondWeak} design exercise`,                 duration: '90 minutes', category: 'system-design', difficulty: 'medium', resource: 'YouTube: Design a URL Shortener' },
              { day: 'Friday',    task: 'Review all solutions and write explanations',   duration: '60 minutes', category: 'practice',      difficulty: 'easy',   resource: 'Your own notes' },
            ],
            weeklyChallenge: `Design a simple ${secondWeak} system in 45 minutes`,
            successMetric:   'Can explain any solution clearly in under 3 minutes',
          },
        ],
      },
      {
        phase:     2,
        title:     'Depth and Mock Practice',
        weekRange: 'Weeks 3–4',
        focus:     'Advanced problems and full mock interviews',
        weeks: [
          {
            week:  3,
            theme: 'Advanced topics + first full mock interview',
            goal:  'Complete 2 full mock interviews and score 7+',
            dailyTasks: [
              { day: 'Monday',    task: 'Hard LeetCode problem — attempt without hints', duration: '90 minutes', category: 'technical',     difficulty: 'hard',   resource: 'LeetCode Hard — your weak category filter' },
              { day: 'Tuesday',   task: 'Full mock interview — technical round',         duration: '60 minutes', category: 'practice',      difficulty: 'hard',   resource: 'interviewing.io — free anonymous mock interviews' },
              { day: 'Wednesday', task: 'Review mock feedback and take notes',           duration: '45 minutes', category: 'practice',      difficulty: 'medium', resource: 'interviewing.io feedback panel' },
              { day: 'Thursday',  task: 'System design mock — design Twitter feed',      duration: '90 minutes', category: 'system-design', difficulty: 'hard',   resource: 'Grokking System Design — Twitter chapter' },
              { day: 'Friday',    task: 'Behavioral round practice with timing',         duration: '60 minutes', category: 'behavioral',    difficulty: 'medium', resource: 'Big Interview — behavioral question bank' },
            ],
            weeklyChallenge: 'Full 45-minute mock interview simulating real conditions',
            successMetric:   'Mock interview score of 7/10 or higher',
          },
          {
            week:  4,
            theme: 'Polish, gaps, and final preparation',
            goal:  'Consistent 8+ scores and ready for real interviews',
            dailyTasks: [
              { day: 'Monday',    task: 'Review all weak areas from previous weeks',     duration: '90 minutes', category: 'technical',     difficulty: 'medium', resource: 'Your personal notes from weeks 1–3' },
              { day: 'Tuesday',   task: 'Company-specific question practice',            duration: '90 minutes', category: 'technical',     difficulty: 'medium', resource: 'LeetCode Company filter — your target companies' },
              { day: 'Wednesday', task: 'Final mock — behavioural + technical',          duration: '90 minutes', category: 'practice',      difficulty: 'hard',   resource: 'Pramp.com full interview' },
              { day: 'Thursday',  task: 'System design: your strongest case study',      duration: '60 minutes', category: 'system-design', difficulty: 'hard',   resource: 'Your own design doc + Excalidraw' },
              { day: 'Friday',    task: 'Light review, rest, and mental preparation',    duration: '30 minutes', category: 'practice',      difficulty: 'easy',   resource: 'Revisit your top 5 solutions' },
            ],
            weeklyChallenge: 'Apply to 3 target companies with confidence',
            successMetric:   'Feeling confident in technical, behavioral, and system design',
          },
        ],
      },
    ],
    keyResources: [
      { name: 'NeetCode 150',               type: 'platform', url: 'https://neetcode.io',         priority: 'must-have',   reason: `Covers all your weak areas including ${primaryWeak}` },
      { name: 'Grokking System Design',     type: 'course',   url: 'https://designgurus.io',      priority: 'must-have',   reason: `Critical for improving ${secondWeak} scores` },
      { name: 'interviewing.io',            type: 'platform', url: 'https://interviewing.io',     priority: 'recommended', reason: 'Free anonymous mock interviews with real engineers' },
      { name: 'Pramp',                      type: 'platform', url: 'https://pramp.com',           priority: 'recommended', reason: 'Peer-to-peer mock interview practice' },
      { name: 'Big Interview',              type: 'platform', url: 'https://biginterview.com',    priority: 'optional',    reason: 'Structured behavioral interview practice' },
    ],
    behavioralPlan: {
      focus:             'Communication clarity and STAR format consistency',
      starStories:       8,
      practiceFrequency: 'Every Wednesday and Friday for 30–45 minutes',
      topics:            ['Leadership', 'Conflict resolution', 'Tight deadlines', 'Technical decisions', 'Teamwork', 'Failure and learning', 'Impact and ownership', 'Cross-functional collaboration'],
    },
    mockInterviewSchedule: {
      startingWeek: 3,
      frequency:    'Twice per week (Tuesday technical, Thursday behavioral)',
      focus:        'Simulate real interview conditions — timed, no hints, explain out loud',
    },
  };

  rawResponse = JSON.stringify(mockRoadmap);

} else {
  const aiService = require('./aiService');
  rawResponse = await aiService.call(messages, {
    temperature: 0.4,
    max_tokens:  4000,
  });
}
console.log('rawResponse type:', typeof rawResponse);
console.log('rawResponse preview:', String(rawResponse).substring(0, 100));

    const parsed = responseParser.extractJSON(rawResponse);

    if (!parsed.title || !parsed.phases || !Array.isArray(parsed.phases)) {
      throw AppError.internal('AI returned an invalid roadmap structure. Please try again.');
    }

    const weeks = parsed.estimatedWeeks || parsed.phases.reduce(
      (sum, p) => sum + (p.weeks?.length || 0), 0
    );

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeks * 7);

    const analyticsSnapshot = {
      avgOverallScore: overview.avgOverallScore,
      avgTechnicalScore: overview.avgTechnicalScore,
      avgCommunicationScore: overview.avgCommunicationScore,
      avgDepthScore: overview.avgDepthScore,
      totalSessions: overview.totalSessions,
      weakTopics: (topics.weak || []).map(t => t.topic),
      strongTopics: (topics.strong || []).map(t => t.topic),
    };

    await Roadmap.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } }
    );

    const roadmap = await Roadmap.create({
      userId,
      analyticsSnapshot,
      title: parsed.title,
      summary: parsed.summary || '',
      targetScore: parsed.targetScore || 8,
      estimatedWeeks: weeks,
      phases: parsed.phases || [],
      keyResources: parsed.keyResources || [],
      behavioralPlan: parsed.behavioralPlan || {},
      mockInterviewSchedule: parsed.mockInterviewSchedule || {},
      rawData: parsed,
      targetDate,
      progressPct: 0,
    });

    return roadmap;
  },

  async getActiveRoadmap(userId) {
    const roadmap = await Roadmap.findOne({ userId, isActive: true })
      .sort({ createdAt: -1 });
    return roadmap;
  },

  async getRoadmapHistory(userId) {
    return Roadmap.find({ userId })
      .sort({ createdAt: -1 })
      .select('-rawData -phases.weeks.dailyTasks')
      .limit(10);
  },

  async markTaskComplete(userId, roadmapId, weekNum, dayName) {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw AppError.notFound('Roadmap not found');

    let taskFound = false;
    let totalTasks = 0;
    let doneTasks = 0;

    roadmap.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.dailyTasks.forEach(task => {
          totalTasks++;
          if (week.week === weekNum && task.day === dayName && !task.completed) {
            task.completed = true;
            task.completedAt = new Date();
            taskFound = true;
            doneTasks++;
          } else if (task.completed) {
            doneTasks++;
          }
        });
      });
    });

    if (!taskFound) throw AppError.notFound('Task not found or already completed');

    roadmap.progressPct = totalTasks > 0
      ? Math.round((doneTasks / totalTasks) * 100)
      : 0;

    await roadmap.save();
    return roadmap;
  },

  _getMockRoadmap(overview, topics) {
    return {};
  },
};

module.exports = roadmapService;