export interface Vendor {
  id: string;
  name: string;
  email: string;
  tags?: string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  content: string;
  structuredAnalysis: any; // Parsed JSON
  score?: number;
  vendor?: Vendor;
  createdAt: string;
}

export interface Rfp {
  id: string;
  title: string;
  description: string;
  structuredData: any; // Parsed JSON
  status: 'draft' | 'sent' | 'closed';
  createdAt: string;
  _count?: {
    proposals: number;
  };
  proposals?: Proposal[];
}
