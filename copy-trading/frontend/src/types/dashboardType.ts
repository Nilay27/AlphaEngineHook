// types/datatype.ts

// Update the existing Project interface to match the API response
export interface Project {
    projectId: string;
    projectName: string;
    projectDescription: string;
    prizeAmount: string;
    projectStatus: "open" | "closed" | "in-progress";
    projectOwnerWalletEns: string;
    projectOwnerWalletAddress: string;
    requiredSkills: string;
    completionSkills: string;
    projectRepo: string;
    assignedFreelancerWalletEns: string | null;
    assignedFreelancerWalletAddress: string | null;
    deadline: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Dashboard metrics interface
  export interface DashboardStats {
    totalSubmissions: number;
    approved: number;
    rejected: number;
    totalEarnings: number;
    earningsGrowth: number;
  }