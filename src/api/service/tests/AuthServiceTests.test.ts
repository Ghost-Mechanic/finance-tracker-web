import { describe, it, expect, vi, afterEach } from "vitest";

import { authService } from "../AuthService";

import type { RegisterDto } from "../../dto/RegisterDto";
import type { RegisterResponse } from "../../response/RegisterResponse";

// Mock the global fetch
globalThis.fetch = vi.fn();

describe("authService", () => {
  const dummyData: RegisterDto = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a success response when registration succeeds", async () => {
    const mockResponse: RegisterResponse = { status: "SUCCESS" };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await authService.register(dummyData);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dummyData),
    });

    expect(result).toEqual(mockResponse);
  });

  it("should return validation errors when status is VALIDATION_ERROR", async () => {
    const mockResponse: RegisterResponse = {
      status: "VALIDATION_ERROR",
      validationErrors: { email: "Email is invalid" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await authService.register(dummyData);

    expect(result.status).toBe("VALIDATION_ERROR");
    expect(result.validationErrors).toEqual({ email: "Email is invalid" });
  });

  it("should return a business logic error when status is USERNAME_TAKEN", async () => {
    const mockResponse: RegisterResponse = { status: "USERNAME_TAKEN" };

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await authService.register(dummyData);

    expect(result.status).toBe("USERNAME_TAKEN");
  });

  it("should throw an error when fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    await expect(authService.register(dummyData)).rejects.toThrow("Network error");
  });
});
