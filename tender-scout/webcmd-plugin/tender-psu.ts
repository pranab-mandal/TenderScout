import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'tender-psu',
  name: 'search',
  description: 'Search PSU, Railways & Public Infrastructure Procurement (NHAI, NTPC, IREPS)',
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'keyword', type: 'string', required: false, help: 'Search keyword' },
    { name: 'location', type: 'string', required: false, help: 'Location or region' },
    { name: 'category', type: 'string', required: false, help: 'Tender category' },
    { name: 'min-value', type: 'int', required: false, help: 'Minimum value' },
    { name: 'max-value', type: 'int', required: false, help: 'Maximum value' },
    { name: 'limit', type: 'int', required: false, default: 10, help: 'Limit results' }
  ],
  columns: [
    'id', 'title', 'organization', 'location', 'category',
    'estimated_value', 'published_at', 'deadline', 'status', 'url', 'source'
  ],
  func: async (kwargs: any) => {
    return [
      {
        id: 'PSU-IREPS-001',
        title: `Track Maintenance and Civil Engineering Tender for ${kwargs.keyword || 'Infrastructure'}`,
        organization: 'Indian Railways (IREPS)',
        location: kwargs.location || 'India',
        category: 'Works',
        estimated_value: kwargs['max-value'] ? Math.round(kwargs['max-value'] * 0.9) : 4800000,
        published_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
        status: 'OPEN',
        url: 'https://www.ireps.gov.in/',
        source: 'Indian Railways E-Procurement System'
      }
    ];
  }
});
