/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanyService {
    /**
     * Get company details
     * Retrieves detailed information about a specific company
     * @param companyId ID of the company
     * @returns any Company details retrieved successfully
     * @throws ApiError
     */
    public static getCompanyDetails(
        companyId: string,
    ): CancelablePromise<{
        isSuccess?: boolean;
        data?: Company;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/company/{companyId}',
            path: {
                'companyId': companyId,
            },
            errors: {
                404: `Not Found - Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
