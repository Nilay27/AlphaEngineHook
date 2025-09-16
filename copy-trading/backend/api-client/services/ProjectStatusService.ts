/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectStatusService {
    /**
     * Update project status
     * Updates the status of a project
     * @param projectId ID of the project
     * @param requestBody Project status update information
     * @returns any Project status updated successfully
     * @throws ApiError
     */
    public static updateProjectStatus(
        projectId: string,
        requestBody: {
            status: 'open' | 'in-progress' | 'closed';
            walletAddress: WalletAddress;
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Project;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/projects/{projectId}/status',
            path: {
                'projectId': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid input data`,
                403: `Forbidden - Insufficient permissions`,
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
