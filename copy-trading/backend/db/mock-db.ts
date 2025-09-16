// db/mock-db.ts

// Sample data for when the database is not available
const MOCK_PROJECTS = [
  {
    id: '1',
    projectName: 'DeFi Dashboard',
    projectDescription: 'A dashboard for monitoring DeFi investments across multiple chains',
    prizeAmount: '500',
    projectStatus: 'open',
    projectOwner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    requiredSkills: 'React, Web3, TypeScript',
    assignedFreelancer: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    projectName: 'NFT Marketplace',
    projectDescription: 'A marketplace for buying and selling NFTs with low gas fees',
    prizeAmount: '800',
    projectStatus: 'open',
    projectOwner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    requiredSkills: 'Solidity, React, Next.js',
    assignedFreelancer: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    projectName: 'Smart Contract Audit',
    projectDescription: 'Perform a security audit on our token contract',
    prizeAmount: '1200',
    projectStatus: 'closed',
    projectOwner: '0x842d35Cc6634C0532925a3b844Bc454e4438f55f',
    requiredSkills: 'Solidity, Security, Audit',
    assignedFreelancer: '0x123d35Cc6634C0532925a3b844Bc454e4438abcd',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_SKILLS = [
  { id: '1', skillName: 'React', skillDescription: 'Frontend JavaScript library' },
  { id: '2', skillName: 'Solidity', skillDescription: 'Smart contract programming language' },
  { id: '3', skillName: 'Web3', skillDescription: 'Blockchain interaction library' },
  { id: '4', skillName: 'TypeScript', skillDescription: 'Typed JavaScript' },
  { id: '5', skillName: 'Next.js', skillDescription: 'React framework' },
];

const MOCK_FREELANCERS = [
  {
    id: '1',
    walletAddress: '0x123d35Cc6634C0532925a3b844Bc454e4438abcd',
    freelancerName: 'Alice',
    skills: 'React, TypeScript, Web3',
    profilePicUrl: '',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    walletAddress: '0x456d35Cc6634C0532925a3b844Bc454e4438efgh',
    freelancerName: 'Bob',
    skills: 'Solidity, Security, Audit',
    profilePicUrl: '',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock database service
export const mockDB = {
  projects: {
    findMany: (options: any = {}) => {
      console.log('Using mock database for projects.findMany');
      let results = [...MOCK_PROJECTS];
      
      // Handle filtering
      if (options.where) {
        if (options.where.projectStatus) {
          results = results.filter(p => p.projectStatus === options.where.projectStatus);
        }
        if (options.where.projectOwner) {
          results = results.filter(p => p.projectOwner === options.where.projectOwner);
        }
      }
      
      // Handle ordering
      if (options.orderBy) {
        // Just return in default order for mock data
      }
      
      // Handle pagination
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
      
      return Promise.resolve(results);
    },
    findFirst: (options: any = {}) => {
      console.log('Using mock database for projects.findFirst');
      if (options.where?.id) {
        const project = MOCK_PROJECTS.find(p => p.id === options.where.id);
        return Promise.resolve(project || null);
      }
      return Promise.resolve(null);
    },
    create: (data: any) => {
      console.log('Using mock database for projects.create');
      const newProject = {
        id: String(MOCK_PROJECTS.length + 1),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newProject);
    },
  },
  skills: {
    findMany: () => {
      console.log('Using mock database for skills.findMany');
      return Promise.resolve(MOCK_SKILLS);
    },
    findFirst: (options: any = {}) => {
      console.log('Using mock database for skills.findFirst');
      if (options.where?.skillName) {
        const skill = MOCK_SKILLS.find(s => 
          s.skillName.toLowerCase() === options.where.skillName.toLowerCase()
        );
        return Promise.resolve(skill || null);
      }
      return Promise.resolve(null);
    },
  },
  freelancers: {
    findMany: () => {
      console.log('Using mock database for freelancers.findMany');
      return Promise.resolve(MOCK_FREELANCERS);
    },
    findFirst: (options: any = {}) => {
      console.log('Using mock database for freelancers.findFirst');
      if (options.where?.walletAddress) {
        const freelancer = MOCK_FREELANCERS.find(f => 
          f.walletAddress.toLowerCase() === options.where.walletAddress.toLowerCase()
        );
        return Promise.resolve(freelancer || null);
      }
      return Promise.resolve(null);
    },
  },
};

// Utility function to detect if we should use mock DB
export function shouldUseMockDB() {
  // Check if DATABASE_URL is missing or if we explicitly want to use mock data
  return !process.env.DATABASE_URL || process.env.USE_MOCK_DB === 'true';
} 