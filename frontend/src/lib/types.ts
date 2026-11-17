export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
  restaurants?: Restaurant[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  retentionOffer?: string | null;
  ownerId?: string;
  totalFeedbacks?: number;
  averageRating?: number;
  createdAt?: string;
}

export interface Feedback {
  id: string;
  restaurantId: string;
  rating: number;
  positiveFeedback?: string | null;
  improvementFeedback?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  tableNumber?: string | null;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positiveRate: number;
  negativeRate: number;
  leadsCount: number;
  leadCaptureRate: number;
  starDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  timeline: Array<{
    date: string;
    count: number;
    avgRating: number;
  }>;
}

export interface FeedbackFilterParams {
  sentiment?: 'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status?: 'ALL' | 'NEW' | 'REVIEWED' | 'CONTACTED' | 'RESOLVED';
  hasContactInfo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
