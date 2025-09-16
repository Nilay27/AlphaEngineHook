// dashboard.service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || "https://learn-ledger-api.vercel.app";

export interface DashboardMetrics {
  isSuccess: boolean;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  activeProjects: number;
  completedProjects: number;
  earnings: {
    amount: number;
    currency: string;
    growthPercent: number;
  };
  statsUpdatedAt: string;
}

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

export interface ProjectsResponse {
  isSuccess: boolean;
  data: Project[];
}

export interface ProjectDetailResponse {
  isSuccess: boolean;
  message: string;
  data: Project & {
    submissions?: Array<Record<string, unknown>>; // Add submissions array to the Project data
  };
}

export interface ProjectResponse {
  isSuccess: boolean;
  message?: string;
  data: {
    projectId: string;
    projectName: string;
    projectDescription: string;
    prizeAmount: string;
    projectStatus: string;
    projectOwnerWalletAddress: string;
    requiredSkills: string;
    completionSkills?: string;
    projectRepo?: string;
    createdAt: string;
    updatedAt: string;
    deadline: string;
  };
}

export interface ErrorResponse {
  message: string;
  error?: string;
}

/**
 * Fetch dashboard metrics for a freelancer
 */
export const fetchDashboardMetrics = async (
  walletAddress: string,
  walletEns: string
): Promise<DashboardMetrics> => {
  const payload = {
    role: "freelancer",
    walletAddress,
    walletEns: walletEns ? walletEns.replace(/\.edu$/, "") : ""
  };

  const response = await axios.post<DashboardMetrics>(
    `${API_BASE_URL}/api/freelancer/dashboard/metrics`,
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
 * Fetch all projects
 */
export const fetchAllProjects = async (): Promise<ProjectsResponse> => {
  const response = await axios.get<ProjectsResponse>(
    `${API_BASE_URL}/api/projects?tab=all`
  );

  return response.data;
};

/**
 * Fetch a project by ID
 */
export const fetchProjectById = async (projectId: string): Promise<ProjectDetailResponse> => {
  try {
    const response = await axios.get<ProjectDetailResponse>(
      `${API_BASE_URL}/api/projects/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

/**
 * Fetch suggested projects for a freelancer
 */
export const fetchSuggestedProjects = async (
  walletEns: string
): Promise<ProjectsResponse> => {
  // Remove .edu suffix if present
  const cleanWalletEns = walletEns ? walletEns.replace(/\.edu$/, "") : "";

  const response = await axios.get<ProjectsResponse>(
    `${API_BASE_URL}/api/freelancer/suggested?walletEns=${cleanWalletEns}`
  );

  return response.data;
};

/**
 * Fetch bookmarked projects (to be implemented on the backend)
 * For now, this will return all projects but would need to be updated
 * when a bookmarking API is available
 */
export const fetchBookmarkedProjects = async (
  _walletAddress?: string,
  _walletEns?: string
): Promise<ProjectsResponse> => {
  // This is a placeholder. In a real implementation, you would call a specific
  // endpoint for bookmarked projects, but for now we'll just return all projects
  const response = await axios.get<ProjectsResponse>(
    `${API_BASE_URL}/api/projects?tab=all`
  );

  return response.data;
};

/**
 * Fetch company's projects
 */
export const fetchCompanyProjects = async (
  walletEns: string
): Promise<ProjectsResponse> => {
  try {
    // Remove .edu suffix if present
    const cleanWalletEns = walletEns ? walletEns.replace(/\.edu$/, "") : "";
    
    const response = await axios.get<ProjectsResponse>(
      `${API_BASE_URL}/api/company/my-projects?walletEns=${cleanWalletEns}`
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching company projects:", error);
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (
  projectId: string,
  projectData: {
    projectName?: string;
    projectDescription?: string;
    prizeAmount?: string | number;
    projectStatus?: string;
    requiredSkills?: string;
    completionSkills?: string;
    projectRepo?: string;
    deadline?: string;
    walletEns: string;
    walletAddress: string;
  }
): Promise<ProjectDetailResponse> => {
  try {
    // Clean wallet ENS
    const cleanData = {
      ...projectData,
      walletEns: projectData.walletEns ? projectData.walletEns.replace(/\.edu$/, "") : "",
      // Ensure prizeAmount is a string
      prizeAmount: typeof projectData.prizeAmount === 'number' 
        ? projectData.prizeAmount.toString() 
        : projectData.prizeAmount
    };

    const response = await axios.put<ProjectDetailResponse>(
      `${API_BASE_URL}/api/projects/${projectId}`,
      cleanData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

/**
 * Delete a project by ID
 * @param projectId - The ID of the project to delete
 * @param walletData - Object containing walletEns and walletAddress
 * @returns Promise with deletion response
 */
export const deleteProject = async (
  projectId: string,
  walletData: { walletEns: string; walletAddress: string }
): Promise<{ isSuccess: boolean; message: string }> => {
  try {
    const { walletEns, walletAddress } = walletData;
    
    // Remove .edu suffix if present in walletEns
    const cleanWalletEns = walletEns.replace(/\.edu$/, "");
    
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletEns: cleanWalletEns,
        walletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete the project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Create a new project
 * @param projectData - Data for the new project
 * @returns Promise with the created project response
 */
export const createProject = async (data: {
  projectName: string;
  projectDescription: string;
  prizeAmount: string | number;  // Allow both string and number types
  requiredSkills: string;
  completionSkills?: string;
  projectRepo?: string;
  deadline: string;
  walletEns: string;
  walletAddress: string;
  blockchainProjectId?: string; // Add blockchain project ID
}): Promise<ProjectResponse> => {
  try {
    // Clean wallet ENS
    const cleanData = {
      ...data,
      walletEns: data.walletEns ? data.walletEns.replace(/\.edu$/, "") : "",
      // Ensure prizeAmount is a string
      prizeAmount: typeof data.prizeAmount === 'number' 
        ? data.prizeAmount.toString() 
        : data.prizeAmount,
      // Include blockchainProjectId if available (rename to match backend expectation)
      onChainProjectId: data.blockchainProjectId
    };

    console.log("Creating project with data:", cleanData);

    const response = await axios.post<ProjectResponse>(
      `${API_BASE_URL}/api/projects`,
      cleanData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create project");
    }
    throw error;
  }
};

/**
 * Fetch token balance for a wallet address
 * @param walletAddress - The wallet address to check balance for
 * @returns Promise with the token balance
 */
export const fetchTokenBalance = async (walletAddress: string): Promise<number> => {
  try {
    // We'll use ethers to interact with the blockchain
    const { ethers } = await import('ethers');
    
    // Get configuration from environment variables
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const tokenAddress = process.env.NEXT_PUBLIC_LLEDU_TOKEN_ADDRESS;
    
    if (!rpcUrl || !tokenAddress) {
      console.error('Missing configuration for token balance check');
      return 0;
    }

    // ERC20 token ABI (minimal for balance checking)
    const erc20Abi = [
      // balanceOf function
      {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
      },
      // decimals function
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
      }
    ];

    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Create a contract instance
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    
    // Get decimals
    const decimals = await tokenContract.decimals();
    
    // Get raw balance
    const rawBalance = await tokenContract.balanceOf(walletAddress);
    
    // Format balance with proper decimals
    const formattedBalance = parseFloat(ethers.formatUnits(rawBalance, decimals));
    
    // Round to 2 decimal places
    return Math.round(formattedBalance * 100) / 100;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
};