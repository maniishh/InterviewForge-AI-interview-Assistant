 
'use strict';
 
require('dotenv').config();

const mongoose       = require('mongoose');
const rawQuestions   = require('../data/rawQuestions');
const chunker        = require('./chunker');
const embedder       = require('./embedder');
const vectorStore    = require('./vectorStore');
const RagQuestion    = require('./ragQuestionStore');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  const startTime = Date.now();
  console.log('\n🌱  InterviewForge RAG Seeder\n' + '─'.repeat(40));

  // ── STEP 1: CONNECT TO MONGODB ────────────────────────────────────────────
  console.log('\n📦  Step 1: Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // ── STEP 2: PROCESS RAW QUESTIONS ────────────────────────────────────────
  console.log('\n📋  Step 2: Processing raw questions...');
  const chunks = chunker.processAll(rawQuestions);

  const stats = chunker.getStats(chunks);
  console.log('\n📊  Dataset statistics:');
  console.log(`   Total questions: ${stats.total}`);
  console.log('   By company:', stats.byCompany);
  console.log('   By type:', stats.byType);
  console.log('   By difficulty:', stats.byDifficulty);

  // ── STEP 3: ESTIMATE COST ────────────────────────────────────────────────
  const costEstimate = embedder.estimateCost(chunks);
  console.log(`\n💰  Embedding cost estimate:`);
  console.log(`   Tokens: ~${costEstimate.estimatedTokens}`);
  console.log(`   Cost:   ~$${costEstimate.estimatedCostUSD} USD`);
  console.log(`   Model:  ${costEstimate.model}`);

  // ── STEP 4: EMBED ALL QUESTIONS ──────────────────────────────────────────
  console.log('\n🧠  Step 3: Generating embeddings...');
  embedder.init();
  const embeddedChunks = await embedder.embedAll(chunks);

  // ── STEP 5: SETUP PINECONE INDEX ─────────────────────────────────────────
  console.log('\n📌  Step 4: Setting up Pinecone index...');
  await vectorStore.init();
  await vectorStore.createIndexIfNotExists(384);

  // ── STEP 6: UPSERT TO PINECONE ────────────────────────────────────────────
  console.log('\n📤  Step 5: Upserting vectors to Pinecone...');
  await vectorStore.upsertAll(embeddedChunks);

  // ── STEP 7: SAVE TO MONGODB ──────────────────────────────────────────────
  console.log('\n💾  Step 6: Saving documents to MongoDB...');
  let savedCount = 0;

  for (const chunk of embeddedChunks) {
    await RagQuestion.findOneAndUpdate(
      { pineconeId: chunk.id },
      { $set: chunk.mongoData },
      { upsert: true, new: true }
    );
    savedCount++;
    process.stdout.write(`   Saved ${savedCount}/${embeddedChunks.length} documents\r`);
  }

  console.log(`\n✅  All ${savedCount} documents saved to MongoDB`);

  // ── STEP 8: VERIFY ────────────────────────────────────────────────────────
  console.log('\n🔍  Step 7: Verifying...');
  const pineconeStats = await vectorStore.getStats();
  const mongoCount    = await RagQuestion.countDocuments();

  console.log(`   Pinecone vectors: ${pineconeStats.totalRecordCount || 'updating...'}`);
  console.log(`   MongoDB documents: ${mongoCount}`);

  // ── DONE ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`🎉  Seeding complete in ${elapsed} seconds`);
  console.log(`    ${savedCount} questions ready for RAG retrieval\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Seeder failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});