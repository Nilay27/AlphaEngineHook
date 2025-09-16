// tests/api/setup.ts
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

// Base URL for API tests (not used in mock mode)
export const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';

// Flag to control whether to use mock responses
const USE_MOCKS = true;

// Simple in-memory data store for mocks
const mockDb = {
  companies: new Map(),
  freelancers: new Map(),
  projects: new Map(),
  submissions: new Map(),
};

// Sample test wallet addresses
export const TEST_WALLETS = {
  company: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  freelancer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  user: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
};

// Helper function for mock responses
function mockResponse(endpoint: string, method: string, body?: any) {
  // Mock the registration API
  if (endpoint === '/register' && method === 'POST') {
    if (!body.walletAddress || !body.role) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing walletAddress or role' }
      };
    }

    const id = `mock-${Math.random().toString(36).substring(2, 10)}`;
    
    if (body.role === 'company') {
      mockDb.companies.set(body.walletAddress.toLowerCase(), {
        id,
        walletAddress: body.walletAddress.toLowerCase(),
        companyName: body.companyName || 'Mock Company',
        shortDescription: body.shortDescription,
        logoUrl: body.logoUrl,
        createdAt: new Date().toISOString(),
      });
    } else if (body.role === 'freelancer') {
      mockDb.freelancers.set(body.walletAddress.toLowerCase(), {
        id,
        walletAddress: body.walletAddress.toLowerCase(),
        freelancerName: body.freelancerName || 'Mock Freelancer',
        skills: body.skills || '',
        profilePicUrl: body.profilePicUrl,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      status: 200,
      data: { isSuccess: true, data: id }
    };
  }

  // Mock the projects API - GET with filtering
  if (endpoint.startsWith('/projects') && method === 'GET') {
    // Parse query parameters if they exist
    const urlParts = endpoint.split('?');
    const params = urlParts.length > 1 ? new URLSearchParams(urlParts[1]) : new URLSearchParams();
    
    const status = params.get('status');
    const skill = params.get('skill');
    const minPrize = params.get('minPrize');
    const maxPrize = params.get('maxPrize');
    
    if (urlParts[0] === '/projects') {
      // List all projects with filtering
      let projects = Array.from(mockDb.projects.values());
      
      // Apply filters if provided
      if (status) {
        projects = projects.filter(p => p.projectStatus === status);
      }
      if (skill) {
        projects = projects.filter(p => p.requiredSkills && p.requiredSkills.includes(skill));
      }
      if (minPrize) {
        projects = projects.filter(p => Number(p.prizeAmount) >= Number(minPrize));
      }
      if (maxPrize) {
        projects = projects.filter(p => Number(p.prizeAmount) <= Number(maxPrize));
      }
      
      return {
        status: 200,
        data: { isSuccess: true, data: projects }
      };
    } else if (urlParts[0].match(/^\/projects\/[^\/]+$/)) {
      // Get single project
      const projectId = urlParts[0].split('/').pop();
      const project = mockDb.projects.get(projectId);
      
      if (!project) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'Project not found' }
        };
      }
      
      return {
        status: 200,
        data: { isSuccess: true, data: project }
      };
    }
  }

  // Mock the projects API - PUT (update project)
  if (endpoint.match(/^\/projects\/[^\/]+$/) && method === 'PUT') {
    const projectId = endpoint.split('/').pop();
    const project = mockDb.projects.get(projectId);
    
    if (!project) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Project not found' }
      };
    }
    
    if (!body.walletAddress || !body.projectName) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing required fields' }
      };
    }
    
    if (project.projectOwner.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return {
        status: 403,
        data: { isSuccess: false, message: 'Only the owner can update this project' }
      };
    }
    
    // Update project
    const updatedProject = {
      ...project,
      projectName: body.projectName,
      projectDescription: body.projectDescription !== undefined ? body.projectDescription : project.projectDescription,
      prizeAmount: body.prizeAmount !== undefined ? body.prizeAmount : project.prizeAmount,
      requiredSkills: body.requiredSkills !== undefined ? body.requiredSkills : project.requiredSkills,
      completionSkills: body.completionSkills !== undefined ? body.completionSkills : project.completionSkills,
      projectRepo: body.projectRepo !== undefined ? body.projectRepo : project.projectRepo,
      updatedAt: new Date().toISOString(),
    };
    
    mockDb.projects.set(projectId, updatedProject);
    
    return {
      status: 200,
      data: { isSuccess: true, data: updatedProject }
    };
  }
  
  // Mock projects API - DELETE
  if (endpoint.match(/^\/projects\/[^\/]+$/) && method === 'DELETE') {
    const projectId = endpoint.split('/').pop();
    const project = mockDb.projects.get(projectId);
    
    if (!project) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Project not found' }
      };
    }
    
    if (!body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Wallet address is required' }
      };
    }
    
    if (project.projectOwner.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return {
        status: 403,
        data: { isSuccess: false, message: 'Only the owner can delete this project' }
      };
    }
    
    if (project.assignedFreelancer) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Cannot delete a project that has been assigned' }
      };
    }
    
    mockDb.projects.delete(projectId);
    
    return {
      status: 200,
      data: { isSuccess: true, message: 'Project deleted successfully' }
    };
  }
  
  // Mock project status update
  if (endpoint.match(/^\/projects\/[^\/]+\/status$/) && method === 'PUT') {
    const projectId = endpoint.split('/').slice(-2)[0];
    const project = mockDb.projects.get(projectId);
    
    if (!project) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Project not found' }
      };
    }
    
    if (!body.status || !body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing status or walletAddress' }
      };
    }
    
    if (!['open', 'closed'].includes(body.status)) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Invalid status value. Valid values are: open, closed' }
      };
    }
    
    if (project.projectOwner.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return {
        status: 403,
        data: { isSuccess: false, message: 'Unauthorized: Only the project owner can change the status' }
      };
    }
    
    const updatedProject = {
      ...project,
      projectStatus: body.status,
      updatedAt: new Date().toISOString(),
    };
    
    mockDb.projects.set(projectId, updatedProject);
    
    return {
      status: 200,
      data: { 
        message: `Project status changed to ${body.status} successfully`,
        data: updatedProject
      }
    };
  }

  // Mock the projects API - POST
  if (endpoint === '/projects' && method === 'POST') {
    if (!body.walletAddress || !body.projectName) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing required fields' }
      };
    }

    const projectId = `proj-${Math.random().toString(36).substring(2, 10)}`;
    const project = {
      id: projectId,
      projectName: body.projectName,
      projectDescription: body.projectDescription || '',
      prizeAmount: body.prizeAmount || 0,
      projectStatus: 'open',
      projectOwner: body.walletAddress.toLowerCase(),
      requiredSkills: body.requiredSkills || '',
      completionSkills: body.completionSkills || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockDb.projects.set(projectId, project);
    
    return {
      status: 200,
      data: { isSuccess: true, data: project }
    };
  }

  // Mock user profile API - GET
  if (endpoint.startsWith('/userProfile') && method === 'GET') {
    const params = new URLSearchParams(endpoint.split('?')[1]);
    const wallet = params.get('wallet')?.toLowerCase();
    const role = params.get('role');
    
    if (!wallet || !role) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing wallet or role param' }
      };
    }
    
    if (role === 'company') {
      const company = mockDb.companies.get(wallet);
      if (!company) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'Company not found' }
        };
      }
      return {
        status: 200,
        data: { isSuccess: true, data: company }
      };
    } else {
      const freelancer = mockDb.freelancers.get(wallet);
      if (!freelancer) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'Freelancer not found' }
        };
      }
      return {
        status: 200,
        data: { isSuccess: true, data: freelancer }
      };
    }
  }

  // Mock user profile API - PUT
  if (endpoint === '/userProfile' && method === 'PUT') {
    if (!body.role || !body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing role or walletAddress' }
      };
    }
    
    const wallet = body.walletAddress.toLowerCase();
    
    if (body.role === 'company') {
      let company = mockDb.companies.get(wallet);
      if (!company) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'No matching company profile found' }
        };
      }
      
      // Update company
      company = {
        ...company,
        companyName: body.companyName || company.companyName,
        shortDescription: body.shortDescription || company.shortDescription,
        logoUrl: body.logoUrl || company.logoUrl,
      };
      
      mockDb.companies.set(wallet, company);
      
      return {
        status: 200,
        data: { isSuccess: true, data: company }
      };
    } else {
      let freelancer = mockDb.freelancers.get(wallet);
      if (!freelancer) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'No matching freelancer profile found' }
        };
      }
      
      // Update freelancer
      freelancer = {
        ...freelancer,
        freelancerName: body.freelancerName || freelancer.freelancerName,
        skills: body.skills || freelancer.skills,
        profilePicUrl: body.profilePicUrl || freelancer.profilePicUrl,
      };
      
      mockDb.freelancers.set(wallet, freelancer);
      
      return {
        status: 200,
        data: { isSuccess: true, data: freelancer }
      };
    }
  }

  // Mock user profile API - DELETE
  if (endpoint === '/userProfile' && method === 'DELETE') {
    if (!body.role || !body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing role or walletAddress' }
      };
    }
    
    const wallet = body.walletAddress.toLowerCase();
    
    if (body.role === 'company') {
      if (!mockDb.companies.has(wallet)) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'No matching company found' }
        };
      }
      
      mockDb.companies.delete(wallet);
      
      return {
        status: 200,
        data: { isSuccess: true, message: 'Company profile deleted' }
      };
    } else {
      if (!mockDb.freelancers.has(wallet)) {
        return {
          status: 404,
          data: { isSuccess: false, message: 'No matching freelancer found' }
        };
      }
      
      mockDb.freelancers.delete(wallet);
      
      return {
        status: 200,
        data: { isSuccess: true, message: 'Freelancer profile deleted' }
      };
    }
  }

  // Mock submissions/create API
  if (endpoint === '/submissions/create' && method === 'POST') {
    if (!body.projectId || !body.freelancerAddress || !body.prLink) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing required fields' }
      };
    }
    
    const submissionId = `sub-${Math.random().toString(36).substring(2, 10)}`;
    const submission = {
      id: submissionId,
      projectId: body.projectId,
      freelancerAddress: body.freelancerAddress.toLowerCase(),
      prLink: body.prLink,
      isMerged: false,
      createdAt: new Date().toISOString(),
    };
    
    mockDb.submissions.set(submissionId, submission);
    
    return {
      status: 200,
      data: { isSuccess: true, data: submission }
    };
  }

  // Mock submissions/delete API
  if (endpoint === '/submissions/delete' && method === 'POST') {
    if (!body.submissionId || !body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing submissionId or walletAddress' }
      };
    }
    
    const submission = mockDb.submissions.get(body.submissionId);
    if (!submission) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Submission not found' }
      };
    }
    
    const project = mockDb.projects.get(submission.projectId);
    if (!project) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Project not found' }
      };
    }
    
    const isOwner = project.projectOwner.toLowerCase() === body.walletAddress.toLowerCase();
    const isSubmitter = submission.freelancerAddress.toLowerCase() === body.walletAddress.toLowerCase();
    
    if (!isOwner && !isSubmitter) {
      return {
        status: 403,
        data: { isSuccess: false, message: 'Not authorized to delete this submission' }
      };
    }
    
    mockDb.submissions.delete(body.submissionId);
    
    return {
      status: 200,
      data: { isSuccess: true, message: 'Submission deleted successfully' }
    };
  }

  // Mock submissions/approve API
  if (endpoint === '/submissions/approve' && method === 'POST') {
    if (!body.submissionId || !body.walletAddress) {
      return {
        status: 400,
        data: { isSuccess: false, message: 'Missing submissionId or walletAddress' }
      };
    }
    
    const submission = mockDb.submissions.get(body.submissionId);
    if (!submission) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Submission not found' }
      };
    }
    
    const project = mockDb.projects.get(submission.projectId);
    if (!project) {
      return {
        status: 404,
        data: { isSuccess: false, message: 'Project not found' }
      };
    }
    
    if (project.projectOwner.toLowerCase() !== body.walletAddress.toLowerCase()) {
      return {
        status: 403,
        data: { isSuccess: false, message: 'Only the project owner can approve' }
      };
    }
    
    // Update project and submission
    project.projectStatus = 'closed';
    project.assignedFreelancer = submission.freelancerAddress;
    mockDb.projects.set(project.id, project);
    
    submission.isMerged = true;
    mockDb.submissions.set(submission.id, submission);
    
    return {
      status: 200,
      data: { isSuccess: true, message: 'Submission approved successfully' }
    };
  }

  // Default response for unhandled endpoints
  return {
    status: 404,
    data: { isSuccess: false, message: `Mock not implemented for ${method} ${endpoint}` }
  };
}

// Helper function to make API requests
export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
) {
  // Use mock responses if enabled
  if (USE_MOCKS) {
    return mockResponse(endpoint, method, body);
  }

  // Otherwise, make real HTTP requests
  const url = `${BASE_URL}${endpoint}`;
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

// Helper function to cleanup test data
export async function cleanupTest(entityIds: string[]) {
  if (USE_MOCKS) {
    // In mock mode, we can just clear the in-memory data
    entityIds.forEach(id => {
      mockDb.companies.delete(id);
      mockDb.freelancers.delete(id);
      mockDb.projects.delete(id);
      mockDb.submissions.delete(id);
    });
    console.log(`Cleanup requested for IDs: ${entityIds.join(', ')}`);
    return;
  }

  // In real mode, we would implement actual cleanup logic
  console.log(`Cleanup requested for IDs: ${entityIds.join(', ')}`);
} 