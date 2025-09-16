export interface DashboardStats {
    totalSubmissions: number;
    approved: number;
    rejected: number;
    totalEarnings: number;
    earningsGrowth: number;
  }
  
 export interface Project {
    id: string;
    projectName: string;
    projectDescription: string;
    prizeAmount: number;
    projectStatus: "open" | "in-progress" | "completed" | "cancelled";  // Using a union type for status
    projectOwner: string;
    requiredSkills: string;
    completionSkills: string;
    assignedFreelancer: string | null;
    projectRepo: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface FreelancerData {
    walletAddress: string;
    role: 'freelancer'; // Literal type, not regular string
    freelancerName: string;
    skills: string | string[]; // Allow skills as either string or string array
    profilePicUrl?: string;
    walletEns?: string
  }

  export interface CompanyData {
    walletAddress: string;
    role: 'company'; // Literal type, not regular string
    companyName: string;
    companyWebsite: string;
    walletEns?: string
  }
  