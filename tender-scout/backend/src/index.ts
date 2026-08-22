import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchOrchestrator } from './services/searchOrchestrator.js';
import { queryUnderstandingAgent } from './agents/queryUnderstanding.js';
import { sourcePlanningAgent } from './agents/sourcePlanner.js';
import { webCmdRunner } from './webcmd/runner.js';
import { activeTenderVerifier } from './services/verifier.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TenderScout API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 1. Natural Language / Structured Search Endpoint
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, location, organization, category, min_value, max_value, status, limit } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Field "query" is required as a string.' });
    }

    const response = await searchOrchestrator.search({
      query,
      location,
      organization,
      category,
      min_value: min_value ? Number(min_value) : undefined,
      max_value: max_value ? Number(max_value) : undefined,
      status,
      limit: limit ? Number(limit) : 20
    });

    return res.json(response);
  } catch (err: any) {
    console.error('[TenderScout Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during tender search' });
  }
});

// 2. Query Understanding / Parameter Extraction Endpoint
app.post('/api/parse', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  const parsed = queryUnderstandingAgent.parse(query);
  return res.json(parsed);
});

// 3. Source Registry & Planning Endpoint
app.get('/api/sources', (req: Request, res: Response) => {
  const sources = sourcePlanningAgent.getAllRegisteredSources();
  return res.json({ sources });
});

// 4. WebCMD Adapters List Endpoint
app.get('/api/adapters', (req: Request, res: Response) => {
  const adapters = webCmdRunner.listAdapters();
  return res.json({ adapters });
});

// 5. Individual Tender URL Live Verification Endpoint
app.post('/api/verify', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  const probe = await activeTenderVerifier.probeUrl(url, 6000);
  return res.json(probe);
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 TenderScout Agentic Backend running on port ${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   POST /api/search   - Agentic Search & Discovery`);
  console.log(`   POST /api/parse    - Query Understanding`);
  console.log(`   GET  /api/sources  - Registered Portal Sources`);
  console.log(`   GET  /api/adapters - Registered WebCMD Adapters`);
  console.log(`   POST /api/verify   - Live URL Verification`);
  console.log(`======================================================\n`);
});

export default app;
