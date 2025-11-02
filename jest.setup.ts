// Any global mocks or setup can go here

// Mock Web APIs for Next.js tests
import { TextEncoder, TextDecoder } from 'util';

// Define TextEncoder/TextDecoder globally for Node.js test environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock fetch for tests
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock Request for Next.js server tests
// Using type assertion since we're defining minimal mock for testing
if (!global.Request) {
  global.Request = class Request {
    constructor(public url: string, public init?: any) {}
  } as any;
}

// Mock Response with proper json() method for Next.js API route testing
if (!global.Response) {
  global.Response = class Response {
    constructor(public body: any, public init?: any) {}
    
    static json(data: any, init?: any) {
      return {
        ...init,
        json: async () => data,
        status: init?.status || 200,
      };
    }
  } as any;
}
