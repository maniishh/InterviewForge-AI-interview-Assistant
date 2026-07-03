 
'use strict';

const { Pinecone } = require('@pinecone-database/pinecone');
const env          = require('../config/env');

 

const BATCH_SIZE = 100;

const vectorStore = {
  client:    null,
  indexName: null,
 
  async init() {
    if (!env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is required. Add it to .env and config/env.js');
    }

    this.indexName = env.PINECONE_INDEX_NAME || 'interviewforge-questions';
    this.client    = new Pinecone({ apiKey: env.PINECONE_API_KEY });

    console.log(`✅  Pinecone client initialised — index: ${this.indexName}`);
  },
 
// vectorStore.js — replace createIndexIfNotExists method

async createIndexIfNotExists(dimension = 384) {
  if (!this.client) await this.init();

  const existingIndexes = await this.client.listIndexes();
  const existing = existingIndexes.indexes?.find(idx => idx.name === this.indexName);

  if (existing) {
     
    const existingDim = existing.dimension;
    console.log(`ℹ️   Index "${this.indexName}" exists — dimension: ${existingDim}`);

    if (existingDim !== dimension) {
      console.log(`⚠️   Dimension mismatch (existing: ${existingDim}, needed: ${dimension})`);
      console.log(`🗑️   Deleting old index...`);
      await this.client.deleteIndex(this.indexName);
      await new Promise(r => setTimeout(r, 5000)); // wait for deletion
      console.log(`✅  Old index deleted`);
    } else {
      console.log(`✅  Dimension matches — reusing existing index`);
      return;
    }
  }

  console.log(`🔄  Creating Pinecone index "${this.indexName}" with dimension ${dimension}...`);

  await this.client.createIndex({
    name:      this.indexName,
    dimension,
    metric:    'cosine',
    spec: {
      serverless: {
        cloud:  'aws',
        region: 'us-east-1',
      },
    },
  });

  console.log('⏳  Waiting for index to be ready (30 seconds)...');
  await new Promise(r => setTimeout(r, 30000));
  console.log(`✅  Index "${this.indexName}" ready`);
},

 async upsertAll(embeddedChunks) {
  if (!this.client) await this.init();

  const index   = this.client.index(this.indexName);
  let   total   = 0;

  console.log(`\n🔄  Upserting ${embeddedChunks.length} vectors to Pinecone...`);

  
  const records = embeddedChunks
    .filter(chunk => Array.isArray(chunk.vector) && chunk.vector.length > 0)
    .map(chunk => ({
      id:       String(chunk.id),
      values:   [...chunk.vector],
      metadata: chunk.metadata,
    }));

  console.log(`   Valid records: ${records.length}`);

  if (records.length === 0) {
    throw new Error('No valid records to upsert — check vector generation');
  }

 
  
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch      = records.slice(i, i + BATCH_SIZE);
    const batchNum   = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatch = Math.ceil(records.length / BATCH_SIZE);

    process.stdout.write(`   Batch ${batchNum}/${totalBatch}: upserting ${batch.length} vectors...`);
    await index.upsert(batch);
    total += batch.length;
    process.stdout.write(` ✓ (${total} total)\n`);
  }

  console.log(`\n✅  All ${total} vectors upserted to Pinecone`);
},

  
async query({ company, role, type, difficulty, queryVector, topK = 15 }) {
  if (!this.client) await this.init();

  const index  = this.client.index(this.indexName);
  const filter = { company: { $eq: company.toLowerCase() } };

  if (difficulty) filter.difficulty = { $eq: difficulty };
  if (type && type !== 'all') filter.type = { $eq: type };

   
  const result = await index.query({
    vector:          queryVector,
    topK,
    filter,
    includeMetadata: true,
    includeValues:   false,
  });

  return result.matches || [];
},

 
  async deleteCompany(company) {
    if (!this.client) await this.init();
    const index = this.client.index(this.indexName);
    await index.namespace(company.toLowerCase()).deleteAll();
    console.log(`✅  Deleted all vectors for company: ${company}`);
  },

  
  async getStats() {
    if (!this.client) await this.init();
    const index = this.client.index(this.indexName);
    return index.describeIndexStats();
  },
};

module.exports = vectorStore;