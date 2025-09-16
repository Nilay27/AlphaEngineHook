/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserProfile } from '../models/UserProfile';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RegisterService {
    /**
     * Register a new user
     * Creates a new user profile (either company or freelancer)
     * @param requestBody User registration information
     * @returns any Registration successful
     * @throws ApiError
     */
    public static registerUser(
        requestBody: ({
            walletAddress: WalletAddress;
            role: 'company';
            companyName: string;
            companyWebsite?: string;
        } | {
            walletAddress: WalletAddress;
            role: 'freelancer';
            name: string;
            skills: Array<string>;
        }),
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: UserProfile;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid input data`,
                409: `Conflict - User already registered`,
                500: `Internal Server Error`,
            },
        });
    }
}
