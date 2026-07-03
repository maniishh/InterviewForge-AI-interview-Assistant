 
'use strict';

 
const REQUIRED_FIELDS = ['id', 'company', 'type', 'difficulty', 'category', 'text'];

const chunker = {

  
  processAll(rawQuestions) {
    const processed = [];
    const errors    = [];
    const seenIds   = new Set();

    rawQuestions.forEach((q, index) => {
      try {
        const chunk = this.processOne(q, index);
        if (seenIds.has(chunk.id)) {
          errors.push(`Duplicate ID: ${chunk.id} at index ${index}`);
          return;
        }
        seenIds.add(chunk.id);
        processed.push(chunk);
      } catch (err) {
        errors.push(`Error at index ${index}: ${err.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn(`\n⚠️  ${errors.length} validation errors:`);
      errors.forEach(e => console.warn(`   ${e}`));
    }

    console.log(`✅  Processed ${processed.length}/${rawQuestions.length} questions successfully`);
    return processed;
  },
 
  processOne(question, index) {
    // ── VALIDATE ────────────────────────────────────────────────────────────
    REQUIRED_FIELDS.forEach(field => {
      if (!question[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    if (!['technical', 'behavioral', 'system-design'].includes(question.type)) {
      throw new Error(`Invalid type: ${question.type}`);
    }

    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      throw new Error(`Invalid difficulty: ${question.difficulty}`);
    }

    // ── NORMALISE ────────────────────────────────────────────────────────────
    const normalised = {
      id:           question.id || `q_${index}`,
      company:      question.company.toLowerCase().trim().replace(/\s+/g, '-'),
      role:         (question.role || 'software-engineer').toLowerCase().trim(),
      type:         question.type,
      difficulty:   question.difficulty,
      category:     question.category.trim(),
      frequency:    Math.min(100, Math.max(0, question.frequency || 50)),
      year:         question.year || new Date().getFullYear(),
      text:         question.text.trim(),
      followUps:    (question.followUps || []).map(f => f.trim()),
      sampleAnswer: (question.sampleAnswer || '').trim(),
      source:       question.source || 'unknown',
    };

   
    const embeddingText = [
      `Company: ${normalised.company}`,
      `Role: ${normalised.role}`,
      `Interview type: ${normalised.type}`,
      `Difficulty: ${normalised.difficulty}`,
      `Category: ${normalised.category}`,
      `Question: ${normalised.text}`,
      normalised.followUps.length > 0
        ? `Follow-up questions: ${normalised.followUps.join(' | ')}`
        : '',
      normalised.sampleAnswer
        ? `Key concepts: ${normalised.sampleAnswer.substring(0, 100)}`
        : '',
    ].filter(Boolean).join('\n');
 
    const metadata = {
      company:    normalised.company,
      role:       normalised.role,
      type:       normalised.type,
      difficulty: normalised.difficulty,
      category:   normalised.category,
      frequency:  normalised.frequency,
      year:       normalised.year,
    };

    // ── MONGODB DATA ─────────────────────────────────────────────────────────
    const mongoData = {
      pineconeId:   normalised.id,
      questionText: normalised.text,
      company:      normalised.company,
      role:         normalised.role,
      type:         normalised.type,
      difficulty:   normalised.difficulty,
      category:     normalised.category,
      frequency:    normalised.frequency,
      year:         normalised.year,
      followUps:    normalised.followUps,
      sampleAnswer: normalised.sampleAnswer,
      source:       normalised.source,
    };

    return {
      id:            normalised.id,
      embeddingText,
      metadata,
      mongoData,
    };
  },

  /*
   * getStats(chunks)
   * Returns a summary of the processed dataset.
   * Useful for verifying the knowledge base before seeding.
   */
  getStats(chunks) {
    const byCompany    = {};
    const byType       = {};
    const byDifficulty = {};

    chunks.forEach(c => {
      byCompany[c.metadata.company]       = (byCompany[c.metadata.company]       || 0) + 1;
      byType[c.metadata.type]             = (byType[c.metadata.type]             || 0) + 1;
      byDifficulty[c.metadata.difficulty] = (byDifficulty[c.metadata.difficulty] || 0) + 1;
    });

    return { total: chunks.length, byCompany, byType, byDifficulty };
  },
};

module.exports = chunker;