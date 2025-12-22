
import { EnrichedData } from "./types";

/**
 * Simulates enrichment using Clay's data pipeline + MadKudu qualification.
 */
export const enrichLeadWithClay = async (businessName: string, website?: string): Promise<EnrichedData> => {
  // Simulate network latency for API call
  await new Promise(resolve => setTimeout(resolve, 2400));

  const slug = businessName.toLowerCase().replace(/\s+/g, '-');
  const score = Math.floor(Math.random() * 60) + 40; // 40-100 range
  
  let segment: EnrichedData['qualSegment'] = 'Low';
  if (score > 85) segment = 'Very Good';
  else if (score > 70) segment = 'Good';
  else if (score > 55) segment = 'Medium';

  const industries = ['Internet Software', 'Health & Wellness', 'Legal Services', 'E-commerce', 'Construction'];
  const locations = ['New York, USA', 'London, UK', 'California, USA', 'Florida, USA', 'Sydney, AU'];
  const signals = ['Google Ads Buyer', 'High Web Traffic', 'Recent Hiring', 'Legacy Tech Stack', 'Strong Social Presence'];

  return {
    isEnriched: true,
    revenue: `$${(Math.random() * 8 + 0.5).toFixed(1)}M - $${(Math.random() * 15 + 9).toFixed(1)}M`,
    employees: Math.floor(Math.random() * 450) + 15,
    industry: industries[Math.floor(Math.random() * industries.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    qualScore: score,
    qualSegment: segment,
    buyingSignals: signals.sort(() => 0.5 - Math.random()).slice(0, 3),
    linkedin: `https://linkedin.com/company/${slug}`,
    facebook: `https://facebook.com/${slug.replace('-', '')}`,
    techStack: ['React', 'Google Workspace', 'Salesforce', 'HubSpot', 'Stripe'],
    lastFunded: score > 80 ? 'Series B' : 'Profitable'
  };
};
