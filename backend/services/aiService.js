// backend/services/aiService.js
'use strict';

const { GoogleGenerativeAI } = require("@google/generative-ai");

const env            = require('../config/env');
const promptBuilder  = require('../utils/promptBuilder');
const responseParser = require('../utils/responseParser');
const AppError       = require('../utils/AppError');

class AIService {

  constructor() {
    if (env.AI_PROVIDER === 'gemini') {
      this.gemini   = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      this.provider = 'gemini';
    } else if (env.AI_PROVIDER === 'openai') {
      const OpenAI  = require('openai');
      this.openai   = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      this.provider = 'openai';
    } else {
      throw new Error(`Unknown AI_PROVIDER: ${env.AI_PROVIDER}`);
    }
    console.log(`✅  AI Service initialised with provider: ${this.provider}`);
  }

  async callGemini(messages, options = {}) {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = this.gemini.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature:      options.temperature ?? 0.7,
            maxOutputTokens:  options.max_tokens  ?? 2000,
            responseMimeType: 'application/json',
          },
        });

        const prompt = messages
          .map(m => `${m.role.toUpperCase()}:\n${m.content}`)
          .join("\n\n");

        const result   = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

      } catch (error) {
        const isRateLimit = error.status === 429 ||
                            error.message?.includes('429') ||
                            error.message?.includes('quota') ||
                            error.message?.includes('rate');

        if (isRateLimit && attempt < maxRetries - 1) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500), 5000);
          console.warn(`⚠️  Gemini rate limit hit. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }

        if (isRateLimit) {
          throw AppError.tooMany('AI rate limit reached. Please wait 1 minute and try again.');
        }

        if (error.status === 400) throw AppError.badRequest(`Gemini error: ${error.message}`);
        if (error.status === 403) throw AppError.unauthorized('Invalid Gemini API key.');
        throw AppError.internal(`Gemini error: ${error.message}`);
      }
    }
  }

  async callOpenAI(messages, options = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model:           'gpt-4o-mini',
        messages,
        temperature:     options.temperature ?? 0.7,
        max_tokens:      options.max_tokens  ?? 2000,
        response_format: { type: 'json_object' },
      });
      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 401) throw AppError.unauthorized('Invalid OpenAI API key.');
      if (error.status === 429) throw AppError.tooMany('OpenAI rate limit exceeded.');
      throw AppError.internal(`OpenAI error: ${error.message}`);
    }
  }

  async call(messages, options = {}) {
    if (this.provider === 'gemini') return this.callGemini(messages, options);
    return this.callOpenAI(messages, options);
  }

// backend/services/aiService.js — replace generateQuestions method

async generateQuestions({ company, jobRole, difficulty, count = 5 }) {

  // MOCK MODE
  if (env.USE_AI_MOCK === 'true') {
    return [
      { text: `At ${company}, how would you design a distributed cache?`, type: 'system-design', category: 'Scalability',     orderIndex: 0 },
      { text: 'Explain HashMap vs TreeMap. When would you use each?',     type: 'technical',     category: 'Data Structures', orderIndex: 1 },
      { text: 'Tell me about a time you had to meet a tight deadline.',    type: 'behavioral',    category: 'Leadership',      orderIndex: 2 },
      { text: `Design a real-time notification system for ${company}.`,   type: 'system-design', category: 'System Design',   orderIndex: 3 },
      { text: 'What is the time complexity of quicksort?',                type: 'technical',     category: 'Algorithms',      orderIndex: 4 },
    ].slice(0, count);
  }

  // RAG MODE — retrieve real company questions as context
  let ragContext = '';
  if (env.USE_RAG === 'true') {
    try {
      console.log(`🔍  RAG: retrieving context for ${company} ${difficulty}...`);
      const ragService    = require('../rag/ragService');
      const retrieved     = await ragService.retrieveContext({
        company, role: jobRole, difficulty, count: 10,
      });

      if (retrieved.length > 0) {
        ragContext = ragService.buildContextString(retrieved);
        console.log(`✅  RAG: retrieved ${retrieved.length} relevant questions`);
      } else {
        console.log(`ℹ️   RAG: no matches found — using pure AI generation`);
      }
    } catch (ragError) {
      // RAG failure is non-fatal — fall back to pure AI generation
      console.warn(`⚠️   RAG failed: ${ragError.message} — continuing without context`);
    }
  }

 
  const messages = promptBuilder.buildQuestionsPrompt({
    company, jobRole, difficulty, count,
    ragContext,   // ← pass context to prompt builder
  });

  const raw = await this.call(messages, { temperature: 0.8, max_tokens: 2000 });
  return responseParser.parseQuestions(raw);
}
 
async evaluateAnswer({
  question,
  answer,
  company,
  jobRole,
}) {
  
  let referenceContext = '';
  if (env.USE_RAG === 'true') {
    try {
      console.log(`🔍  RAG: retrieving evaluation context for ${company}...`);
      const ragService = require('../rag/ragService');
      const retrieved = await ragService.retrieveContext({
        company,
        role: jobRole,
        type: question.type,
        count: 2,
        queryOverride: question.text,
      });

      if (retrieved.length > 0) {
        referenceContext = retrieved.map(q => 
          `Question: ${q.questionText}\nReference Answer: ${q.sampleAnswer}`
        ).join('\n\n');
        console.log(`✅  RAG: retrieved ${retrieved.length} relevant context(s) for evaluation`);
      } else {
        console.log(`ℹ️   RAG: no matches found — falling back to general evaluation`);
      }
    } catch (ragError) {
      console.warn(`⚠️   RAG evaluation failed: ${ragError.message} — continuing without context`);
    }
  }

  const messages = promptBuilder.buildEvaluationPrompt({
    question,
    answer,
    company,
    jobRole,
    referenceContext,
  });
 
  const raw = await this.call(messages, {
    temperature: 0.2,
    max_tokens: 2000,
  });
  return responseParser.parseEvaluation(raw);
}
}

module.exports = new AIService();