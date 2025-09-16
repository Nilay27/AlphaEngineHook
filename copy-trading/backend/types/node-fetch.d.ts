// Type declarations for node-fetch v2
declare module 'node-fetch' {
  export default function fetch(
    url: string | Request,
    init?: RequestInit
  ): Promise<Response>;

  export class Request {
    constructor(input: string | Request, init?: RequestInit);
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
    readonly body: any;
    readonly bodyUsed: boolean;
    clone(): Request;
  }

  export class Response {
    constructor(body?: BodyInit, init?: ResponseInit);
    readonly url: string;
    readonly status: number;
    readonly statusText: string;
    readonly ok: boolean;
    readonly headers: Headers;
    readonly body: any;
    readonly bodyUsed: boolean;
    clone(): Response;
    json(): Promise<any>;
    text(): Promise<string>;
    buffer(): Promise<Buffer>;
    arrayBuffer(): Promise<ArrayBuffer>;
  }

  export class Headers {
    constructor(init?: HeadersInit);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string) => void): void;
    raw(): { [key: string]: string[] };
  }

  export interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    redirect?: 'follow' | 'error' | 'manual';
    signal?: AbortSignal;
    timeout?: number;
    compress?: boolean;
    size?: number;
    follow?: number;
    agent?: any;
  }

  export interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
  }

  export type HeadersInit = Headers | string[][] | Record<string, string>;
  export type BodyInit = ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | string | URLSearchParams | Buffer;
  export type RequestInfo = string | Request;
} 