/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { ProjectList } from '../models/ProjectList';
import type { ProjectStats } from '../models/ProjectStats';
import type { WalletAddress } from '../models/WalletAddress';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectsService {
    /**
     * List projects
     * Returns a list of projects, with optional filtering
     * @param status Filter by project status
     * @param skill Filter by required skill
     * @param minPrize Minimum prize amount
     * @param maxPrize Maximum prize amount
     * @param owner Filter by project owner wallet address
     * @param sort Sort field
     * @param order Sort order
     * @param limit Limit number of results (default 20, max 100)
     * @param offset Pagination offset
     * @returns any Projects retrieved successfully
     * @throws ApiError
     */
    public static listProjects(
        status?: 'open' | 'in-progress' | 'closed',
        skill?: string,
        minPrize?: number,
        maxPrize?: number,
        owner?: WalletAddress,
        sort?: 'created' | 'prize' | 'name',
        order?: 'asc' | 'desc',
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: ProjectList;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects',
            query: {
                'status': status,
                'skill': skill,
                'minPrize': minPrize,
                'maxPrize': maxPrize,
                'owner': owner,
                'sort': sort,
                'order': order,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                400: `Bad Request - Invalid input data`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create project
     * Creates a new project
     * @param requestBody Project creation information
     * @returns any Project created successfully
     * @throws ApiError
     */
    public static createProject(
        requestBody: {
            projectName: string;
            projectDescription?: string;
            projectLink?: string;
            prizeAmount?: number;
            projectOwner: WalletAddress;
            requiredSkills?: (Array<string> | string);
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Project;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid input data`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get project details
     * Retrieves detailed information about a specific project
     * @param projectId ID of the project
     * @returns any Project details retrieved successfully
     * @throws ApiError
     */
    public static getProjectDetails(
        projectId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: (Project & {
            companyId?: string;
            companyName?: string;
        });
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/{projectId}',
            path: {
                'projectId': projectId,
            },
            errors: {
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update project
     * Updates a specific project
     * @param projectId ID of the project
     * @param requestBody Project update information
     * @returns any Project updated successfully
     * @throws ApiError
     */
    public static updateProject(
        projectId: string,
        requestBody: {
            projectName?: string;
            projectDescription?: string;
            projectLink?: string;
            prizeAmount?: number;
            requiredSkills?: (Array<string> | string);
        },
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
        data?: Project;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/projects/{projectId}',
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
    /**
     * Delete project
     * Deletes a specific project
     * @param projectId ID of the project
     * @returns any Project deleted successfully
     * @throws ApiError
     */
    public static deleteProject(
        projectId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/projects/{projectId}',
            path: {
                'projectId': projectId,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Search projects
     * Searches for projects using a text query
     * @param q Search query
     * @param limit Maximum number of results (default: 20, max: 100)
     * @param offset Pagination offset
     * @returns any Search results
     * @throws ApiError
     */
    public static searchProjects(
        q: string,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: ProjectList;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/search',
            query: {
                'q': q,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                400: `Bad Request - Invalid input data`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get project statistics
     * Retrieves statistics about projects
     * @param walletAddress Optional wallet address to filter statistics for a specific user
     * @returns any Project statistics
     * @throws ApiError
     */
    public static getProjectStats(
        walletAddress?: WalletAddress,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: ProjectStats;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/stats',
            query: {
                'walletAddress': walletAddress,
            },
            errors: {
                400: `Bad Request - Invalid input data`,
                500: `Internal Server Error`,
            },
        });
    }
}
