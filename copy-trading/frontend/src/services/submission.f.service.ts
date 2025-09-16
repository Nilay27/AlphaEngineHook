// services/submissions.service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || "https://learn-ledger-api.vercel.app";

export interface Submission {
  submissionId: string;
  projectId: string;
  projectName?: string; // This might come from another API or needs to be added
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
  status: "pending" | "merged" | "awarded" | "rejected" ;
  updatedAt: string;
  createdAt: string;
}

export interface SubmissionsResponse {
  isSuccess: boolean;
  data: Submission[];
}

export interface SubmissionDetailResponse {
  isSuccess: boolean;
  data: Submission;
}

export interface SubmissionCreateRequest {
  projectId: string;
  walletEns: string;
  walletAddress: string;
  prLink: string;
}

export interface SubmissionCreateResponse {
  isSuccess: boolean;
  message: string;
  data: Submission;
}

/**
 * Fetch all submissions for a freelancer
 */
export const fetchSubmissions = async (
  walletAddress: string,
  walletEns: string,
  role: string = "freelancer"
): Promise<SubmissionsResponse> => {
  const payload = {
    walletAddress,
    walletEns: walletEns ? walletEns.replace(/\.edu$/, "") : "",
    role
  };

  try {
    const response = await axios.post<SubmissionsResponse>(
      `${API_BASE_URL}/api/submissions/read`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Add project names for each submission (if they're not already in the API response)
    // In a real app, you might need another API call to get project names if they're not included
    const submissionsWithNames = response.data.data.map(submission => ({
      ...submission,
      projectName: submission.projectName || `Project #${submission.projectId.substring(0, 6)}`
    }));

    return {
      isSuccess: response.data.isSuccess,
      data: submissionsWithNames
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
};

/**
 * Fetch a specific submission by ID
 */
export const fetchSubmissionById = async (
  submissionId: string
): Promise<SubmissionDetailResponse> => {
  try {
    const response = await axios.get<SubmissionDetailResponse>(
      `${API_BASE_URL}/api/submissions/read?submissionId=${submissionId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Make sure the projectName is set
    const submissionWithName = {
      ...response.data.data,
      projectName: response.data.data.projectName || `Project #${response.data.data.projectId.substring(0, 6)}`
    };

    return {
      isSuccess: response.data.isSuccess,
      data: submissionWithName
    };
  } catch (error) {
    console.error("Error fetching submission details:", error);
    throw error;
  }
};

/**
 * Convert boolean or numeric status to text status
 */
export const getStatusText = (submission: Submission): string => {
  // First check the status field
  if (submission.status === "pending") return "Pending";
  if (submission.status === "merged") return "Merged";
  if (submission.status === "awarded") return "Awarded";
  if (submission.status === "rejected") return "Rejected";
  
  // Fallback to isMerged
  if (submission.isMerged === true) return "Merged";
  
  // Default
  return "Pending";
};

/**
 * Get status text from a status string (for filtering)
 */
export const getStatusTextFromString = (status: string): string => {
  if (status === "pending") return "Pending";
  if (status === "merged") return "Merged";
  if (status === "awarded") return "Awarded";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

/**
 * Get status code from text status (for filtering)
 */
export const getStatusCode = (statusText: string): string => {
  switch (statusText) {
    case "Pending":
      return "pending";
    case "Merged":
      return "merged";
    case "Awarded":
      return "awarded";
    case "Rejected":
      return "rejected";
    default:
      return "pending";
  }
};

/**
 * Format a date for display
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

/**
 * Create a new submission for a project
 */
export const createSubmission = async (
  projectId: string,
  walletAddress: string,
  walletEns: string,
  prLink: string
): Promise<unknown> => {
  try {
    const payload = {
      projectId,
      walletEns: walletEns ? walletEns.replace(/\.edu$/, "") : "",
      walletAddress,
      prLink
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/submissions/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
};

export const parseProjectName = (prLink: string): string => {
  try {
    // Try to parse project name from GitHub URL
    const match = prLink.match(/github\.com\/[^/]+\/([^/]+)/);
    if (match && match[1]) {
      return match[1].replace(/-/g, ' ').replace(/_/g, ' ');
    }
  } catch (e) {
    console.error("Error parsing project name", e);
  }
  
  return "Project Submission"; // Default project name
};

/**
 * Parse repo owner and name from PR URL
 */
export const parseRepoInfo = (prLink: string): { owner: string; repo: string } => {
  try {
    const match = prLink.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match && match[1] && match[2]) {
      return {
        owner: match[1],
        repo: match[2]
      };
    }
  } catch (e) {
    console.error("Error parsing repo info", e);
  }
  
  return { owner: "", repo: "" };
};

/**
 * Parse PR number from URL
 */
export const parsePrNumber = (prLink: string): string => {
  try {
    const match = prLink.match(/\/pull\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    console.error("Error parsing PR number", e);
  }
  
  return "";
};