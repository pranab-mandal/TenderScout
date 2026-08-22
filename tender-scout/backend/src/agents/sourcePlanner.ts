import { ParsedQuery } from '../schemas/tender.js';

export interface PlannedSource {
  id: string;
  name: string;
  category: 'CENTRAL' | 'STATE' | 'PSU' | 'SEARCH' | 'MUNICIPAL';
  portal_url: string;
  adapter_name: string;
  priority: number; // 1 (highest) to 5
  enabled: boolean;
  notes: string;
}

export class SourcePlanningAgent {
  private registeredSources: PlannedSource[] = [
    {
      id: 'central-eprocure',
      name: 'Central Public Procurement Portal (CPPP / ePublish)',
      category: 'CENTRAL',
      portal_url: 'https://eprocure.gov.in/epublish/app',
      adapter_name: 'tender-central',
      priority: 1,
      enabled: true,
      notes: 'Official Central Government & Public Procurement System'
    },
    {
      id: 'central-etenders',
      name: 'Central Government eProcurement (eTenders GePNIC)',
      category: 'CENTRAL',
      portal_url: 'https://etenders.gov.in/eprocure/app',
      adapter_name: 'tender-central',
      priority: 1,
      enabled: true,
      notes: 'Central Government Department & Ministry Tenders'
    },
    {
      id: 'state-hp',
      name: 'Government of Himachal Pradesh eProcurement Portal',
      category: 'STATE',
      portal_url: 'https://hptenders.gov.in/nicgep/app',
      adapter_name: 'tender-state',
      priority: 1,
      enabled: true,
      notes: 'State Department Tenders (HP PWD, Jal Shakti, Urban Dev, Health)'
    },
    {
      id: 'state-maha',
      name: 'Government of Maharashtra eProcurement Portal',
      category: 'STATE',
      portal_url: 'https://mahatenders.gov.in/nicgep/app',
      adapter_name: 'tender-state',
      priority: 2,
      enabled: true,
      notes: 'Maharashtra State eTenders & Local Bodies'
    },
    {
      id: 'state-delhi',
      name: 'Delhi State Government eProcurement Portal',
      category: 'STATE',
      portal_url: 'https://govtprocurement.delhi.gov.in/nicgep/app',
      adapter_name: 'tender-state',
      priority: 2,
      enabled: true,
      notes: 'Delhi State Government & Municipal Tenders'
    },
    {
      id: 'psu-infra',
      name: 'PSU & Infrastructure Procurement (NHAI / NTPC / Indian Railways IREPS)',
      category: 'PSU',
      portal_url: 'https://www.ireps.gov.in/',
      adapter_name: 'tender-psu',
      priority: 2,
      enabled: true,
      notes: 'Major Infrastructure & PSU Public Tenders'
    },
    {
      id: 'gov-discovery',
      name: 'Official Government Tender Discovery Crawler (*.gov.in / *.nic.in)',
      category: 'SEARCH',
      portal_url: 'https://eprocure.gov.in',
      adapter_name: 'tender-search',
      priority: 1,
      enabled: true,
      notes: 'Verified discovery engine across all official Indian government domains'
    }
  ];

  /**
   * Plans and selects relevant tender sources based on the parsed query parameters.
   */
  public plan(parsedQuery: ParsedQuery): PlannedSource[] {
    const selected: PlannedSource[] = [];
    const queryLocations = parsedQuery.location.map(l => l.toLowerCase());
    const org = (parsedQuery.organization || '').toLowerCase();
    const queryText = parsedQuery.raw_query.toLowerCase();

    // 1. Check for specific State portals
    const isHP = queryLocations.some(l => l.includes('himachal') || l.includes('shimla') || l.includes('kangra') || l.includes('mandi') || l.includes('solan') || l.includes('kullu')) || queryText.includes('himachal') || queryText.includes('hp');
    const isMaha = queryLocations.some(l => l.includes('maharashtra') || l.includes('mumbai') || l.includes('pune') || l.includes('nagpur')) || queryText.includes('maharashtra');
    const isDelhi = queryLocations.some(l => l.includes('delhi') || l.includes('ncr')) || queryText.includes('delhi');

    if (isHP) {
      const hp = this.registeredSources.find(s => s.id === 'state-hp');
      if (hp) selected.push(hp);
    }
    if (isMaha) {
      const maha = this.registeredSources.find(s => s.id === 'state-maha');
      if (maha) selected.push(maha);
    }
    if (isDelhi) {
      const delhi = this.registeredSources.find(s => s.id === 'state-delhi');
      if (delhi) selected.push(delhi);
    }

    // 2. Check for PSU / Railway / Infrastructure specific queries
    const isPSU = org.includes('nhai') || org.includes('ntpc') || org.includes('railway') || org.includes('ireps') || org.includes('bhel') || org.includes('iocl') || org.includes('ongc') || queryText.includes('railway') || queryText.includes('highway') || queryText.includes('nhai') || queryText.includes('ntpc');
    if (isPSU) {
      const psu = this.registeredSources.find(s => s.id === 'psu-infra');
      if (psu) selected.push(psu);
    }

    // 3. Central eProcurement Portal & Discovery Crawler are always selected for broad coverage
    const centralPub = this.registeredSources.find(s => s.id === 'central-eprocure');
    if (centralPub && !selected.some(s => s.id === centralPub.id)) {
      selected.push(centralPub);
    }

    const centralEtenders = this.registeredSources.find(s => s.id === 'central-etenders');
    if (centralEtenders && !selected.some(s => s.id === centralEtenders.id)) {
      selected.push(centralEtenders);
    }

    const discovery = this.registeredSources.find(s => s.id === 'gov-discovery');
    if (discovery && !selected.some(s => s.id === discovery.id)) {
      selected.push(discovery);
    }

    // If no specific state was triggered and query is general, add default state source for wide variety
    if (selected.filter(s => s.category === 'STATE').length === 0) {
      const defaultState = this.registeredSources.find(s => s.id === 'state-hp');
      if (defaultState && !selected.some(s => s.id === defaultState.id)) {
        selected.push(defaultState);
      }
    }

    return selected.sort((a, b) => a.priority - b.priority);
  }

  public getAllRegisteredSources(): PlannedSource[] {
    return this.registeredSources;
  }
}

export const sourcePlanningAgent = new SourcePlanningAgent();
