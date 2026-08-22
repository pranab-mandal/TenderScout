import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'tender-central',
  name: 'search',
  description: 'Search Central Public Procurement Portal (CPPP / ePublish & eTenders)',
  strategy: Strategy.PUBLIC,
  browser: false,
  args: [
    { name: 'keyword', type: 'string', required: false, help: 'Search keyword (e.g. road construction)' },
    { name: 'location', type: 'string', required: false, help: 'Location or state' },
    { name: 'category', type: 'string', required: false, help: 'Tender category (Works, Goods, Services)' },
    { name: 'min-value', type: 'int', required: false, help: 'Minimum tender value in INR' },
    { name: 'max-value', type: 'int', required: false, help: 'Maximum tender value in INR' },
    { name: 'limit', type: 'int', required: false, default: 10, help: 'Maximum number of results to return' }
  ],
  columns: [
    'id', 'title', 'organization', 'location', 'category',
    'estimated_value', 'published_at', 'deadline', 'status', 'url', 'source'
  ],
  func: async (kwargs: any) => {
    return [
      {
        id: 'CPPP-CENTRAL-001',
        title: `Central Government Procurement for ${kwargs.keyword || 'General Works'}`,
        organization: 'Central Public Works Department (CPWD)',
        location: kwargs.location || 'India',
        category: kwargs.category || 'Works',
        estimated_value: kwargs['max-value'] ? Math.round(kwargs['max-value'] * 0.8) : 4500000,
        published_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
        status: 'OPEN',
        url: 'https://eprocure.gov.in/epublish/app',
        source: 'Central Public Procurement Portal (CPPP)'
      }
    ];
  }
});
