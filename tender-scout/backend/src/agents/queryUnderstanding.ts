import { ParsedQuery, TenderStatus } from '../schemas/tender.js';

// Dictionary of known Indian States and Union Territories
const INDIAN_STATES_AND_UT = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Major Indian cities and procurement hubs
const INDIAN_CITIES: Record<string, string> = {
  'shimla': 'Himachal Pradesh',
  'kangra': 'Himachal Pradesh',
  'dharamshala': 'Himachal Pradesh',
  'mandi': 'Himachal Pradesh',
  'kullu': 'Himachal Pradesh',
  'solan': 'Himachal Pradesh',
  'mumbai': 'Maharashtra',
  'pune': 'Maharashtra',
  'nagpur': 'Maharashtra',
  'thane': 'Maharashtra',
  'nashik': 'Maharashtra',
  'new delhi': 'Delhi',
  'delhi': 'Delhi',
  'ncr': 'Delhi',
  'bengaluru': 'Karnataka',
  'bangalore': 'Karnataka',
  'mysuru': 'Karnataka',
  'chennai': 'Tamil Nadu',
  'coimbatore': 'Tamil Nadu',
  'hyderabad': 'Telangana',
  'kolkata': 'West Bengal',
  'ahmedabad': 'Gujarat',
  'surat': 'Gujarat',
  'jaipur': 'Rajasthan',
  'jodhpur': 'Rajasthan',
  'lucknow': 'Uttar Pradesh',
  'kanpur': 'Uttar Pradesh',
  'varanasi': 'Uttar Pradesh',
  'noida': 'Uttar Pradesh',
  'greater noida': 'Uttar Pradesh',
  'patna': 'Bihar',
  'bhopal': 'Madhya Pradesh',
  'indore': 'Madhya Pradesh',
  'chandigarh': 'Chandigarh',
  'mohali': 'Punjab',
  'amritsar': 'Punjab',
  'ludhiana': 'Punjab',
  'dehradun': 'Uttarakhand',
  'haridwar': 'Uttarakhand',
  'guwahati': 'Assam',
  'bhubaneswar': 'Odisha',
  'ranchi': 'Jharkhand',
  'raipur': 'Chhattisgarh'
};

// Common Organizations & Departments
const KNOWN_ORGS: Record<string, string> = {
  'pwd': 'Public Works Department (PWD)',
  'public works': 'Public Works Department (PWD)',
  'hp pwd': 'Himachal Pradesh PWD',
  'hppwd': 'Himachal Pradesh PWD',
  'cpwd': 'Central Public Works Department (CPWD)',
  'nhai': 'National Highways Authority of India (NHAI)',
  'ntpc': 'National Thermal Power Corporation (NTPC)',
  'bhel': 'Bharat Heavy Electricals Limited (BHEL)',
  'iocl': 'Indian Oil Corporation Limited (IOCL)',
  'ongc': 'Oil and Natural Gas Corporation (ONGC)',
  'railways': 'Indian Railways',
  'railway': 'Indian Railways',
  'ireps': 'Indian Railways',
  'mc': 'Municipal Corporation',
  'municipal corporation': 'Municipal Corporation',
  'nagar nigam': 'Municipal Corporation',
  'aiims': 'All India Institute of Medical Sciences (AIIMS)',
  'iit': 'Indian Institute of Technology (IIT)',
  'nit': 'National Institute of Technology (NIT)',
  'isro': 'Indian Space Research Organisation (ISRO)',
  'drdo': 'Defence Research and Development Organisation (DRDO)',
  'mes': 'Military Engineer Services (MES)',
  'bro': 'Border Roads Organisation (BRO)',
  'pmgsy': 'Pradhan Mantri Gram Sadak Yojana (PMGSY)',
  'jal nigam': 'Jal Nigam / Water Supply',
  'jal shakti': 'Jal Shakti Vibhag'
};

// Categories & synonym mappings
const CATEGORY_MAP: Record<string, string[]> = {
  'Works': ['civil', 'construction', 'road', 'roads', 'bridge', 'building', 'drainage', 'paving', 'repair', 'renovation', 'plumbing', 'electrical works', 'infrastructure', 'highway', 'works', 'masonry'],
  'Goods': ['supply', 'equipment', 'material', 'procurement of', 'vehicles', 'computers', 'hardware', 'stationery', 'medicines', 'drugs', 'goods', 'machinery', 'furniture', 'pipes', 'cement', 'steel'],
  'Services': ['consultancy', 'maintenance', 'security', 'housekeeping', 'facility management', 'catering', 'it services', 'software', 'cloud', 'audit', 'transport', 'services', 'manpower', 'hiring']
};

/**
 * Parses Indian currency representations like "50 lakh", "2 crore", "₹25,00,000", "50L", "2cr" into numeric values in INR.
 */
export function parseIndianCurrency(text: string): { min?: number; max?: number } {
  let min: number | undefined;
  let max: number | undefined;

  const normalized = text.toLowerCase().replace(/,/g, '');

  // Pattern: "under 50 lakh", "below 50 lakhs", "less than 2 crore", "< 50 lakh", "max 50 lakh", "up to 50 lakh"
  const maxPatterns = [
    /(?:under|below|less than|max|maximum|up to|upto|within|<=|<)\s*(?:rs\.?|inr|₹)?\s*([\d.]+)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?/i,
    /(?:rs\.?|inr|₹)\s*([\d.]+)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?\s*(?:max|or less)/i
  ];

  for (const pattern of maxPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase() || '';
      if (!isNaN(num)) {
        if (unit.startsWith('cr')) max = num * 10000000;
        else if (unit.startsWith('l')) max = num * 100000;
        else if (unit.startsWith('k') || unit.startsWith('thous')) max = num * 1000;
        else if (num < 100) max = num * 100000; // default 50 means 50 lakhs in tender contexts
        else max = num;
        break;
      }
    }
  }

  // Pattern: "above 10 lakh", "more than 10 lakhs", "min 10 lakh", "> 10 lakh"
  const minPatterns = [
    /(?:above|over|more than|min|minimum|greater than|>=|>)\s*(?:rs\.?|inr|₹)?\s*([\d.]+)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?/i
  ];

  for (const pattern of minPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase() || '';
      if (!isNaN(num)) {
        if (unit.startsWith('cr')) min = num * 10000000;
        else if (unit.startsWith('l')) min = num * 100000;
        else if (unit.startsWith('k') || unit.startsWith('thous')) min = num * 1000;
        else if (num < 100) min = num * 100000;
        else min = num;
        break;
      }
    }
  }

  // Pattern: "between X (lakh) and Y (lakh)" or "10 to 50 lakh"
  const betweenPattern = /(?:between|from)?\s*(?:rs\.?|inr|₹)?\s*([\d.]+)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?\s*(?:to|-|and)\s*(?:rs\.?|inr|₹)?\s*([\d.]+)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?/i;
  const betweenMatch = normalized.match(betweenPattern);
  if (betweenMatch && (normalized.includes('between') || normalized.includes('from') || normalized.includes(' to ') || normalized.includes(' and '))) {
    const num1 = parseFloat(betweenMatch[1]);
    const unit1 = betweenMatch[2]?.toLowerCase();
    const num2 = parseFloat(betweenMatch[3]);
    const unit2 = (betweenMatch[4]?.toLowerCase()) || unit1 || 'lakh';

    let mult1 = 100000;
    if (unit1?.startsWith('cr')) mult1 = 10000000;
    else if (unit1?.startsWith('k')) mult1 = 1000;
    else if (!unit1 && unit2?.startsWith('cr')) mult1 = 10000000;
    else if (!unit1 && unit2?.startsWith('k')) mult1 = 1000;

    let mult2 = 100000;
    if (unit2?.startsWith('cr')) mult2 = 10000000;
    else if (unit2?.startsWith('k')) mult2 = 1000;

    min = num1 * mult1;
    max = num2 * mult2;
    return { min, max };
  }

  return { min, max };
}

/**
 * Extracts locations (States, UTs, Cities) from natural language text.
 */
export function extractLocations(text: string): string[] {
  const foundLocations = new Set<string>();
  const lowerText = ` ${text.toLowerCase()} `;

  // Check Indian States and UTs
  for (const state of INDIAN_STATES_AND_UT) {
    const stateRegex = new RegExp(`\\b${state.toLowerCase()}\\b`, 'i');
    if (stateRegex.test(lowerText)) {
      foundLocations.add(state);
    }
  }

  // Check Major Cities and map to their State if state not already present
  for (const [city, state] of Object.entries(INDIAN_CITIES)) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(lowerText)) {
      foundLocations.add(city.charAt(0).toUpperCase() + city.slice(1));
      foundLocations.add(state);
    }
  }

  return Array.from(foundLocations);
}

/**
 * Extracts organizations from text.
 */
export function extractOrganization(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const [key, fullName] of Object.entries(KNOWN_ORGS)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerText)) {
      return fullName;
    }
  }
  return null;
}

/**
 * Detects tender category from keywords.
 */
export function detectCategory(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lowerText)) {
        return category;
      }
    }
  }
  return null;
}

/**
 * Extracts core search keywords by stripping stop words, locations, and value constraints.
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'find', 'search', 'get', 'show', 'list', 'look', 'active', 'open', 'live',
    'tender', 'tenders', 'bids', 'bid', 'in', 'at', 'for', 'the', 'a', 'an',
    'under', 'below', 'above', 'upto', 'up', 'to', 'lakh', 'lakhs', 'crore',
    'crores', 'cr', 'lac', 'lacs', 'rs', 'inr', 'rupees', 'closing', 'today',
    'tomorrow', 'this', 'week', 'month', 'latest', 'recent', 'government',
    'govt', 'state', 'central', 'all', 'any', 'near', 'from', 'with', 'and', 'or', 'of'
  ]);

  // Remove known states/cities and org tokens
  let cleaned = text.toLowerCase();
  for (const state of INDIAN_STATES_AND_UT) {
    cleaned = cleaned.replace(new RegExp(`\\b${state.toLowerCase()}\\b`, 'g'), ' ');
  }
  for (const city of Object.keys(INDIAN_CITIES)) {
    cleaned = cleaned.replace(new RegExp(`\\b${city}\\b`, 'g'), ' ');
  }
  for (const org of Object.keys(KNOWN_ORGS)) {
    cleaned = cleaned.replace(new RegExp(`\\b${org}\\b`, 'g'), ' ');
  }

  // Remove currency numbers
  cleaned = cleaned.replace(/₹?\s*\d+(?:\.\d+)?\s*(?:cr|crore|crores|lakh|lakhs|lac|lacs|k)?/gi, ' ');
  cleaned = cleaned.replace(/[^\w\s-]/g, ' ');

  const tokens = cleaned.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));
  return Array.from(new Set(tokens));
}

/**
 * Agent 1: Query Understanding Agent
 * Converts unstructured natural language into a deterministic, structured search specification.
 */
export class QueryUnderstandingAgent {
  public parse(query: string): ParsedQuery {
    const raw = query.trim();
    const locations = extractLocations(raw);
    const org = extractOrganization(raw);
    const category = detectCategory(raw);
    const { min, max } = parseIndianCurrency(raw);
    const keywords = extractKeywords(raw);

    // If keywords ended up empty (e.g. user just said "Himachal Pradesh PWD tenders"), provide reasonable category or location tokens
    if (keywords.length === 0) {
      if (category) keywords.push(category.toLowerCase());
      else if (org) keywords.push(org.split(' ')[0].toLowerCase());
      else keywords.push('tender');
    }

    // Status preference
    let status: TenderStatus = 'OPEN';
    const lower = raw.toLowerCase();
    if (lower.includes('expired') || lower.includes('closed')) {
      status = 'EXPIRED';
    } else if (lower.includes('cancelled')) {
      status = 'CANCELLED';
    } else if (lower.includes('all tenders') || lower.includes('any status')) {
      status = 'OPEN'; // default to OPEN prioritize
    }

    let deadline_preference: 'open' | 'closing_soon' | 'any' = 'open';
    if (lower.includes('closing this week') || lower.includes('closing soon') || lower.includes('expiring soon')) {
      deadline_preference = 'closing_soon';
    } else if (lower.includes('any deadline') || lower.includes('all')) {
      deadline_preference = 'any';
    }

    return {
      raw_query: raw,
      keywords,
      location: locations,
      organization: org,
      category,
      min_value: min ?? null,
      max_value: max ?? null,
      status,
      deadline_preference
    };
  }
}

export const queryUnderstandingAgent = new QueryUnderstandingAgent();
