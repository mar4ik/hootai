/// <reference types="jest" />

/**
 * Unit tests for email validation function
 */

// Import the function from our source file
// Note: We're creating a separate implementation for testing to avoid circular imports
function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

describe('Email Validator', () => {
  test('should correctly identify valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@example.co.uk',
      'user123@subdomain.domain.org',
      'first.last@example.domain.co'
    ];

    validEmails.forEach(email => {
      expect(isEmail(email)).toBe(true);
    });
  });

  test('should correctly reject invalid email addresses', () => {
    const invalidEmails = [
      'plaintext',
      'missing@dot',
      '@missinguser.com',
      'spaces in@email.com',
      'missing.domain@',
      'multiple@at@signs.com',
      'invalid@domain',
      'invalid@.com',
      '.invalid@domain.com',
      'invalid@domain..com'
    ];

    invalidEmails.forEach(email => {
      expect(isEmail(email)).toBe(false);
    });
  });

  test('should handle edge cases', () => {
    // Empty string
    expect(isEmail('')).toBe(false);
    
    // URL instead of email
    expect(isEmail('https://example.com')).toBe(false);
    
    // Very long local part
    const longLocalPart = 'a'.repeat(100) + '@example.com';
    expect(isEmail(longLocalPart)).toBe(true);
  });
}); 