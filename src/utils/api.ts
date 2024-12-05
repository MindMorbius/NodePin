import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

// 统一响应格式
interface ApiResponse<T = any> {
  data: T;
  headers: Record<string, string>;
  status: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      async (config) => {
        // 获取 session 并添加 token 到请求头
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          // 处理 401 未授权
          if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.error || 'notification.pleaseLogin';
            const url = new URL('/', window.location.href);
            url.searchParams.set('auth_error', errorMessage);
            window.location.href = url.toString();
            return;
          }
          
          // 统一错误消息格式
          throw new Error(
            error.response?.data?.error || 
            error.message || 
            '请求失败'
          );
        }
        throw error;
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return {
        data: response.data,
        headers: response.headers as Record<string, string>,
        status: response.status,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  // HTTP 方法封装
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // 便捷方法：获取响应头特定字段
  getHeader(headers: Record<string, string>, name: string): string | null {
    const normalizedName = name.toLowerCase();
    const headerEntry = Object.entries(headers)
      .find(([key]) => key.toLowerCase() === normalizedName);
    return headerEntry ? headerEntry[1] : null;
  }

  // 便捷方法：设置通用请求头
  setHeader(name: string, value: string): void {
    this.client.defaults.headers.common[name] = value;
  }

  // 便捷方法：设置认证 token
  setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  // 便捷方法：清除认证 token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// 创建实例：一个用于内部 API，一个用于外部请求
export const api = new ApiClient();
export const externalApi = new ApiClient({ baseURL: '' });

export type { ApiResponse }; 