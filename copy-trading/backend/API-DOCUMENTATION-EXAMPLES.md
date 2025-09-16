# LearnLedger API Examples for Frontend Developers

This document provides practical examples of how to use the LearnLedger API in your frontend application. These examples use Fetch API and Axios, which are common methods for making HTTP requests in JavaScript applications.

## Table of Contents

1. [Setting Up](#setting-up)
2. [Authentication Examples](#authentication-examples)
3. [User Registration and Profile](#user-registration-and-profile)
4. [Project Management](#project-management)
5. [Submission Handling](#submission-handling)
6. [Error Handling Best Practices](#error-handling-best-practices)
7. [Advanced Usage Examples](#advanced-usage-examples)

## Setting Up

### Base URL Configuration

Start by setting up your base URL based on the environment:

```javascript
// config.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://LearnLedger.vercel.app/api'
  : 'http://localhost:3000/api';

export default API_BASE_URL;
```

### Creating API Services

A recommended pattern is to create service modules for different API areas:

```javascript
// services/api.js
import API_BASE_URL from '../config';

// Generic API request function
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse the JSON response
  const data = await response.json();
  
  // If the response is not successful, throw an error
  if (!data.isSuccess) {
    const error = new Error(data.message || 'An error occurred');
    error.errors = data.errors;
    error.statusCode = response.status;
    throw error;
  }
  
  return data;
}
```

## Authentication Examples

### Setting Up Metamask Connection

```javascript
// services/auth.js
export async function connectMetamask() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install Metamask to use this application');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]; // Return the first account (primary wallet address)
  } catch (error) {
    throw new Error('Failed to connect to Metamask: ' + error.message);
  }
}

// Get the current wallet address
export function getCurrentWalletAddress() {
  return window.ethereum?.selectedAddress?.toLowerCase() || null;
}
```

## User Registration and Profile

### Register a New User

#### Using Fetch API:

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function registerUser(role, userData) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      walletAddress,
      role,
      ...userData
    }),
  });
}

// Example usage:
// For a company
registerUser('company', {
  companyName: 'Acme Inc',
  companyWebsite: 'https://acme.com',
})
  .then(response => console.log('Successfully registered profile:', response))
  .catch(error => console.error('Registration failed:', error));

// For a freelancer
registerUser('freelancer', {
  freelancerName: 'John Doe',
  skills: ['JavaScript', 'React', 'Solidity'],
})
  .then(response => console.log('Successfully registered profile:', response))
  .catch(error => console.error('Registration failed:', error));
```

#### Using Axios:

```javascript
import axios from 'axios';
import API_BASE_URL from '../config';
import { getCurrentWalletAddress } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios response interceptor to standardize error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    const customError = new Error(
      error.response?.data?.message || 'An error occurred'
    );
    customError.errors = error.response?.data?.errors;
    customError.statusCode = error.response?.status;
    return Promise.reject(customError);
  }
);

export async function registerUser(role, userData) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return api.post('/register', {
    walletAddress,
    role,
    ...userData
  });
}
```

### Get User Profile

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function getUserProfile() {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return apiRequest(`/userProfile?walletAddress=${walletAddress}`);
}
```

### Update User Profile

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

// ⚠️ Known Issue: The PUT /userProfile endpoint has a body parsing issue
// Use this workaround function that tries multiple strategies
export async function updateUserProfile(profileData) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  // Combine wallet address with profile data
  const userData = {
    walletAddress,
    ...profileData
  };
  
  // Try multiple approaches (see full implementation in docs/api-workarounds.md)
  try {
    // Approach 1: Standard PUT request
    const response = await apiRequest('/userProfile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (response.isSuccess) {
      return response;
    }
    
    // Approach 2: PUT with query parameters for essential fields
    const { role, ...updateData } = userData;
    const queryParams = `?walletAddress=${encodeURIComponent(walletAddress)}&role=${encodeURIComponent(role || 'company')}`;
    
    const queryResponse = await apiRequest(`/userProfile${queryParams}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (queryResponse.isSuccess) {
      return queryResponse;
    }
    
    throw new Error('Failed to update profile after multiple attempts');
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

// Example usage:
updateUserProfile({
  role: 'company', // Make sure to include role
  companyName: 'Updated Company Name',
  companyWebsite: 'https://updated-site.com',
})
  .then(response => console.log('Profile updated:', response))
  .catch(error => console.error('Profile update failed:', error));
```

## Project Management

### Get Projects List

```javascript
import { apiRequest } from './api';

export async function getProjects(filters = {}) {
  // Convert filters object to query string
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/projects?${queryString}` : '/projects';
  
  return apiRequest(endpoint);
}

// Example usage:
getProjects({
  status: 'open',
  skill: 'React',
  sort: 'prize',
  order: 'desc',
  limit: 10,
})
  .then(response => console.log('Projects:', response.data))
  .catch(error => console.error('Failed to get projects:', error));
```

### Create a Project

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function createProject(projectData) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify({
      ...projectData,
      projectOwner: walletAddress,
    }),
  });
}

// Example usage:
createProject({
  projectName: 'New Web3 Project',
  projectDescription: 'A project to build a decentralized application',
  projectLink: 'https://github.com/example/repo',
  prizeAmount: 1000,
  requiredSkills: ['React', 'Solidity', 'Web3.js'],
})
  .then(response => console.log('Project created:', response))
  .catch(error => console.error('Project creation failed:', error));
```

### Get Project Details

```javascript
import { apiRequest } from './api';

export async function getProjectDetails(projectId) {
  return apiRequest(`/projects/${projectId}`);
}
```

### Update Project

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function updateProject(projectId, projectData) {
  return apiRequest(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...projectData,
      walletAddress: getCurrentWalletAddress(), // For authorization
    }),
  });
}
```

### Delete Project

```javascript
import { apiRequest } from './api';

export async function deleteProject(projectId) {
  return apiRequest(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}
```

## Submission Handling

### Create Submission

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function createSubmission(projectId, submissionData) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return apiRequest('/submissions/create', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      freelancerWallet: walletAddress,
      ...submissionData,
    }),
  });
}

// Example usage:
createSubmission('project-uuid', {
  submissionText: 'I've completed the project with the following features...',
  githubLink: 'https://github.com/myusername/project-submission',
})
  .then(response => console.log('Submission created:', response))
  .catch(error => console.error('Submission failed:', error));
```

### Get Project Submissions

```javascript
import { apiRequest } from './api';

export async function getProjectSubmissions(projectId) {
  return apiRequest(`/submissions/read?projectId=${projectId}`);
}
```

### Approve Submission

```javascript
import { apiRequest } from './api';
import { getCurrentWalletAddress } from './auth';

export async function approveSubmission(submissionId) {
  const walletAddress = getCurrentWalletAddress();
  
  if (!walletAddress) {
    throw new Error('Please connect your wallet first');
  }
  
  return apiRequest('/submissions/approve', {
    method: 'POST',
    body: JSON.stringify({
      submissionId,
      companyWallet: walletAddress,
    }),
  });
}
```

## Error Handling Best Practices

Here's a more comprehensive way to handle API errors in your frontend:

```javascript
// Example of a React component with error handling
import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/projectService';

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await getProjects();
        setProjects(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError({
          message: err.message || 'Failed to load projects',
          fieldErrors: err.errors || {},
          statusCode: err.statusCode,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Function to render specific error messages for fields
  const renderFieldErrors = (fieldName) => {
    if (error?.fieldErrors && error.fieldErrors[fieldName]) {
      return (
        <ul className="field-errors">
          {error.fieldErrors[fieldName].map((msg, idx) => (
            <li key={idx} className="text-red-500 text-sm">
              {msg}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  if (loading) return <div>Loading projects...</div>;

  if (error) {
    return (
      <div className="error-container bg-red-50 p-4 rounded-md">
        <h3 className="text-red-700">Error: {error.message}</h3>
        {error.statusCode === 401 && (
          <p>Please connect your wallet to view projects.</p>
        )}
        {error.statusCode === 500 && (
          <p>Server error. Please try again later or contact support.</p>
        )}
        {/* Render any field-specific errors */}
        {renderFieldErrors('general')}
      </div>
    );
  }

  return (
    <div className="projects-list">
      <h2>Available Projects</h2>
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              <h3>{project.projectName}</h3>
              <p>{project.projectDescription}</p>
              <span>Prize: {project.prizeAmount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectsList;
```

## Advanced Usage Examples

### Search Projects with Debouncing

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

function ProjectSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      try {
        setLoading(true);
        const response = await apiRequest(`/projects/search?q=${encodeURIComponent(query)}`);
        setResults(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Update search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Clean up the debounced function
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="project-search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects..."
        className="search-input"
      />
      
      {loading && <div>Searching...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && results.length > 0 && (
        <ul className="search-results">
          {results.map(project => (
            <li key={project.id}>
              <h3>{project.projectName}</h3>
              <p>{project.projectDescription}</p>
            </li>
          ))}
        </ul>
      )}
      
      {!loading && !error && searchQuery && results.length === 0 && (
        <div>No projects found matching "{searchQuery}"</div>
      )}
    </div>
  );
}

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  
  const debounced = function(...args) {
    const context = this;
    clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
  
  debounced.cancel = function() {
    clearTimeout(timeout);
  };
  
  return debounced;
}

export default ProjectSearch;
```

### Implementing Optimistic UI Updates

```javascript
import React, { useState } from 'react';
import { approveSubmission } from '../services/submissionService';

function SubmissionItem({ submission, onStatusChange }) {
  const [isApproving, setIsApproving] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(submission.status);
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    
    // Optimistic update
    setOptimisticStatus('approved');
    
    try {
      // Make API call
      await approveSubmission(submission.id);
      
      // Update parent component
      onStatusChange(submission.id, 'approved');
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticStatus(submission.status);
      setError(err.message || 'Failed to approve submission');
    } finally {
      setIsApproving(false);
    }
  };

  // Display based on optimistic status
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="submission-item p-4 border rounded mb-4">
      <div className="flex justify-between">
        <h3>{submission.freelancerName}</h3>
        <span className={`px-2 py-1 rounded ${statusClasses[optimisticStatus]}`}>
          {optimisticStatus}
        </span>
      </div>
      
      <p>{submission.submissionText}</p>
      
      {error && (
        <div className="error mt-2 text-red-600">{error}</div>
      )}
      
      {optimisticStatus === 'pending' && (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isApproving ? 'Approving...' : 'Approve Submission'}
        </button>
      )}
    </div>
  );
}
```

### Wallet Address Validation Helper

```javascript
// utils/validation.js

// Validate Ethereum wallet address
export function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Truncate wallet address for display
export function truncateAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
```

These examples should help your frontend developer understand how to interact with your API effectively using modern JavaScript patterns and best practices. 