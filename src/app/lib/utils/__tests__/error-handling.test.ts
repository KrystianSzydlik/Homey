import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, logError, isZodError } from '../error-handling';

describe('getErrorMessage', () => {
  it.each([
    [new Error('Test error'), 'Test error'],
    [new Error(''), ''],
    [new TypeError('Type mismatch'), 'Type mismatch'],
    ['Simple error', 'Simple error'],
    [{ message: 'Object error' }, 'Object error'],
    [null, 'null'],
    [undefined, 'undefined'],
    [404, '404'],
  ])('extracts message from %o', (input, expected) => {
    expect(getErrorMessage(input)).toBe(expected);
  });

  it('converts object without message property to string', () => {
    const error = { code: 'INVALID_REQUEST', status: 400 };
    expect(getErrorMessage(error)).toContain('code');
  });
});

describe('logError', () => {
  it('logs formatted error with context prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');

    logError('TestModule', error);

    expect(spy).toHaveBeenCalledWith('[TestModule] Test error', error);
    spy.mockRestore();
  });

  it('logs string errors with context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('API', 'Network timeout');

    expect(spy).toHaveBeenCalledWith('[API] Network timeout', 'Network timeout');
    spy.mockRestore();
  });
});

describe('isZodError', () => {
  it.each([
    [{ issues: [{ message: 'Invalid' }] }, true],
    [{ issues: [{ message: 'A' }, { message: 'B' }] }, true],
    [{ issues: [] }, true],
    [{ issues: [{ code: 'invalid_type' }] }, true],
    [{ code: 'ERROR_CODE' }, false],
    [{ issues: 'string instead of array' }, false],
    [null, false],
    [undefined, false],
    [new Error('Test'), false],
    ['error', false],
  ])('isZodError(%o) returns %s', (input, expected) => {
    expect(isZodError(input)).toBe(expected);
  });
});
