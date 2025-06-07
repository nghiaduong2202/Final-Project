export interface SearchResponse<T> {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<{
      _source: T;
      _score: number;
      _id: string;
      highlight?: Record<string, string[]>;
    }>;
  };
}
