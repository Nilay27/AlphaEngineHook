// services/dashboard.company.service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || "https://learn-ledger-api.vercel.app";

// Interfaces for API responses
export interface CompanyDashboardMetrics {
  isSuccess: boolean;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects?: number;
  closedProjects?: number;
  pullRequests: {
    timeFrame: string;
    count: number;
    growthPercent: number;
  };
  statsUpdatedAt: string;
}

export interface Update {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export interface UpdatesResponse {
  isSuccess: boolean;
  updates: Update[];
}

export interface Submission {
  submissionId: string;
  projectId: string;
  projectName?: string; // This might need to be added manually
  projectOwnerWalletEns: string;
  projectOwnerWalletAddress: string;
  projectRepo: string;
  freelancerWalletEns: string;
  freelancerWalletAddress: string;
  prLink: string;
  submissionText: string;
  repoOwner: string;
  repoName: string;
  prNumber: string;
  isMerged: boolean;
  status: "pending" | "approved" | "rejected" | "in-review";
  updatedAt: string;
  createdAt: string;
}

export interface SubmissionsResponse {
  isSuccess: boolean;
  data: Submission[];
}

/**
 * Fetch dashboard metrics for a company
 */
export const fetchCompanyDashboardMetrics = async (
  walletAddress: string,
  walletEns: string
): Promise<CompanyDashboardMetrics> => {
  const payload = {
    role: "company",
    
    walletAddress,
    walletEns: walletEns ? walletEns.replace(/\.edu$/, "") : ""
  };

  const response = await axios.post<CompanyDashboardMetrics>(
    `${API_BASE_URL}/api/company/dashboard/metrics`, 
    payload,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

/**
 * Fetch company updates
 */
export const fetchCompanyUpdates = async (limit: number = 5): Promise<UpdatesResponse> => {
  const response = await axios.get<UpdatesResponse>(
    `${API_BASE_URL}/api/updates?limit=${limit}&role=company`
  );

  return response.data;
};

/**
 * Fetch company submissions/pull requests
 */
export const fetchCompanySubmissions = async (
  walletAddress: string,
  walletEns: string
): Promise<SubmissionsResponse> => {
  const payload = {
    walletAddress,
    walletEns: walletEns ? walletEns.replace(/\.edu$/, "") : "",
    role: "company"
  };

  const response = await axios.post<SubmissionsResponse>(
    `${API_BASE_URL}/api/submissions/read`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

/**
 * Utility: Format relative time
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
};