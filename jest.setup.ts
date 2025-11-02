// Any global mocks or setup can go here

// Mock Web APIs for Next.js tests
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Mock fetch for tests
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock Request for Next.js server tests
if (!global.Request) {
  // @ts-ignore
  global.Request = class Request {
    constructor(public url: string, public init?: any) {}
  };
}

// Mock Response with proper json() method
if (!global.Response) {
  // @ts-ignore
  global.Response = class Response {
    constructor(public body: any, public init?: any) {}
    
    static json(data: any, init?: any) {
      return {
        ...init,
        json: async () => data,
        status: init?.status || 200,
      };
    }
  };
}
