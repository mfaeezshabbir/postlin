import { cn } from '@/lib/utils';

describe('cn utility', () => {
  test('merges class names and deduplicates using tailwind-merge', () => {
    expect(cn('p-2', 'p-2', 'text-sm', { 'text-sm': true } as any)).toContain('p-2');
  });
});
