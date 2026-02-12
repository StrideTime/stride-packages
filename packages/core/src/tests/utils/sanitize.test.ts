import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeFields } from '../../utils/sanitize';

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('\thello\t')).toBe('hello');
  });

  it('removes control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld');
    expect(sanitizeString('test\x1Fdata')).toBe('testdata');
  });

  it('collapses multiple spaces', () => {
    expect(sanitizeString('hello   world')).toBe('hello world');
    expect(sanitizeString('a  b  c')).toBe('a b c');
  });
});

describe('sanitizeFields', () => {
  it('handles mixed types', () => {
    const input = {
      name: '  John  ',
      age: 30,
      active: true,
    };
    const result = sanitizeFields(input);
    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
    expect(result.active).toBe(true);
  });

  it('handles nested objects (should NOT recurse)', () => {
    const input = {
      name: '  John  ',
      address: {
        street: '  Main St  ',
      },
    };
    const result = sanitizeFields(input);
    expect(result.name).toBe('John');
    // Nested objects should NOT be sanitized (only top-level strings)
    expect((result.address as any).street).toBe('  Main St  ');
  });

  it('returns new object (does not mutate original)', () => {
    const input = { name: '  John  ' };
    const result = sanitizeFields(input);
    expect(result.name).toBe('John');
    expect(input.name).toBe('  John  ');
    expect(result).not.toBe(input);
  });
});
