export type Stage =
  | 'Lead'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Priority = 'Low' | 'Medium' | 'High';

export interface Deal {
  id: string;
  company: string;
  contact: string;
  email: string;
  value: number;
  stage: Stage;
  priority: Priority;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'value' | 'createdAt' | 'company';
export type SortDir = 'asc' | 'desc';

export interface Filters {
  search: string;
  stage: Stage | 'All';
  priority: Priority | 'All';
  sortField: SortField;
  sortDir: SortDir;
}
