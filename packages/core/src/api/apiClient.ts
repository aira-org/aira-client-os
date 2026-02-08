import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { type z } from 'zod';
import type { TokenStorage } from '../utils';

declare const process: { env: { NODE_ENV?: string } } | undefined;
declare const __DEV__: boolean | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public zodError: z.ZodError,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ApiClientConfig {
  baseURL: string | undefined;
  isNative: boolean;
  tokenStorage?: TokenStorage;
  onUnauthorized?: () => void | Promise<void>;
  timeout?: number;
}

export type MockHandler = (url: string, method: string) => any;

export class ApiClient {
  private axios: AxiosInstance;
  private tokenStorage: TokenStorage | null = null;
  private onUnauthorized: (() => void | Promise<void>) | null = null;
  private mockHandler: MockHandler | null = null;

  constructor(config: ApiClientConfig) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: !config.isNative,
    });

    if (config.tokenStorage) {
      this.tokenStorage = config.tokenStorage;
    }
    if (config.onUnauthorized) {
      this.onUnauthorized = config.onUnauthorized;
    }

    this.setupInterceptors();
  }

  private isDevMode(): boolean {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      return true;
    }
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      return true;
    }
    return false;
  }

  getBaseURL(): string {
    return this.axios.defaults.baseURL ?? '';
  }

  setMockHandler(handler: MockHandler | null): void {
    this.mockHandler = handler;
  }

  hasMockHandler(): boolean {
    return this.mockHandler !== null;
  }

  private setupInterceptors(): void {
    this.axios.interceptors.request.use(async config => {
      if (this.tokenStorage) {
        const token = await this.tokenStorage.get();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // Log request headers in dev mode
      if (this.isDevMode()) {
        console.warn(`🚀 API Request: ${config.url}`, config);
      }
      return config;
    });

    this.axios.interceptors.response.use(
      res => {
        // Log response headers and data in dev mode
        if (this.isDevMode()) {
          console.warn(`✅ API Response: ${res.config.url}`, res);
        }
        return res;
      },
      (error: AxiosError) => {
        if ([401, 403, 404].includes(Number(error.response?.status)) && this.onUnauthorized) {
          Promise.resolve(this.onUnauthorized()).catch(err => {
            console.error('Error in onUnauthorized handler:', err);
          });
        }

        if (error.response) {
          const errorData = error.response.data as { message?: string } | undefined;
          const errorMessage = errorData?.message ?? error.message;
          throw new ApiError(errorMessage, error.response.status, error.code, error.response.data);
        }

        if (error.request) {
          throw new ApiError('Network error: Unable to reach server', undefined, error.code);
        }

        throw error;
      },
    );
  }

  private validate<T>(data: unknown, schema: z.ZodType<T>): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError('Response validation failed', result.error);
    }
    return result.data;
  }

  private logRequestError(url: string, error: unknown): void {
    if (this.isDevMode()) {
      console.warn(`❌ API request failed: ${url}`, error);
    }
  }

  async get<T = unknown>(url: string, schema?: z.ZodType<T>): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'GET');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const { data } = await this.axios.get<T>(url);
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }

  async post<T = unknown>(url: string, body?: unknown, schema?: z.ZodType<T>): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'POST');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const { data } = await this.axios.post<T>(url, body);
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }

  async postFormData<T = unknown>(
    url: string,
    formData: FormData,
    schema?: z.ZodType<T>,
  ): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'POST');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const { data } = await this.axios.post<T>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }

  async put<T = unknown>(url: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'PUT');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const { data } = await this.axios.put<T>(url, body);
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }

  async patch<T = unknown>(url: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'PATCH');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const { data } = await this.axios.patch<T>(url, body);
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }

  async delete<T = unknown>(url: string, body?: unknown, schema?: z.ZodType<T>): Promise<T> {
    try {
      if (this.mockHandler) {
        const mockData = this.mockHandler(url, 'DELETE');
        if (mockData !== undefined && mockData !== null) {
          return schema ? this.validate(mockData, schema) : (mockData as T);
        }
      }
      const config = body !== undefined ? { data: body } : undefined;
      const { data } = await this.axios.delete<T>(url, config);
      return schema ? this.validate(data, schema) : data;
    } catch (error) {
      this.logRequestError(url, error);
      throw error;
    }
  }
}

let client: ApiClient | null = null;

export const initApiClient = (config: ApiClientConfig): ApiClient => {
  client = new ApiClient(config);
  return client;
};

export const getApiClient = (): ApiClient => {
  if (!client) {
    throw new Error('ApiClient not initialized. Call initApiClient() first.');
  }
  return client;
};
