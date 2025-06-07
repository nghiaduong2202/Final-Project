export interface ElasticsearchConfig {
  node: string;
  maxRetries?: number;
  requestTimeout?: number;
  pingTimeout?: number;
  apiVersion?: string;
  auth?: {
    username: string;
    password: string;
  };
}
