/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletAddress } from './WalletAddress';
export type UserProfile = {
    id: string;
    walletAddress: WalletAddress;
    role: UserProfile.role;
};
export namespace UserProfile {
    export enum role {
        COMPANY = 'company',
        FREELANCER = 'freelancer',
    }
}

