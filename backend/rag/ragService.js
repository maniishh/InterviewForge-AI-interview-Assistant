 
'use strict';

 

const embedder       = require('./embedder');
const vectorStore    = require('./vectorStore');
const RagQuestion    = require('./ragQuestionStore');

const ragService = {
 
  async retrieveContext({ company, role, difficulty, type = 'all', count = 10 }) {
 
    const queryText = [
      `Company: ${company.toLowerCase()}`,
      `Role: ${role || 'software-engineer'}`,
      `Interview type: ${type === 'all' ? 'technical behavioral system-design' : type}`,
      `Difficulty: ${difficulty || 'medium'}`,
      `${company} ${role} interview question`,
    ].join('\n');

    // ── Step 2: Embed the query ────────────────────────────────────────────
    embedder.init();
    const queryVector = await embedder.embedQuery(queryText);

    // ── Step 3: Search Pinecone ────────────────────────────────────────────
    const matches = await vectorStore.query({
      company,
      role,
      type,
      difficulty,
      queryVector,
      topK: count * 2,  // retrieve 2x, filter in Step 4 by frequency
    });

    if (!matches.length) {
      console.log(`ℹ️   No RAG matches found for ${company} ${difficulty} — using pure AI generation`);
      return [];
    }

    // ── Step 4: Fetch full content from MongoDB ────────────────────────────
    const pineconeIds  = matches.map(m => m.id);
    const docs         = await RagQuestion.find({ pineconeId: { $in: pineconeIds } });

    // Preserve Pinecone vector similarity ranking order
    const docMap       = new Map(docs.map(d => [d.pineconeId, d]));
    const questions    = pineconeIds
      .map(id => docMap.get(id))
      .filter(Boolean)
      .slice(0, count);

    // Track retrieval for analytics
    await RagQuestion.updateMany(
      { pineconeId: { $in: pineconeIds } },
      { $inc: { timesRetrieved: 1 } }
    );

    // ── Step 5: Format as context ──────────────────────────────────────────
    return questions.map((q, i) => ({
      index:        i + 1,
      questionText: q.questionText,
      type:         q.type,
      category:     q.category,
      difficulty:   q.difficulty,
      followUps:    q.followUps || [],
      sampleAnswer: q.sampleAnswer || '',
      frequency:    q.frequency,
    }));
  },

  /*
   * buildContextString(retrievedQuestions)
   * Formats retrieved questions into a string for the AI prompt.
   */
  buildContextString(retrievedQuestions) {
    if (!retrievedQuestions.length) return '';

    return retrievedQuestions.map(q =>
      `[Example ${q.index}] (${q.type} · ${q.category} · ${q.difficulty})
Question: ${q.questionText}
Follow-ups: ${q.followUps.slice(0, 2).join(' | ')}
Key concepts: ${q.sampleAnswer.substring(0, 80)}`
    ).join('\n\n');
  },
};

module.exports = ragService;