// Type declarations for @jest/globals
declare module '@jest/globals' {
  export function describe(
    name: string,
    fn: () => void
  ): void;

  export function test(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;

  export function expect(value: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(expected: any): void;
    toHaveProperty(prop: string, value?: any): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeInstanceOf(expected: any): void;
    not: {
      toBe(expected: any): void;
      toEqual(expected: any): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toContain(expected: any): void;
      toHaveProperty(prop: string, value?: any): void;
      toBeGreaterThan(expected: number): void;
      toBeGreaterThanOrEqual(expected: number): void;
      toBeLessThan(expected: number): void;
      toBeLessThanOrEqual(expected: number): void;
      toBeNull(): void;
      toBeUndefined(): void;
      toBeInstanceOf(expected: any): void;
    };
  };

  export function beforeAll(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;

  export function afterAll(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;

  export function beforeEach(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;

  export function afterEach(
    fn: () => void | Promise<void>,
    timeout?: number
  ): void;
} 