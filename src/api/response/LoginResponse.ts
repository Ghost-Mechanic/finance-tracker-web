// Response for a successful login
export interface LoginSuccessResponse {
    token: string;
}

// Response for a failed login
export interface LoginErrorResponse {
    error: string;
}
