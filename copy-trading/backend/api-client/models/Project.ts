/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletAddress } from './WalletAddress';
export type Project = {
    id: string;
    projectName: string;
    projectDescription?: string;
    prizeAmount?: number;
    projectStatus: Project.projectStatus;
    projectOwner: WalletAddress;
    requiredSkills?: string;
    completionSkills?: string;
    assignedFreelancer?: WalletAddress | null;
    projectRepo?: string;
    createdAt: string;
    updatedAt: string;
};
export namespace Project {
    export enum projectStatus {
        OPEN = 'open',
        IN_PROGRESS = 'in-progress',
        CLOSED = 'closed',
    }
}

