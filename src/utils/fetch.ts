interface RequestOptions extends RequestInit {
  baseURL?: string;
  timeout?: number;
}

interface Response<T = any> {
  data: T;
  headers: Headers;
  status: number;
}

class HttpClient {
  private baseURL: string;
  private defaultOptions: RequestInit;

  constructor(options: RequestOptions = {}) {
    const { baseURL = '', ...defaultOptions } = options;
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...defaultOptions,
    };
  }

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<Response<T>> {
    const fullURL = this.baseURL ? new URL(url, this.baseURL).toString() : url;
    
    const controller = new AbortController();
    if (options.timeout) {
      setTimeout(() => controller.abort(), options.timeout);
    }

    const response = await fetch(fullURL, {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
      signal: controller.signal,
    });

    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as any;
    }

    return {
      data,
      headers: response.headers,
      status: response.status,
    };
  }

  get<T = any>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const http = new HttpClient(); 