// Lightweight lazy Prisma client wrapper
// We avoid importing @prisma/client at module evaluation time because
// some build environments (Turbopack/Next) may evaluate modules before
// the generated client is available. Instead initialize the client on
// first use via a Proxy.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

let _prisma: any = undefined;

function initPrisma() {
  if (_prisma) return _prisma;
  // Require dynamically to avoid top-level ESM import during build-time
  // which can fail if prisma generate hasn't run in some CI/build steps.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const { PrismaClient } = require('../app/generated/prisma');
  _prisma = global.__prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') global.__prisma = _prisma;
  return _prisma;
}

// Proxy that lazily initializes Prisma on first property access
const lazyPrisma = new Proxy({}, {
  get(_target, prop) {
    const client = initPrisma();
    return (client as any)[prop];
  },
  set(_target, prop, value) {
    const client = initPrisma();
    (client as any)[prop] = value;
    return true;
  },
  apply(_target, thisArg, argArray) {
    const client = initPrisma();
    return (client as any).apply(thisArg, argArray);
  }
});

export default lazyPrisma as any;
