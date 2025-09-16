// api-service.js
import axios from 'axios';
import { FreelancerData, CompanyData } from '../types/datatype';

const API_BASE_URL = process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || 'https://learn-ledger-api.vercel.app/api';

// Type definitions
interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

type UserData = FreelancerData | CompanyData;

export const registerUser = async (userData: UserData): Promise<ApiResponse> => {
  // Add walletEns to the request
  const dataWithEns = {
    ...userData,
  };

  try {
    const response = await axios.post<ApiResponse>(`${API_BASE_URL}/api/register`, dataWithEns, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Registration error:", error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error("Network error:", error.request);
        throw { isSuccess: false, message: "Network error. Please try again." };
      }
    }

    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error:", message);
    throw { isSuccess: false, message };
  }
};