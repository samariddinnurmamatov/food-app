export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type RequestConfig = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  params?: Record<string, string>;
  cancelKey?: string | null;
} & Pick<RequestInit, "cache" | "next">;

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
  errors?: unknown;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig;
export type ResponseInterceptor = <T>(
  response: ApiResponse<T>
) => ApiResponse<T>;
export type ErrorHandler = (error: ApiError) => void;

type BaseUrlType = "default" | "eimzo" | string;

class ApiClient {
  private readonly baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptor: RequestInterceptor | null;
  private responseInterceptor: ResponseInterceptor | null;
  private errorHandler: ErrorHandler | null;
  private abortControllers: Map<string, AbortController>;

  constructor(
    baseUrlType: BaseUrlType = "default",
    defaultHeadersOptions?: Record<string, string>
  ) {
    const baseUrls: Record<string, string> = {
      default: process.env.NEXT_BASE_URL!,
    };

    this.baseURL = baseUrls[baseUrlType] || baseUrls["default"];

    this.defaultHeaders = {
      ...defaultHeadersOptions,
      accept: "application/json",
    };
    this.requestInterceptor = null;
    this.responseInterceptor = null;
    this.errorHandler = null;
    this.abortControllers = new Map();
    this.setAuthorizationInterceptor();
  }

  private setAuthorizationInterceptor(): void {
    this.setRequestInterceptor((config: RequestConfig) => {
      const token: string | null = null;

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } else {
        const { ...restHeaders } = config.headers || {};
        config.headers = restHeaders;
      }
      return config;
    });
  }

  public setHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  public setErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  public setRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptor = interceptor;
  }

  public setResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptor = interceptor;
  }

  private buildQueryParams(params: Record<string, string>): string {
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `?${queryString}` : "";
  }

  private async handleError(error: Error): Promise<never> {
    const apiError: ApiError = error;

    if (this.errorHandler) {
      this.errorHandler(apiError);
    }

    throw apiError;
  }

  public cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  public async request<T = unknown>(
    endpoint: string,
    {
      method = "GET",
      headers = {},
      body,
      timeout = 30000,
      retries = 1,
      params = {},
      cancelKey = null,
      next,
    }: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    let config: RequestInit & { headers: Record<string, string> } = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      next,
    };
    if (body instanceof FormData) {
      delete config.headers["Content-Type"];
      config.body = body;
    } else if (body) {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const query = this.buildQueryParams(params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    if (cancelKey) {
      this.abortControllers.set(cancelKey, controller);
    }

    if (this.requestInterceptor) {
      const requestConfig = this.requestInterceptor(config as RequestConfig);
      config = requestConfig as RequestInit & {
        headers: Record<string, string>;
      };
    }

    for (let i = 0; i < retries; i++) {
      try {
        const fullUrl = `${this.baseURL}${endpoint}${query}`;

        const response = await fetch(fullUrl, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Request failed");

          (error as ApiError).status = response.status;
          (error as ApiError).data = errorData;
          (error as ApiError).errors = errorData.errors;

          throw error;
        }

        let responseData: T;
        if (method.toUpperCase() === "HEAD") {
          responseData = {} as T;
        } else {
          responseData = await response.json();
        }

        let apiResponse: ApiResponse<T> = {
          data: responseData,
          status: response.status,
          headers: response.headers,
        };

        if (this.responseInterceptor) {
          apiResponse = this.responseInterceptor(apiResponse);
        }

        if (cancelKey) {
          this.abortControllers.delete(cancelKey);
        }

        return apiResponse;
      } catch (error) {
        if (
          i === retries - 1 ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          await this.handleError(error as Error);
        }
      }
    }

    throw new Error("Maximum retries exceeded");
  }

  public async getBlob(
    endpoint: string,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<Blob>> {
    const config: RequestInit & { headers: Record<string, string> } = {
      method: "GET",
      headers: {
        ...this.defaultHeaders,
        ...options?.headers,
        Accept: "application/pdf, application/octet-stream",
      },
    };

    const query = options?.params ? this.buildQueryParams(options.params) : "";
    const fullUrl = `${this.baseURL}${endpoint}${query}`;

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Request failed");
        (error as ApiError).status = response.status;
        (error as ApiError).data = errorData;
        throw error;
      } catch {
        const error = new Error(await response.text());
        (error as ApiError).status = response.status;
        throw error;
      }
    }

    const blob = await response.blob();
    return {
      data: blob,
      status: response.status,
      headers: response.headers,
    };
  }

  public get<T = unknown>(
    endpoint: string,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public delete<T = unknown>(
    endpoint: string,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  public patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public head<T = unknown>(
    endpoint: string,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "HEAD" });
  }

  public options<T = unknown>(
    endpoint: string,
    options?: Omit<RequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "OPTIONS" });
  }
}

export const https = new ApiClient("default", {
  "Content-Type": "application/json",
});
