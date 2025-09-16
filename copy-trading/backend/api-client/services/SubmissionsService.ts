
// file: /api-client/services/SubmissionsService.ts

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Submission } from '../models/Submission';
import type { SubmissionList } from '../models/SubmissionList';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubmissionsService {

    /**
     * Get project submissions
     * Retrieves submissions for a specific project
     * @param projectId ID of the project
     * @returns any Project submissions
     * @throws ApiError
     */
    public static getProjectSubmissions(
        projectId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: SubmissionList;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/{projectId}/submissions',
            path: {
                'projectId': projectId,
            },
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Create submission
     * Creates a new project submission
     * Body in Postman expects:
     * {
     *   "projectId": string,
     *   "freelancerWallet": string,
     *   "submissionText": string,
     *   "githubLink"?: string
     * }
     * 
     * @param requestBody Submission creation information
     * @returns any Submission created successfully
     * @throws ApiError
     */
    public static createSubmission(
        requestBody: {
            projectId: string;
            freelancerWallet: WalletAddress;
            submissionText: string;
            githubLink?: string;
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Submission;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/submissions/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Get submissions
     * Retrieves submissions for a specific project
     * or uses query param "submissionId" / "freelancerAddress".
     * @param projectId ID of the project
     * @returns any Submissions retrieved successfully
     * @throws ApiError
     */
    public static getSubmissions(
        projectId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: SubmissionList;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/submissions/read',
            query: {
                'projectId': projectId,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Approve submission
     * Approves a project submission
     * POST body:
     * {
     *   submissionId: string;
     *   companyWallet: WalletAddress;
     * }
     * 
     * @param requestBody Submission approval information
     * @returns any Submission approved successfully
     * @throws ApiError
     */
    public static approveSubmission(
        requestBody: {
            submissionId: string;
            companyWallet: WalletAddress;
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Submission;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/submissions/approve',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Delete submission
     * Deletes a project submission
     * 
     * @param submissionId ID of the submission
     * @param walletAddress Ethereum wallet address
     * @returns any Submission deleted successfully
     * @throws ApiError
     */
    public static deleteSubmission(
        submissionId: string,
        walletAddress: WalletAddress,
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/submissions/delete',
            query: {
                'submissionId': submissionId,
                'walletAddress': walletAddress,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

}
