/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentationService {
    /**
     * Get API specification
     * Returns the complete OpenAPI specification for the API
     * @returns any OpenAPI specification
     * @throws ApiError
     */
    public static getApiSpec(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api-spec',
        });
    }
    /**
     * Interactive API documentation
     * Renders the Swagger UI for interactive API documentation
     * @returns string HTML page with Swagger UI
     * @throws ApiError
     */
    public static getApiDocs(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/docs',
        });
    }
}
