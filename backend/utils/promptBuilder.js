'use strict';

const COMPANY_STYLES = {
  google: {
    focus: 'algorithmic efficiency, scalability, clean code, and systems thinking',
    traits: 'Googleyness — collaboration, ambiguity tolerance, and impact at scale',
    formats: 'coding on whiteboard/doc, system design for billions of users, behavioural STAR',
  },
  amazon: {
    focus: 'leadership principles, customer obsession, ownership, and operational excellence',
    traits: 'data-driven decisions, frugality, and bias for action',
    formats: 'STAR behavioural tied to LPs, system design for AWS-scale, coding in any language',
  },
  microsoft: {
    focus: 'problem decomposition, code quality, and cross-team collaboration',
    traits: 'growth mindset, inclusive design, and customer empathy',
    formats: 'coding with explanation, design discussions, culture fit',
  },
  meta: {
    focus: 'product sense, move fast mentality, data structures for social graph problems',
    traits: 'impact, iteration speed, and boldness',
    formats: 'coding speed, system design for social scale, product/design questions',
  },
  default: {
    focus: 'technical depth, problem-solving approach, and communication clarity',
    traits: 'teamwork, adaptability, and continuous learning',
    formats: 'coding challenges, system design, and behavioral STAR questions',
  },
};

function getCompanyStyle(company) {
  const key = company.toLowerCase().trim();
  return COMPANY_STYLES[key] || {
    ...COMPANY_STYLES.default,
    focus: `${COMPANY_STYLES.default.focus} specific to ${company}'s domain`,
  };
}

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'EASY (Entry level)',
    experience: '0–1 years',
    instruction:
      'Focus on fundamental concepts, basic data structures, and simple algorithms. Questions should be answerable by a CS graduate with internship experience.',
    codeDepth:
      'straightforward implementations (reverse a string, find duplicates, basic sorting)',
    designDepth: 'small-scale design (design a to-do app, a basic REST API)',
  },
  medium: {
    label: 'MEDIUM (Mid level)',
    experience: '2–4 years',
    instruction:
      'Mix problem-solving with design thinking. Expect knowledge of common patterns, trade-offs, and real-world constraints.',
    codeDepth: 'moderate algorithms (trees, graphs, DP basics, sliding window)',
    designDepth:
      'moderate scale (design a URL shortener, a rate limiter, a notification system)',
  },
  hard: {
    label: 'HARD (Senior level)',
    experience: '5+ years',
    instruction:
      'Deep technical depth required. Questions should probe optimization, distributed systems, architectural trade-offs, and leadership under ambiguity.',
    codeDepth: 'complex algorithms (advanced DP, segment trees, concurrent programming)',
    designDepth:
      'large scale (design Twitter, YouTube, distributed database, consensus protocols)',
  },
};

const promptBuilder = {
  // promptBuilder.js — update buildQuestionsPrompt
// Add ragContext parameter and inject it into the system prompt

buildQuestionsPrompt({ company, jobRole, difficulty, count = 5, ragContext = '' }) {
  const style  = getCompanyStyle(company);
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

  const technicalCount    = Math.ceil(count * 0.5);
  const behavioralCount   = Math.floor(count * 0.3);
  const systemDesignCount = count - technicalCount - behavioralCount;

  /*
   * RAG CONTEXT INJECTION:
   * When ragContext is provided, we inject real interview questions
   * as examples BEFORE the generation instruction.
   * This grounds the AI in actual company interview patterns.
   *
   * Without RAG: AI generates from training data (may be outdated)
   * With RAG:    AI generates informed by real recent questions
   */
  const ragSection = ragContext
    ? `\nREAL ${company.toUpperCase()} INTERVIEW QUESTIONS (use as style reference):
${ragContext}

Generate NEW questions INSPIRED by the above examples — same difficulty,
same style, same company culture. Do NOT copy them directly.\n`
    : '';

  const systemPrompt = `You are a senior ${jobRole} interviewer at ${company} with 10+ years of hiring experience.

COMPANY CONTEXT:
${company} interviews focus on: ${style.focus}
Desired candidate traits: ${style.traits}
${ragSection}
DIFFICULTY: ${config.label}
Target experience: ${config.experience}
${config.instruction}

TASK: Generate exactly ${count} interview questions:
- ${technicalCount} technical questions
- ${behavioralCount} behavioral questions
- ${systemDesignCount} system design questions

You MUST respond with ONLY a valid JSON object. No markdown, no explanation.
{
  "questions": [
    {
      "text": "The full question text",
      "type": "technical" | "behavioral" | "system-design",
      "category": "Short category label",
      "orderIndex": 0
    }
  ]
}`;

  const userPrompt = `Generate ${count} ${difficulty} ${jobRole} interview questions for ${company}. Return only JSON.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt   },
  ];
},
buildEvaluationPrompt({ question, answer, company, jobRole, referenceContext }) {
  const style = getCompanyStyle(company);

  const rubrics = {
    technical: {
      technicalCriteria: `
TECHNICAL ACCURACY (0–10):
  9–10: Completely correct, optimal approach, handles all cases
  7–8:  Correct approach with minor inefficiencies or small gaps
  5–6:  Partially correct — right direction but missing key concepts
  3–4:  Some relevant knowledge but significant errors
  0–2:  Incorrect approach or fundamental misunderstanding`,

      communicationCriteria: `
COMMUNICATION (0–10):
  9–10: Crystal clear explanation, excellent structure, uses examples
  7–8:  Clear and mostly well-structured, minor clarity issues
  5–6:  Understandable but disorganised or uses poor terminology
  3–4:  Difficult to follow, vague or inconsistent
  0–2:  Unclear, incoherent or no explanation given`,

      depthCriteria: `
DEPTH (0–10):
  9–10: Discusses time/space complexity, edge cases, alternatives, and trade-offs
  7–8:  Covers most of the above with minor omissions
  5–6:  Goes slightly beyond surface but misses important considerations
  3–4:  Surface-level only, no complexity or edge case discussion
  0–2:  No depth whatsoever`,
    },

    behavioral: {
      technicalCriteria: `
TECHNICAL ACCURACY for behavioral (0–10) — measures STAR completeness:
  9–10: Perfect STAR structure — Situation, Task, Action, Result all clear and specific
  7–8:  Good STAR with one weak element
  5–6:  Partial STAR — some elements missing or unclear
  3–4:  Loose narrative without clear STAR structure
  0–2:  No structure, very generic or hypothetical answer`,

      communicationCriteria: `
COMMUNICATION (0–10):
  9–10: Compelling story, confident delivery, excellent vocabulary
  7–8:  Clear and professional with good word choice
  5–6:  Understandable but lacks polish or confidence signals
  3–4:  Disorganised or awkward delivery
  0–2:  Very hard to follow or extremely brief`,

      depthCriteria: `
DEPTH (0–10):
  9–10: Quantified results, shows self-awareness, ties to ${company} values (${style.traits})
  7–8:  Good impact with some reflection
  5–6:  Some impact mentioned but not quantified or reflected upon
  3–4:  Vague outcome, no reflection
  0–2:  No outcome mentioned, no insight shown`,
    },

    'system-design': {
      technicalCriteria: `
TECHNICAL ACCURACY (0–10):
  9–10: Sound architecture, correct component choices, production-aware
  7–8:  Good overall design with minor technical gaps
  5–6:  Correct direction but wrong or missing components
  3–4:  Some relevant knowledge but flawed architecture
  0–2:  Incorrect or no meaningful design`,

      communicationCriteria: `
COMMUNICATION (0–10):
  9–10: Systematic approach — clarifies requirements first, talks through design clearly
  7–8:  Mostly systematic with clear explanation
  5–6:  Somewhat structured but jumps around or skips steps
  3–4:  Disorganised, hard to follow the design thinking
  0–2:  Incoherent or no explanation`,

      depthCriteria: `
DEPTH (0–10):
  9–10: Discusses scale numbers, failure modes, CAP theorem, monitoring, cost
  7–8:  Addresses most depth areas with minor omissions
  5–6:  Some depth but misses failure handling or scalability specifics
  3–4:  Surface-level design, no trade-off discussion
  0–2:  No depth, no trade-offs considered`,
    },
  };

  const rubric = rubrics[question.type] || rubrics.technical;

  const groundingSection = referenceContext
    ? `\nREFERENCE CONTEXT (Use this to evaluate the answer accurately):\n${referenceContext}\n\nIMPORTANT: Do NOT expose or copy this reference context directly in your feedback. Use it only as a grading rubric.`
    : `\nNo specific company context provided. Evaluate based on general software engineering principles.`;

  const systemPrompt = `You are a senior ${jobRole} at ${company} conducting a technical interview evaluation.

QUESTION (${question.type.toUpperCase()} — ${question.category}):
"${question.text}"

${rubric.technicalCriteria}

${rubric.communicationCriteria}

${rubric.depthCriteria}

OVERALL SCORE CALCULATION:
overallScore = (technicalScore × 0.4) + (communicationScore × 0.3) + (depthScore × 0.3)
Round to 1 decimal place.

COMPANY CONTEXT:
At ${company}, interviewers value: ${style.traits}
Keep this in mind when evaluating cultural fit signals in the answer.
${groundingSection}

FEEDBACK GUIDELINES:
- feedback: 2–3 sentences. Reference the candidate's specific words.
- strengths: Be specific.
- improvements: Give 1–2 actionable improvements.
- suggestedAnswer: A brief 2–3 sentence ideal answer outline.

CRITICAL RULES:
- Score fairly.
- Return ONLY valid JSON.
- All scores must be numbers (0–10)

JSON SCHEMA:
{
  "technicalScore": <number 0-10>,
  "communicationScore": <number 0-10>,
  "depthScore": <number 0-10>,
  "overallScore": <number 0-10>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": "<specific things done well>",
  "improvements": "<1-2 actionable improvements>",
  "suggestedAnswer": "<brief ideal answer outline>"
}`;

  const userPrompt = `Candidate's answer:
"${answer || '[The candidate did not provide an answer — score accordingly]'}"

Evaluate this answer objectively and return only the JSON.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
},
};

module.exports = promptBuilder;