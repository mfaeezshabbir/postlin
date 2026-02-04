// Any global mocks or setup can go here
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, WritableStream, TransformStream } from "stream/web";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;
global.WritableStream = WritableStream as any;
global.TransformStream = TransformStream as any;
