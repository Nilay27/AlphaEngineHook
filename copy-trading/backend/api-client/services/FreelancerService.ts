/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Freelancer } from '../models/Freelancer';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FreelancerService {
    /**
     * Get freelancer details
     * Retrieves detailed information about a specific freelancer
     * @param freelancerId ID of the freelancer
     * @returns any Freelancer details retrieved successfully
     * @throws ApiError
     */
    public static getFreelancerDetails(
        freelancerId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: Freelancer;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/freelancer/{freelancerId}',
            path: {
                'freelancerId': freelancerId,
            },
            errors: {
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
