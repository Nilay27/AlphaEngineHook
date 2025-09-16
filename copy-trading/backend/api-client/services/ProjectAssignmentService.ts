/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectAssignmentService {
    /**
     * Assign freelancer to project
     * Assigns a freelancer to a project
     * @param projectId ID of the project
     * @param requestBody Freelancer assignment information
     * @returns any Freelancer assigned successfully
     * @throws ApiError
     */
    public static assignFreelancer(
        projectId: string,
        requestBody: {
            freelancerWallet: WalletAddress;
            companyWallet: WalletAddress;
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Project;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects/{projectId}/assign',
            path: {
                'projectId': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid input data`,
                403: `Forbidden - Insufficient permissions`,
                404: `Not Found - Resource not found`,
                409: `Conflict - Project already has an assigned freelancer`,
                500: `Internal Server Error`,
            },
        });
    }
}
