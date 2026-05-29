import { useState, useEffect } from 'react';
import { Deal } from '../types';

const STORAGE_KEY = 'pipeline_os_deals';

const SEED_DEALS: Deal[] = [
  { id: '1', company: 'Acme Corp', contact: 'James Miller', email: 'james@acme.com', value: 12000, stage: 'Negotiation', priority: 'High', notes: 'Enterprise contract, decision by EOQ', createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-05-01T14:00:00Z' },
  { id: '2', company: 'Globex GmbH', contact: 'Anna Schmidt', email: 'anna@globex.de', value: 4500, stage: 'Proposal', priority: 'Medium', notes: 'Sent proposal v2, waiting on legal', createdAt: '2026-04-18T11:00:00Z', updatedAt: '2026-04-28T10:00:00Z' },
  { id: '3', company: 'Initech', contact: 'Tom Harris', email: 'tom@initech.com', value: 8200, stage: 'Won', priority: 'High', notes: 'Signed! Onboarding scheduled for June', createdAt: '2026-03-22T08:00:00Z', updatedAt: '2026-04-15T16:00:00Z' },
  { id: '4', company: 'Hooli', contact: 'Priya Patel', email: 'priya@hooli.io', value: 2100, stage: 'Lead', priority: 'Low', notes: 'Found via LinkedIn, intro call done', createdAt: '2026-05-05T13:00:00Z', updatedAt: '2026-05-05T13:00:00Z' },
  { id: '5', company: 'Umbrella AG', contact: 'Klaus Becker', email: 'k.becker@umbrella.de', value: 19500, stage: 'Qualified', priority: 'High', notes: 'Big potential, needs custom integration', createdAt: '2026-04-25T09:30:00Z', updatedAt: '2026-04-30T11:00:00Z' },
  { id: '6', company: 'Weyland Corp', contact: 'Sarah Chen', email: 'schen@weyland.com', value: 3300, stage: 'Lost', priority: 'Medium', notes: 'Went with competitor, price sensitivity', createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-04-20T09:00:00Z' },
  { id: '7', company: 'Soylent Ltd', contact: 'Mike Jordan', email: 'mike@soylent.co', value: 5600, stage: 'Proposal', priority: 'Medium', notes: 'Demo went well, building proposal', createdAt: '2026-05-02T14:00:00Z', updatedAt: '2026-05-08T10:00:00Z' },
  { id: '8', company: 'Cyberdyne', contact: 'Lisa Park', email: 'lpark@cyberdyne.com', value: 31000, stage: 'Negotiation', priority: 'High', notes: 'Strategic deal, CEO involved', createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-05-10T15:00:00Z' },
];

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Deal[];
    } catch {}
    return SEED_DEALS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  }, [deals]);

  const addDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setDeals(prev => [
      { ...deal, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ...prev,
    ]);
  };

  const updateDeal = (id: string, updates: Partial<Omit<Deal, 'id' | 'createdAt'>>) => {
    setDeals(prev =>
      prev.map(d =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  return { deals, addDeal, updateDeal, deleteDeal };
}
