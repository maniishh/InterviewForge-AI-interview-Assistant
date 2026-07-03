'use strict';

const RAW_QUESTIONS = [

  // ─────────────────────────────────────────────────────────────────────────
  // GOOGLE QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'g_tech_001',
    company:      'google',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Arrays',
    frequency:    92,
    year:         2024,
    text:         'Given an array of integers, find two numbers that add up to a target sum. Return their indices. What if the array is sorted?',
    followUps:    [
      'What is your time and space complexity?',
      'How would you handle duplicate numbers?',
      'Can you solve it in O(n) time?',
    ],
    sampleAnswer: 'Use a hash map to store complement values. O(n) time, O(n) space. For sorted array, use two pointers for O(1) space.',
    source:       'leetcode-discuss',
  },

  {
    id:           'g_tech_002',
    company:      'google',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'hard',
    category:     'Dynamic Programming',
    frequency:    78,
    year:         2024,
    text:         'Given a string, find the longest palindromic substring. Explain your approach and optimise it.',
    followUps:    [
      'Can you do better than O(n²)?',
      'How does Manacher\'s algorithm work?',
      'What if we need all palindromic substrings, not just the longest?',
    ],
    sampleAnswer: 'Expand around centre: O(n²) time O(1) space. Or use DP table O(n²) time and space. Manacher\'s achieves O(n).',
    source:       'glassdoor',
  },

  {
    id:           'g_tech_003',
    company:      'google',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Trees',
    frequency:    85,
    year:         2024,
    text:         'Given a binary tree, return the level order traversal of its nodes values as a list of lists.',
    followUps:    [
      'How would you print it in zigzag order?',
      'What is the space complexity of your solution?',
      'How would you find the width of each level?',
    ],
    sampleAnswer: 'BFS with a queue. At each level, record queue size to know how many nodes belong to that level. O(n) time and space.',
    source:       'leetcode-discuss',
  },

  {
    id:           'g_tech_004',
    company:      'google',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'hard',
    category:     'Graphs',
    frequency:    71,
    year:         2024,
    text:         'You are given an m×n grid. Find the number of islands where an island is formed by connecting adjacent lands horizontally or vertically.',
    followUps:    [
      'What if the grid is very large and doesn\'t fit in memory?',
      'How would you solve it with Union-Find instead of DFS?',
      'What\'s the difference in performance between DFS and BFS here?',
    ],
    sampleAnswer: 'DFS/BFS to mark visited cells. Time O(m×n), Space O(m×n) for recursion stack. Union-Find also works.',
    source:       'glassdoor',
  },

  {
    id:           'g_sysdes_001',
    company:      'google',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Scalability',
    frequency:    88,
    year:         2024,
    text:         'Design Google Search. How would you build a system that indexes the entire web and returns relevant results in under 100ms?',
    followUps:    [
      'How would you handle 100,000 queries per second?',
      'How does PageRank work at a high level?',
      'How would you update the index in real time?',
    ],
    sampleAnswer: 'Web crawler → inverted index → ranking (TF-IDF + PageRank) → sharded serving layer → caching → CDN.',
    source:       'glassdoor',
  },

  {
    id:           'g_sysdes_002',
    company:      'google',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Distributed Systems',
    frequency:    76,
    year:         2024,
    text:         'Design YouTube. Focus on the video upload pipeline and how you would serve videos to millions of concurrent users.',
    followUps:    [
      'How would you handle video transcoding at scale?',
      'How does CDN placement work for global users?',
      'How would you design the recommendation system?',
    ],
    sampleAnswer: 'Upload → object storage → transcoding queue → multiple resolutions → CDN edge nodes → adaptive bitrate streaming.',
    source:       'leetcode-discuss',
  },

  {
    id:           'g_beh_001',
    company:      'google',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Leadership',
    frequency:    82,
    year:         2024,
    text:         'Tell me about a time you had a technical disagreement with a teammate. How did you resolve it and what was the outcome?',
    followUps:    [
      'How did you ensure the relationship remained positive?',
      'Would you handle it differently now?',
      'What did you learn about collaboration?',
    ],
    sampleAnswer: 'Use STAR. Focus on data-driven resolution, active listening, and a collaborative outcome. Google values Googleyness — working well with others.',
    source:       'glassdoor',
  },

  {
    id:           'g_beh_002',
    company:      'google',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Impact',
    frequency:    79,
    year:         2024,
    text:         'Describe a project where you had significant impact. What made it impactful and how did you measure success?',
    followUps:    [
      'What would you have done differently?',
      'How did you handle setbacks during the project?',
      'How did you influence stakeholders without authority?',
    ],
    sampleAnswer: 'Quantify impact: users affected, latency improved, revenue generated. Google values measurable impact at scale.',
    source:       'glassdoor',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AMAZON QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'amz_tech_001',
    company:      'amazon',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Arrays',
    frequency:    90,
    year:         2024,
    text:         'Given an array of integers, find the maximum subarray sum. Now extend this: what is the maximum product subarray?',
    followUps:    [
      'What if the array wraps around (circular subarray)?',
      'What is Kadane\'s algorithm and how does it work?',
      'How would you return the actual subarray, not just the sum?',
    ],
    sampleAnswer: 'Kadane\'s algorithm for sum: O(n) time, O(1) space. For product, track both max and min due to negative numbers.',
    source:       'leetcode-discuss',
  },

  {
    id:           'amz_tech_002',
    company:      'amazon',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Linked Lists',
    frequency:    83,
    year:         2024,
    text:         'Given a linked list, reverse it in place. Then: reverse only a specific portion from position m to n.',
    followUps:    [
      'What is the time and space complexity?',
      'How would you detect a cycle in a linked list?',
      'How would you find the middle node in a single pass?',
    ],
    sampleAnswer: 'Iterative reversal with prev/curr/next pointers. O(n) time, O(1) space. For partial reversal, navigate to position m first.',
    source:       'glassdoor',
  },

  {
    id:           'amz_beh_001',
    company:      'amazon',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Customer Obsession',
    frequency:    95,
    year:         2024,
    text:         'Tell me about a time you went above and beyond for a customer or end user. What did you do and why?',
    followUps:    [
      'How did you identify what the customer really needed?',
      'How did you balance customer needs with technical constraints?',
      'What was the measurable impact on the customer?',
    ],
    sampleAnswer: 'Amazon LP: Customer Obsession. Show proactive identification of customer pain point, action taken without being asked, quantified result.',
    source:       'glassdoor',
  },

  {
    id:           'amz_beh_002',
    company:      'amazon',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Ownership',
    frequency:    91,
    year:         2024,
    text:         'Describe a situation where you took ownership of a problem that was not your responsibility. What happened and what did you learn?',
    followUps:    [
      'How did you decide to get involved?',
      'Did you involve others or handle it alone?',
      'What was the long-term outcome?',
    ],
    sampleAnswer: 'Amazon LP: Ownership. Show initiative, beyond-job-description action, and end-to-end accountability.',
    source:       'glassdoor',
  },

  {
    id:           'amz_beh_003',
    company:      'amazon',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'hard',
    category:     'Bias for Action',
    frequency:    87,
    year:         2024,
    text:         'Tell me about a time you had to make a decision with incomplete information. How did you decide and what was the result?',
    followUps:    [
      'What data did you have vs. what did you wish you had?',
      'How did you manage the risk of being wrong?',
      'Would you make the same decision today?',
    ],
    sampleAnswer: 'Amazon LP: Bias for Action. Show calculated risk-taking, use of available data, reversible decision-making, and learning from outcome.',
    source:       'leetcode-discuss',
  },

  {
    id:           'amz_sysdes_001',
    company:      'amazon',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Distributed Systems',
    frequency:    84,
    year:         2024,
    text:         'Design Amazon\'s product recommendation system. How would you personalise recommendations for 300 million customers in real time?',
    followUps:    [
      'How would you handle cold start for new users?',
      'How do you update the model without downtime?',
      'How would you A/B test recommendation algorithms?',
    ],
    sampleAnswer: 'Collaborative filtering + content-based hybrid. Feature store → model serving → caching layer. Batch training + real-time signals.',
    source:       'glassdoor',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MICROSOFT QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'ms_tech_001',
    company:      'microsoft',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Strings',
    frequency:    81,
    year:         2024,
    text:         'Implement a function to check if two strings are anagrams of each other. Extend this to group a list of strings into anagram groups.',
    followUps:    [
      'What is your time complexity?',
      'How would you handle Unicode characters?',
      'Can you solve grouping anagrams without sorting?',
    ],
    sampleAnswer: 'Sort characters for anagram check: O(n log n). Hash frequency array for O(n). Grouping: use sorted string as HashMap key.',
    source:       'leetcode-discuss',
  },

  {
    id:           'ms_tech_002',
    company:      'microsoft',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Binary Search',
    frequency:    77,
    year:         2024,
    text:         'Given a sorted array that has been rotated at an unknown pivot, search for a target value efficiently.',
    followUps:    [
      'What is your time complexity?',
      'How do you handle duplicates in the array?',
      'How would you find the pivot index itself?',
    ],
    sampleAnswer: 'Modified binary search: determine which half is sorted, check if target is in sorted half, recurse. O(log n) time.',
    source:       'glassdoor',
  },

  {
    id:           'ms_beh_001',
    company:      'microsoft',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Growth Mindset',
    frequency:    88,
    year:         2024,
    text:         'Tell me about a time you received critical feedback. How did you respond and how did it change your approach?',
    followUps:    [
      'How did you separate the feedback from your ego?',
      'What specific changes did you make?',
      'Did you follow up with the person who gave feedback?',
    ],
    sampleAnswer: 'Microsoft values Growth Mindset. Show openness to feedback, specific actions taken, measurable improvement, and gratitude.',
    source:       'glassdoor',
  },

  {
    id:           'ms_sysdes_001',
    company:      'microsoft',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Real-time Systems',
    frequency:    80,
    year:         2024,
    text:         'Design Microsoft Teams or a real-time messaging system. How would you handle millions of concurrent users with sub-100ms message delivery?',
    followUps:    [
      'How do you handle message ordering guarantees?',
      'How do WebSockets scale across multiple servers?',
      'How would you implement read receipts at scale?',
    ],
    sampleAnswer: 'WebSocket connections → message broker (Kafka) → fan-out service → push to connected clients. Presence service for online status.',
    source:       'glassdoor',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // META QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'meta_tech_001',
    company:      'meta',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'hard',
    category:     'Graphs',
    frequency:    86,
    year:         2024,
    text:         'Design a data structure that supports friend connections and can find the shortest path between two users in a social network of 3 billion people.',
    followUps:    [
      'How does BFS work for shortest path in an unweighted graph?',
      'How would you implement bidirectional BFS for efficiency?',
      'How does this scale to billions of nodes?',
    ],
    sampleAnswer: 'Bidirectional BFS from both ends meets in the middle. Store graph in distributed adjacency list. O(b^(d/2)) vs O(b^d) for standard BFS.',
    source:       'glassdoor',
  },

  {
    id:           'meta_tech_002',
    company:      'meta',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Trees',
    frequency:    82,
    year:         2024,
    text:         'Given a binary search tree, find the kth smallest element. How would you optimise if this operation is called very frequently?',
    followUps:    [
      'What is the inorder traversal approach and its complexity?',
      'How would you augment the BST to make this O(log n)?',
      'What if the BST is frequently modified between queries?',
    ],
    sampleAnswer: 'Inorder traversal gives sorted sequence; stop at kth element. Augment nodes with subtree size for O(log n) kth smallest.',
    source:       'leetcode-discuss',
  },

  {
    id:           'meta_beh_001',
    company:      'meta',
    role:         'software-engineer',
    type:         'behavioral',
    difficulty:   'medium',
    category:     'Moving Fast',
    frequency:    85,
    year:         2024,
    text:         'Tell me about a time you shipped something quickly with imperfect information. What trade-offs did you make and how did you manage technical debt?',
    followUps:    [
      'How did you communicate the trade-offs to stakeholders?',
      'Did you pay down the technical debt? When and how?',
      'What would you do differently given the same constraints?',
    ],
    sampleAnswer: 'Meta values: Move Fast. Show calculated shortcuts, explicit documentation of debt, and proactive paydown after launch.',
    source:       'glassdoor',
  },

  {
    id:           'meta_sysdes_001',
    company:      'meta',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Social Graph',
    frequency:    89,
    year:         2024,
    text:         'Design the Facebook News Feed system. How would you rank and serve personalised content to 3 billion users?',
    followUps:    [
      'How do you handle the fan-out problem for celebrities with 100M followers?',
      'How would you implement the ranking algorithm?',
      'How do you balance freshness vs relevance?',
    ],
    sampleAnswer: 'Pull vs push model. For celebrities use pull, for normal users use push. ML ranking model. Cache top feed items. CDN for media.',
    source:       'glassdoor',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // APPLE QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'apple_tech_001',
    company:      'apple',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Recursion',
    frequency:    74,
    year:         2024,
    text:         'Implement a function to generate all permutations of a string. Now extend it to generate all subsets of a set.',
    followUps:    [
      'How many permutations does a string of length n have?',
      'How do you handle duplicate characters?',
      'Can you implement this iteratively?',
    ],
    sampleAnswer: 'Backtracking: fix each character at position 0, recurse on rest. n! permutations. For subsets: include/exclude each element, 2^n subsets.',
    source:       'leetcode-discuss',
  },

  {
    id:           'apple_sysdes_001',
    company:      'apple',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Privacy',
    frequency:    72,
    year:         2024,
    text:         'Design iCloud sync that keeps files in sync across all Apple devices while maintaining end-to-end encryption and privacy.',
    followUps:    [
      'How do you handle conflicts when the same file is edited on two devices?',
      'How does end-to-end encryption work with server-side sync?',
      'How would you handle large files (videos) efficiently?',
    ],
    sampleAnswer: 'CRDTs for conflict resolution. Client-side encryption. Delta sync (only changes, not full files). Chunked upload for large files.',
    source:       'glassdoor',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NETFLIX QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'netflix_sysdes_001',
    company:      'netflix',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Streaming',
    frequency:    83,
    year:         2024,
    text:         'Design Netflix\'s video streaming system. How would you deliver high-quality video to 200 million users globally with minimal buffering?',
    followUps:    [
      'How does adaptive bitrate streaming work?',
      'How do you decide which CDN edge node to serve from?',
      'How would you handle the Netflix spike when a new show releases?',
    ],
    sampleAnswer: 'Open Connect CDN → adaptive bitrate (DASH/HLS) → client ABR algorithm chooses quality → prefetch next segments. Pre-position popular content.',
    source:       'glassdoor',
  },

  {
    id:           'netflix_tech_001',
    company:      'netflix',
    role:         'software-engineer',
    type:         'technical',
    difficulty:   'medium',
    category:     'Algorithms',
    frequency:    70,
    year:         2024,
    text:         'Design a rate limiter that limits each user to N requests per second. Implement this with both a sliding window and token bucket approach.',
    followUps:    [
      'What are the trade-offs between sliding window and token bucket?',
      'How would you implement this in a distributed system?',
      'How would you handle burst traffic?',
    ],
    sampleAnswer: 'Sliding window: Redis sorted set with timestamps. Token bucket: Redis counter + refill rate. Token bucket allows bursting, sliding window is smoother.',
    source:       'leetcode-discuss',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UBER / GENERAL TECH QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:           'uber_sysdes_001',
    company:      'uber',
    role:         'software-engineer',
    type:         'system-design',
    difficulty:   'hard',
    category:     'Location Services',
    frequency:    88,
    year:         2024,
    text:         'Design Uber\'s ride matching system. How do you efficiently match riders with nearby drivers in real time across a city?',
    followUps:    [
      'How would you use geohashing to partition the map?',
      'How do you handle driver location updates at scale?',
      'How would you optimise for minimal wait time vs minimal detour?',
    ],
    sampleAnswer: 'Geohash partitioning → quadtree spatial index → proximity search → matching algorithm (surge pricing, ETA). WebSocket for real-time updates.',
    source:       'glassdoor',
  },

];

module.exports = RAW_QUESTIONS;