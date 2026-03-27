import type { Lesson } from '../../types/curriculum';

export const aiOrchestrationLessons: Lesson[] = [
  {
    id: 'ai_0',
    title: 'The LLM Mental Model for Developers',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Large Language Models (LLMs)** like Claude and GPT-4 are not databases or search engines; they are "Next Token Predictors". They don\'t "know" facts; they calculate the most statistically likely words to follow a given prompt based on their training data.',
      'The "Context Window" is the LLM\'s short-term memory. Everything the model "knows" about your current task must be passed in the prompt. If you don\'t provide the context (like your code or a user\'s history), the model will "Hallucinate" (make things up) to satisfy the prediction.',
      'As a developer, your job is moving from "Writing Logic" to **"Orchestrating Context"**. You build the systems that fetch the right data at the right time and present it to the LLM in a way that produces predictable, high-quality results.'
    ],
    code: `// ── The Prompt Engine ──
const prompt = \`
  You are a senior TypeScript architect. 
  Review the following code for security vulnerabilities.
  
  Code: \${userCode}
  
  Output only a JSON array of issues.
\`;

// Result: Context-aware, structured output.`
  },
  {
    id: 'ai_1',
    title: 'Prompt Engineering: Beyond the Basics',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      '**Few-Shot Prompting** is the single most effective way to improve LLM performance. Instead of just giving an instruction, you provide 2-3 examples of the input and the desired output. This "shows" the model exactly what you want.',
      '**Chain of Thought (CoT)**: By telling the model to "Think step-by-step before answering", you force it to allocate more "Tokens" to the reasoning process. This significantly reduces logic errors and hallucinations in complex tasks.',
      'Structured Output (System Prompts): Use the system prompt to define the model\'s Persona, Rules, and Output Format. Telling a model "Respond only in valid JSON" is much more reliable than asking it in the main message.'
    ],
    code: `// ── Few-Shot Pattern ──
const systemPrompt = "Convert natural language to SQL.";
const examples = \`
  Input: Show users from New York
  Output: SELECT * FROM users WHERE city = 'New York';
  
  Input: Count active jobs
  Output: SELECT COUNT(*) FROM jobs WHERE status = 'active';
\`;

// Now the model has a "Pattern" to follow.`
  },
  {
    id: 'ai_2',
    title: 'RAG: Retrieval-Augmented Generation',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      '**RAG** is the standard architecture for building AI apps that know about your private data. Instead of training a new model (which costs millions), you search your own database for relevant info and "Stitch" it into the prompt.',
      'The "Embedding" step: You convert your documents (PDFs, code, docs) into a list of numbers (Vectors) using an embedding model. This captures the "Meaning" of the text, not just the keywords.',
      'The "Retrieval" step: When a user asks a question, you convert their question to a vector and find the "Most similar" document vectors in your **Vector Database** (like Pinecone or pgvector). This allows the LLM to answer questions about things it was never trained on.'
    ],
    code: `// ── The RAG Flow ──
// 1. User Query: "How do I setup Auth?"
// 2. Search Vector DB: Finds [auth_docs.md, security.ts]
// 3. Construct Prompt:
const prompt = \`
  Based on the following documentation, answer the user query.
  
  Docs: \${retrievedDocs}
  Query: \${userQuery}
\`;`
  },
  {
    id: 'ai_3',
    title: 'Vector Databases: pgvector & More',
    badge: 'Database',
    badgeClass: 'badge-code',
    content: [
      'A **Vector Database** is designed to store and search "High-dimensional embeddings". While you could use a specialist DB like Pinecone, **pgvector** allows you to store your vectors directly inside your existing PostgreSQL database.',
      'Similarity Search: Standard DBs search for `name = "Puru"`. Vector DBs search for "Data that means roughly the same thing as this query". This uses math like "Cosine Similarity" to find the distance between two vectors.',
      'Scaling Vectors: As you grow to millions of documents, searching every vector becomes slow. You use specialized "Indexes" like **HNSW** (Hierarchical Navigable Small World) to perform an "Approximate" search that is much faster with 99% accuracy.'
    ],
    code: `-- ── pgvector in Action ──
CREATE EXTENSION vector;

CREATE TABLE documents (
  id      SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536) -- 👈 Standard OpenAI size
);

-- Find top 5 most similar documents
SELECT content FROM documents 
ORDER BY embedding <=> '[0.1, 0.2, ...]' 
LIMIT 5;`
  },
  {
    id: 'ai_4',
    title: 'Function Calling & Tool Use',
    badge: 'Advanced',
    badgeClass: 'badge-code',
    content: [
      '**Function Calling** (or Tool Use) allows the LLM to interact with the real world. You tell the model about your API functions (e.g., `getWeather`, `searchJobs`), and the model decides *when* to call them and what arguments to use.',
      'The model doesn\'t actually run the code. It returns a "Tool Call" request. Your code then executes the function, takes the result, and sends it BACK to the model so it can finish its answer.',
      'This turns an LLM into an **Agent**. It can look up a user\'s application status, see that it\'s "Pending", and then draft a helpful email to the recruiter — all while following your safety rules and permission logic.'
    ],
    code: `// ── Tool Definition (Anthropic / OpenAI) ──
const tools = [{
  name: "get_job_status",
  description: "Get current status of a job application",
  input_schema: {
    type: "object",
    properties: { id: { type: "string" } }
  }
}];

// Model response:
// { "type": "tool_use", "name": "get_job_status", "input": {"id": "job_123"} }`
  },
  {
    id: 'ai_5',
    title: 'LangChain & Orchestration Frameworks',
    badge: 'Expert',
    badgeClass: 'badge-practice',
    content: [
      'As AI apps get complex, you end up with a "Chain" of prompts: fetch data -> summarize -> check for safety -> generate final answer. **LangChain** and **LangGraph** are frameworks that provide standardized "bricks" for building these chains.',
      'They provide built-in support for: "Memory" (chat history), "Loaders" (reading PDFs/URLs), and "Output Parsers" (converting LLM text to TS objects). If you find yourself writing 500 lines of "Glue Code", a framework might be cleaner.',
      'Professional tip: Frameworks can sometimes be too complex ("Abstractions on abstractions"). For many apps, a simple "Custom Orchestrator" using standard `fetch` calls is easier to debug and maintain than a giant library.'
    ],
    code: `// ── LangChain: A simple chain ──
const chain = RunnableSequence.from([
  PromptTemplate.fromTemplate("Summarize this: {text}"),
  new ChatAnthropic({ model: "claude-3-haiku" }),
  new StringOutputParser(),
]);

const result = await chain.invoke({ text: "Long document..." });`
  },
  {
    id: 'ai_6',
    title: 'Guardrails & AI Safety',
    badge: 'Security',
    badgeClass: 'badge-concept',
    content: [
      'LLMs are unpredictable. A user might try to "Jailbreak" your bot to get it to say offensive things or leak your secret system prompt. **Guardrails** are the security layer that checks inputs and outputs for safety.',
      '**Input Filtering**: Use a small, cheap model (like Claude Haiku) to check if the user\'s message is malicious before sending it to your expensive main model. **Output Validation**: Use Zod or a library like "Guardrails AI" to ensure the model\'s output matches your JSON schema perfectly.',
      'Moderation APIs: Most providers (OpenAI, Anthropic) have built-in moderation endpoints that detect hate speech, self-harm, or violence. You should run every user interaction through these to protect both your brand and your users.'
    ],
    code: `// ── The Guardrail Pattern ──
const res = await ai.generate(prompt);

// Validate with Zod
const schema = z.object({
  rating: z.number().min(1).max(5),
  reason: z.string().min(10)
});

try {
  const result = schema.parse(JSON.parse(res.text));
  return result;
} catch (err) {
  // If model failed to follow schema, retry or return error
  return fallbackResponse;
}`
  },
  {
    id: 'ai_7',
    title: 'Agents: The Future of Automation',
    badge: 'Expert',
    badgeClass: 'badge-concept',
    content: [
      'An **Agent** is an LLM that is given a "Goal" and a "Set of Tools", and it decides the steps needed to reach that goal. Unlike a "Chain" (which is fixed), an Agent can loop, retry, and change its plan based on new information.',
      'Modern agents use the **ReAct Pattern** (Reason + Act). The agent "Reasons" about what it knows, decides on an "Action" (using a tool), "Observes" the result, and repeats until the goal is achieved.',
      'The biggest challenge is **Agency**. If you give an agent access to your database, you must ensure it can only run "Safe" queries. Building and debugging agents is the "Black Belt" level of modern full-stack development.'
    ],
    code: `// ── ReAct Loop (Pseudocode) ──
while (goalNotReached) {
  const thought = await ai.think(context, tools);
  if (thought.action === "FINISH") break;
  
  const result = await executeTool(thought.action, thought.args);
  context.push({ action: thought.action, result });
}`
  },
  {
    id: 'ai_8',
    title: 'Project Execution: AI Resume Analyzer',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this final task, you will build the "AI Pulse" feature for JobTrackr. You will implement a RAG pipeline that reads a user\'s resume from S3, converts it to embeddings, and allows the user to ask questions like "Am I a good fit for this Senior React role?".',
      'You must use Prompt Engineering to ensure the model stays professional and "Tool Use" to allow it to look up the specific requirements of the job posting from your Postgres database.',
      '**Studio Task**: Build the "RecruiterBot" orchestrator. It needs to handle the context injection, manage the chat history in Redis, and output a "Match Score" in a strict JSON format for the UI.'
    ],
    code: `# ── AI Orchestration Checklist ──
# 1. RAG pipeline verified?    [Yes]
# 2. System prompt hardened?   [Yes]
# 3. Tool Use implemented?     [Yes]
# 4. JSON output validated?    [Yes]`
  },
  {
  id: 'ai_9',
  title: 'Cost Optimization & Model Selection',
  badge: 'Operations',
  badgeClass: 'badge-concept',
  content: [
    'LLM API costs are metered per **token** (roughly 4 characters). At scale, costs compound rapidly: 1 million users × 2000 tokens per session = 2 billion tokens/day. At Claude Sonnet pricing (~$3/million tokens), that\'s $6,000/day. Optimizing token usage is not premature optimization — it\'s a startup survival skill. The levers: model selection, prompt compression, response caching, and graceful degradation.',
    '**Model routing by task complexity**: Use small, fast, cheap models for simple tasks ("classify this text as positive/negative" → Haiku/Gemini Flash at $0.25/million tokens). Reserve large, expensive models for complex reasoning and generation ("analyze this resume and write a personalized cover letter" → Sonnet/GPT-4o at $15/million tokens). Route automatically based on task type — this alone cuts costs by 60-80%.',
    '**Semantic caching** goes beyond exact caching. Two prompts that are semantically identical ("what\'s the capital of France?" and "tell me France\'s capital city?") should return the same cached response. **GPTCache** and **Momento** implement semantic caching using embeddings — if the new prompt\'s embedding is within a cosine distance threshold of a cached prompt, return the cached response. For common FAQ patterns, this achieves 40-60% cache hit rates.'
  ],
  code: `// ── Model routing by task complexity ──
type TaskComplexity = 'simple' | 'moderate' | 'complex';

function selectModel(complexity: TaskComplexity): string {
  const models: Record<TaskComplexity, string> = {
    simple:   'claude-haiku-3',           // $0.25/M tokens — classification, Q&A
    moderate: 'claude-3-5-sonnet-20241022', // $3/M tokens — structured generation
    complex:  'claude-opus-4',              // $15/M tokens — reasoning, long-form
  };
  return models[complexity];
}

// ── Prompt compression: reduce tokens without losing meaning ──
function compressContext(jobDescription: string): string {
  return jobDescription
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .replace(/[^\w\s.,;:!?-]/g, '') // Remove special chars
    .slice(0, 2000)                 // Hard token budget
    .trim();
}

// ── Semantic caching with Redis ──
async function cachedGenerate(prompt: string, systemPrompt: string) {
  const promptEmbedding = await embed(prompt);
  const cacheKey = \`ai:\${hashEmbedding(promptEmbedding)}\`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit — saved', countTokens(prompt), 'tokens');
    return JSON.parse(cached);
  }

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  await redis.setex(cacheKey, 3600, JSON.stringify(response.content));
  return response.content;
}`
},
{
  id: 'ai_10',
  title: 'Streaming Responses & Real-Time UX',
  badge: 'Performance',
  badgeClass: 'badge-practice',
  content: [
    'LLMs generate tokens sequentially — streaming delivers each token to the client as it\'s generated rather than waiting for the full response. A 500-token response takes ~5 seconds to generate fully. With streaming, the first tokens appear in <200ms and the text flows progressively. Research shows users perceive streamed responses as faster even when total generation time is identical.',
    '**Server-Sent Events (SSE)** is the browser transport for streaming. The server sends a series of `data: ...\\n\\n` delimited messages over a persistent HTTP connection. The client reads them with `EventSource` API or the `fetch` API with a `ReadableStream`. SSE is half-duplex (server → client only) and automatically reconnects — ideal for AI streaming.',
    'The **Vercel AI SDK** (`ai` package) abstracts streaming for the most common patterns. `streamText()` returns a `ReadableStream`; `toDataStreamResponse()` converts it to an SSE response. On the React client, `useChat()` hook handles the stream, accumulates the response, and exposes a live `messages` array. For non-React apps, use the raw stream with `getReader()` + async iteration.'
  ],
  code: `// ── Server: stream AI response via SSE ──
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

app.post('/api/analyze-resume', authenticate, async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: 'You are a professional resume analyst. Be concise and specific.',
    prompt: \`Resume: \${resumeText}\n\nJob: \${jobDescription}\n\nAnalyze fit:\`,
    maxTokens: 800,
    temperature: 0.3,
  });

  return result.toDataStreamResponse();  // SSE response
});

// ── React client: useChat hook ──
import { useChat } from 'ai/react';

function ResumeAnalyzer({ resumeText, jobId }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/analyze-resume',
    body: { resumeText, jobId },
    onFinish: (message) => saveAnalysisToHistory(message.content),
  });

  return (
    <div className="analysis-chat">
      {messages.map(m => (
        <MessageBubble key={m.id} role={m.role} content={m.content} />
      ))}
      {isLoading && <StreamingIndicator />}  {/* Shows while tokens arrive */}
    </div>
  );
}`
},
{
  id: 'ai_11',
  title: 'LLM Evaluation & Prompt Testing',
  badge: 'Expert',
  badgeClass: 'badge-concept',
  content: [
    'LLM outputs are non-deterministic — the same prompt can produce different responses on different runs. Traditional unit tests (exact string matching) don\'t work. Instead, you need **evaluation frameworks** that assess quality dimensions: factual accuracy, hallucination rate, adherence to format constraints, helpfulness, and safety. This is the emerging discipline of "LLMOps".',
    '**LangSmith** (from LangChain) provides a tracing and evaluation platform. Every LLM call is logged with its full prompt, response, and token count. You build an **eval dataset** (curated golden examples with expected outputs), run your prompt against them, and use an LLM-as-judge to score each response. Track score over time — prompt tuning should move the score up, not down.',
    '**RAGAS** (Retrieval Augmented Generation Assessment) provides 4 automatic metrics for RAG pipelines: **Faithfulness** (does the answer follow from the retrieved context?), **Answer Relevancy** (does the answer address the question?), **Context Precision** (are the retrieved chunks actually relevant?), **Context Recall** (were all necessary facts retrieved?). Running RAGAS on a test set before every deploy is the LLM equivalent of running your unit test suite.'
  ],
  code: `// ── Build an eval dataset ──
const evalDataset = [
  {
    question: 'Am I qualified for a Senior React Engineer role?',
    resume: 'John, 3 years React, TypeScript, Redux, GraphQL',
    jobDesc: 'Senior React Engineer: 5+ years React, TypeScript required',
    expectedOutcome: 'mentions experience gap, references 5 year requirement',
  },
  {
    question: 'Should I apply?',
    resume: 'Alice, 7 years React, AWS certified, team lead experience',
    jobDesc: 'Senior React Engineer: 5+ years React, TypeScript required',
    expectedOutcome: 'positive match assessment, notes strong fit',
  },
];

// ── Automated evaluation with LLM-as-judge ──
async function evaluateResponse(
  question: string, resume: string, response: string, expectedOutcome: string
) {
  const judgePrompt = \`
    Score this resume analysis response from 1-5 on:
    1. Accuracy (does it match the expected outcome?)
    2. Specificity (does it cite specific resume/job details?)
    3. Helpfulness (gives actionable advice?)

    Expected: \${expectedOutcome}
    Actual: \${response}

    Return JSON: { accuracy: N, specificity: N, helpfulness: N, reasoning: "..." }
  \`;

  const judgment = await claude.invoke(judgePrompt);
  return JSON.parse(judgment.content);
}

// ── Run eval suite in CI ──
// npm run eval  → runs all eval cases → fails if avg score < 4.0`
}
];

