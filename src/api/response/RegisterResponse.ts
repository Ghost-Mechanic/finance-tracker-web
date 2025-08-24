import type { ESystemStatus } from '../util/ESystemStatus';

export interface RegisterResponse {
    status: ESystemStatus;
    validationErrors?: Record<string, string>;
};
