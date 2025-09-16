# API Workarounds

This document describes known issues with the API and workarounds until the API issues are fixed in a future update.

## PUT /userProfile Endpoint Workaround

The `PUT /userProfile` endpoint currently has an issue where it's not properly parsing the request body, causing it to return a `400` error with the message "Missing required fields: role, walletAddress" even when these fields are included in the request.

### The Issue

The API has a middleware configuration problem where:
1. The body parser middleware is not correctly applied to the PUT endpoint handler.
2. The validation in the PUT handler expects parsed body data but doesn't receive it.

### Workaround Solution

Until this issue is fixed on the API server, you can use the following client-side workaround:

```javascript
/**
 * Wrapper function to update user profiles using multiple fallback strategies
 * @param {Object} userData - User profile data to update
 * @param {string} userData.walletAddress - Ethereum wallet address
 * @param {string} userData.role - "company" or "freelancer"
 * @param {Object} userData - Additional fields to update
 * @returns {Promise<Object>} - API response
 */
async function updateUserProfile(userData) {
  if (!userData.walletAddress || !userData.role) {
    throw new Error("walletAddress and role are required fields");
  }
  
  // Try multiple approaches to work around the API issue
  
  // Approach 1: Standard PUT request
  try {
    const response = await fetch('https://learn-ledger-api.vercel.app/api/userProfile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    if (result.isSuccess) {
      return result;
    }
    // If this approach fails, fall through to the next one
    console.log("Standard PUT approach failed, trying alternative...");
  } catch (error) {
    console.error("Error with standard PUT:", error);
    // Continue to next approach
  }
  
  // Approach 2: PUT with query parameters for essential fields
  try {
    // Extract essential fields from userData
    const { walletAddress, role, ...updateData } = userData;
    
    // Build query string with required fields
    const queryParams = new URLSearchParams({
      walletAddress: walletAddress,
      role: role
    }).toString();
    
    // Send PUT request with query params for identification and body for updates
    const response = await fetch(`https://learn-ledger-api.vercel.app/api/userProfile?${queryParams}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: walletAddress, // Include in body too just in case
        role: role,                   // Include in body too just in case
        ...updateData
      })
    });
    
    const result = await response.json();
    if (result.isSuccess) {
      return result;
    }
    // If this approach fails, fall through to the next one
    console.log("PUT with query params approach failed, trying alternative...");
  } catch (error) {
    console.error("Error with PUT + query params:", error);
    // Continue to next approach
  }
  
  // Approach 3: POST to a custom endpoint (some APIs use POST for updates too)
  try {
    const response = await fetch('https://learn-ledger-api.vercel.app/api/userProfile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    if (result.isSuccess) {
      return result;
    }
    console.log("POST to custom endpoint failed");
  } catch (error) {
    console.error("Error with POST to custom endpoint:", error);
  }
  
  // If all approaches fail, throw a descriptive error
  throw new Error("Failed to update user profile after trying multiple approaches. API might be unavailable or the profile doesn't exist.");
}

// Usage example:
// 
// For a company profile:
// updateUserProfile({
//   walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//   role: "company",
//   companyName: "Updated Company Name",
//   shortDescription: "This is my updated company description"
// })
//   .then(response => console.log("Update successful:", response))
//   .catch(error => console.error("Update failed:", error));
//
// For a freelancer profile:
// updateUserProfile({
//   walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//   role: "freelancer",
//   freelancerName: "Updated Freelancer Name",
//   skills: ["JavaScript", "React", "Smart Contracts"]
// })
//   .then(response => console.log("Update successful:", response))
//   .catch(error => console.error("Update failed:", error));
```

### Known Limitations

- This workaround attempts multiple approaches in sequence, which may cause slight delays.
- If the first approach succeeds in the future (after the API is fixed), the function will still work correctly.
- If the API structure changes significantly, this workaround might need updates.

### Future Improvements

The API team is aware of this issue and plans to fix it in a future update by:

1. Adding proper body parsing middleware to the PUT endpoint
2. Ensuring consistent handling of request bodies across all API endpoints
3. Providing better error messages for debugging

Once the API is fixed, you can continue using this wrapper function (it will default to the first approach) or switch to direct API calls. 