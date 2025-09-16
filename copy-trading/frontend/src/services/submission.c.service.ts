// services/submission.c.service.ts
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
  status: "pending" | "merged" | "awarded" | "rejected";
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

/**
 * Fetch all submissions for a company
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

    // Add project names for each submission if they're not already in the API response
    const submissionsWithNames = response.data.data.map(submission => ({
      ...submission,
      projectName: submission.projectName || `Project #${submission.projectId.substring(0, 6)}`
    }));

    return {
      isSuccess: response.data.isSuccess,
      data: submissionsWithNames
    };
  } catch (error) {
    console.error("Error fetching company submissions:", error);
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

    return response.data;
  } catch (error) {
    console.error(`Error fetching submission with ID ${submissionId}:`, error);
    throw error;
  }
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (
  submissionId: string,
  status: "pending" | "merged" | "awarded" | "rejected"
): Promise<{ isSuccess: boolean }> => {
  try {
    const payload = {
      submissionId,
      status
    };

    const response = await axios.put<{ isSuccess: boolean }>(
      `${API_BASE_URL}/api/submissions/update`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating submission status for ID ${submissionId}:`, error);
    throw error;
  }
};

/**
 * Convert status string to numeric code (for UI display)
 */
export const getStatusCode = (status: string): number => {
  switch (status) {
    case "pending":
      return 0;
    case "merged":
      return 1;
    case "awarded":
      return 2;
    case "rejected":
      return -1;
    default:
      return 0;
  }
};

/**
 * Convert numeric code to status string (for API calls)
 */
export const getStatusString = (code: number): "pending" | "merged" | "awarded" | "rejected" => {
  switch (code) {
    case 0:
      return "pending";
    case 1:
      return "merged";
    case 2:
      return "awarded";
    case -1:
      return "rejected";
    default:
      return "pending";
  }
};

/**
 * Get display text for status
 */
export const getStatusText = (code: number): string => {
  switch (code) {
    case 0:
      return "Pending";
    case 1:
      return "Merged";
    case 2:
      return "Awarded";
    case -1:
      return "Rejected";
    default:
      return "Unknown";
  }
};

/**
 * Format relative time (time ago)
 */
export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return "Just now";
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Recently";
  }
}; 