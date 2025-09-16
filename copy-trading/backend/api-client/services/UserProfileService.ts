/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { Freelancer } from '../models/Freelancer';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserProfileService {
    /**
     * Get user profile
     * Retrieves user profile information (for either company or freelancer)
     * @param walletAddress Ethereum wallet address
     * @returns any User profile retrieved successfully
     * @throws ApiError
     */
    public static getUserProfile(
        walletAddress: WalletAddress,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: (Company | Freelancer);
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/userProfile',
            query: {
                'walletAddress': walletAddress,
            },
            errors: {
                400: `Bad Request - Invalid input data`,
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update user profile
     * Updates user profile information
     * @param requestBody User profile update information
     * @returns any Profile updated successfully
     * @throws ApiError
     */
    public static updateUserProfile(
        requestBody: {
            walletAddress: WalletAddress;
            role?: 'company' | 'freelancer';
            companyName?: string;
            companyWebsite?: string;
            name?: string;
            skills?: Array<string>;
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: (Company | Freelancer);
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/userProfile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid input data`,
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
