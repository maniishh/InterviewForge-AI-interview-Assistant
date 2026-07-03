 
'use strict';
 
const DIMENSION = 384;
let   pipeline  = null;

const embedder = {

   
  async init() {
    if (pipeline) return; // already loaded

    console.log('📥  Loading local embedding model (first run downloads ~25MB)...');

     
    const { pipeline: createPipeline } = await import('@xenova/transformers');

    pipeline = await createPipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    console.log(`✅  Embedder initialised — model: all-MiniLM-L6-v2 (local, dim: ${DIMENSION})`);
  },

  
async embedOne(text) {
  await this.init();

  const output = await pipeline(text, {
    pooling:   'mean',
    normalize: true,
  });
 
  const vector = [...output.data];

  // Verify it's a plain array of numbers
  if (!Array.isArray(vector) || typeof vector[0] !== 'number') {
    throw new Error(`Unexpected vector format: ${typeof vector}, first element: ${typeof vector[0]}`);
  }

  return vector;
},
 
  async embedAll(chunks) {
    await this.init();

    const results = [];
    const total   = chunks.length;

    console.log(`\n🔄  Embedding ${total} questions locally...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      process.stdout.write(`   [${i + 1}/${total}] ${chunk.id}...`);

      const vector = await this.embedOne(chunk.embeddingText);
      console.log(`   Vector sample (first 3): [${vector.slice(0,3).join(', ')}]`); 
      results.push({ ...chunk, vector });

      process.stdout.write(` ✓ (dim: ${vector.length})\n`);
    }

    console.log(`\n✅  All ${results.length} embeddings generated locally`);
    return results;
  },

   
  async embedQuery(text) {
    return this.embedOne(text);
  },

  estimateCost(chunks) {
    return {
      estimatedTokens:  chunks.length * 100,
      estimatedCostUSD: '0.000000 (local model — completely free)',
      model:            'Xenova/all-MiniLM-L6-v2',
      dimension:        DIMENSION,
    };
  },

  getDimension() { return DIMENSION; },
};

module.exports = embedder;