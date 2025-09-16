/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletAddress } from './WalletAddress';
export type Submission = {
    id: string;
    projectId: string;
    freelancerWallet: WalletAddress;
    submissionText?: string;
    githubLink?: string;
    status: Submission.status;
    createdAt: string;
    freelancerName?: string;
};
export namespace Submission {
    export enum status {
        PENDING = 'pending',
        AWARDED = 'awarded',
        REJECTED = 'rejected',
    }
}

