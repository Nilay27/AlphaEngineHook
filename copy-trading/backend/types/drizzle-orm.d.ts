// Type declarations for drizzle-orm
declare module 'drizzle-orm' {
  export function eq(column: any, value: any): any;
  export function and(...conditions: any[]): any;
  export function sql(template: TemplateStringsArray, ...args: any[]): any;
  export function asc(column: any): any;
  export function desc(column: any): any;
}

declare module 'drizzle-orm/sql' {
  export class SQL {
    constructor(queryString: string, values: any[]);
  }
}

declare module 'drizzle-orm/pg-core' {
  export function pgTable(name: string, columns: Record<string, any>): any;
  export function text(name: string): any;
  export function numeric(name: string): any;
  export function uuid(name: string): any;
  export function timestamp(name: string): any;
  export function boolean(name: string): any;
} 