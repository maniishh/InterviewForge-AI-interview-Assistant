// backend/rag/ragQuestionStore.js
'use strict';

const mongoose = require('mongoose');

 
const ragQuestionSchema = new mongoose.Schema({
  pineconeId:   { type: String, required: true, unique: true, index: true },
  questionText: { type: String, required: true },
  company:      { type: String, required: true, index: true },
  role:         { type: String, default: 'software-engineer' },
  type:         { type: String, enum: ['technical', 'behavioral', 'system-design'], required: true },
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category:     { type: String, required: true },
  frequency:    { type: Number, min: 0, max: 100, default: 50 },
  year:         { type: Number },
  followUps:    [String],
  sampleAnswer: { type: String },
  source:       { type: String, default: 'unknown' },
  timesRetrieved: { type: Number, default: 0 }, // analytics: how often this Q was retrieved
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

ragQuestionSchema.index({ company: 1, difficulty: 1, type: 1 });
ragQuestionSchema.index({ frequency: -1 });

module.exports = mongoose.model('RagQuestion', ragQuestionSchema);