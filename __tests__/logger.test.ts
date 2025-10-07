import log from '@/lib/logger';

describe('logger', () => {
  test('has methods', () => {
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.debug).toBe('function');
  });

  test('debug logs only when DEBUG env var is set', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    process.env.DEBUG = '1';
    log.debug('x');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    delete process.env.DEBUG;
  });
});
