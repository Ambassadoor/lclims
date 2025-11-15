// Hardware feature - Type definitions

export interface PrintOptions {
  template: string;
  data: Record<string, string>;
  printer?: string;
  copies?: number;
}

export interface PreviewOptions {
  template: string;
  data: Record<string, string>;
  width?: number;
  height?: number;
}

export interface PrintResult {
  success: boolean;
  message: string;
  jobId?: string;
  data?: any;
}

export interface PreviewResult {
  success: boolean;
  imageBase64?: string;
  message?: string;
}

export interface Printer {
  name: string;
  online: boolean;
  supported: boolean;
  model?: string;
  port?: string;
  supportedMedia?: string[];
}

export interface PrintServerHealth {
  status: string;
  adapter: string;
}
