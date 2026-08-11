'use strict';

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text:             { type: String, required: true, trim: true },
  type:             { type: String, enum: ['technical', 'behavioral', 'system-design'], required: true },
  category:         { type: String, trim: true },
  orderIndex:       { type: Number, required: true },
  difficulty:       { type: String, enum: ['easy', 'medium', 'hard'] },
  isCodingQuestion: { type: Boolean, default: false },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  text: { type: String, default: '', trim: true },
  questionIndex: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  timeTakenSeconds: { type: Number },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  technicalScore: {
    type: Number,
    min: 0,
    max: 10,
  },

  communicationScore: {
    type: Number,
    min: 0,
    max: 10,
  },

  depthScore: {
    type: Number,
    min: 0,
    max: 10,
  },

  overallScore: {
    type: Number,
    min: 0,
    max: 10,
  },

  feedback: {
    type: String,
  },

  strengths: {
    type: String,
  },

  improvements: {
    type: String,
  },

  suggestedAnswer: {
    type: String,
  },

  questionIndex: {
    type: Number,
    required: true,
  },

  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// ── CODE SUBMISSION SUBDOCUMENT ─────────────────────────────────────────────
const codeSubmissionSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  language:      { type: String, required: true },
  code:          { type: String, required: true },
  testsPassed:   { type: Number },
  testsTotal:    { type: Number },
  evaluation:    evaluationSchema,
  submittedAt:   { type: Date, default: Date.now },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    company: { type: String, required: true, trim: true, maxlength: 100 },
    jobRole: { type: String, required: true, trim: true, maxlength: 100 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },

    questions: [questionSchema],
    answers: [answerSchema],
    evaluations: [evaluationSchema],

    overallScore: { type: Number, min: 0, max: 10 },
    avgTechnicalScore: { type: Number, min: 0, max: 10 },
    avgCommunicationScore: { type: Number, min: 0, max: 10 },
    avgDepthScore: { type: Number, min: 0, max: 10 },

    weakTopics: {
  type:    [String],
  default: [],
    },
    strongTopics: {
  type:    [String],
  default: [],
  // Topics where user scored >= 7.0 — stored same reason as weakTopics
},

storedDurationMinutes: {
  type: Number,
},

questionTypeCount: {
  technical:    { type: Number, default: 0 },
  behavioral:   { type: Number, default: 0 },
  systemDesign: { type: Number, default: 0 },
},

    // ── ADAPTIVE ENGINE FIELDS ───────────────────────────────────────────────
    mode: {
      type:    String,
      enum:    ['static', 'adaptive'],
      default: 'static',
    },

    totalQuestions: {
      type:    Number,
      default: 5,
    },

    currentDifficulty: {
      type:    String,
      enum:    ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    difficultyHistory: [{
      questionIndex: { type: Number },
      from:          { type: String },
      to:            { type: String },
      reason:        { type: String },
    }],

    // ── CODING SANDBOX ───────────────────────────────────────────────────────
    codeSubmissions: [codeSubmissionSchema],

    startedAt:  { type: Date, default: Date.now },
    completedAt: { type: Date },
  },

  
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

sessionSchema.index({ userId: 1, status: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, weakTopics:   1 });
sessionSchema.index({ userId: 1, strongTopics: 1 });

sessionSchema.virtual('durationMinutes').get(function () {
  if (!this.completedAt || !this.startedAt) return null;
  return Math.round((this.completedAt - this.startedAt) / 60000);
});


module.exports = mongoose.model('Session', sessionSchema);