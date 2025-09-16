/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GitHubRepoVerification } from '../models/GitHubRepoVerification';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GitHubService {
    /**
     * Verify GitHub repository
     * Verifies if a GitHub repository exists and is accessible
     * @param repo GitHub repository URL
     * @returns any GitHub repository verification result
     * @throws ApiError
     */
    public static verifyGitHubRepo(
        repo: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: GitHubRepoVerification;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/github/verify',
            query: {
                'repo': repo,
            },
            errors: {
                400: `Bad Request - Invalid input data`,
                404: `Repository not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
