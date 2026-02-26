import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, logError, isZodError } from '../error-handling';

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    const error = new Error('Test error message');
    expect(getErrorMessage(error)).toBe('Test error message');
  });

  it('returns string as-is when input is string', () => {
    expect(getErrorMessage('Simple error')).toBe('Simple error');
  });

  it('returns empty string message from Error', () => {
    const error = new Error('');
    expect(getErrorMessage(error)).toBe('');
  });

  it('extracts message from object with message property', () => {
    const error = { message: 'Object error message' };
    expect(getErrorMessage(error)).toBe('Object error message');
  });

  it('converts object without message property to string', () => {
    const error = { code: 'INVALID_REQUEST', status: 400 };
    expect(getErrorMessage(error)).toContain('code');
  });

  it('handles null gracefully', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('handles undefined gracefully', () => {
    expect(getErrorMessage(undefined)).toBe('undefined');
  });

  it('handles number values', () => {
    expect(getErrorMessage(404)).toBe('404');
  });

  it('handles boolean values', () => {
    expect(getErrorMessage(true)).toBe('true');
    expect(getErrorMessage(false)).toBe('false');
  });

  it('handles TypeError instances', () => {
    const error = new TypeError('Type mismatch');
    expect(getErrorMessage(error)).toBe('Type mismatch');
  });
});

describe('logError', () => {
  it('logs error with context prefix', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');

    logError('TestModule', error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule] Test error', error);
    consoleErrorSpy.mockRestore();
  });

  it('logs string errors with context', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('API', 'Network timeout');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[API] Network timeout', 'Network timeout');
    consoleErrorSpy.mockRestore();
  });

  it('handles unknown error types in logging', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const unknownError = { arbitrary: 'object' };

    logError('Service', unknownError);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('isZodError', () => {
  it('returns true for valid Zod error object', () => {
    const zodError = {
      issues: [{ message: 'Invalid value' }],
    };
    expect(isZodError(zodError)).toBe(true);
  });

  it('returns true for Zod error with multiple issues', () => {
    const zodError = {
      issues: [
        { message: 'Field required' },
        { message: 'Invalid format' },
      ],
    };
    expect(isZodError(zodError)).toBe(true);
  });

  it('returns false for object without issues property', () => {
    const notZodError = { code: 'ERROR_CODE' };
    expect(isZodError(notZodError)).toBe(false);
  });

  it('returns false for object with non-array issues', () => {
    const notZodError = { issues: 'string instead of array' };
    expect(isZodError(notZodError)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isZodError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isZodError(undefined)).toBe(false);
  });

  it('returns false for Error instance', () => {
    const error = new Error('Test error');
    expect(isZodError(error)).toBe(false);
  });

  it('returns false for string', () => {
    expect(isZodError('error')).toBe(false);
  });

  it('returns false for empty issues array', () => {
    const zodError = { issues: [] };
    expect(isZodError(zodError)).toBe(true);
  });

  it('returns false for issues with wrong structure', () => {
    const notZodError = {
      issues: [{ code: 'invalid_type' }],
    };
    expect(isZodError(notZodError)).toBe(true);
  });
});
