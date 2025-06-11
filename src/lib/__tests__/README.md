# Email Validation Tests

This directory contains tests for the email validation functionality in the HootAI application.

## Running the Tests

To run the tests:

```bash
npm test
```

Or to run just the email validator tests:

```bash
npx jest email-validator
```

## Test Cases

The email validator tests include verification for:

1. Valid email formats (e.g., `user@example.com`, `user.name@domain.com`)
2. Invalid email formats (e.g., missing @ symbol, missing domain)
3. Edge cases (empty strings, URLs instead of emails, very long addresses)

## Implementation Notes

The email validation is implemented using a simple regex pattern:

```typescript
function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}
```

This pattern checks for:
- No whitespace before or after the @ symbol
- At least one character before the @ symbol
- At least one character after the @ symbol
- At least one dot (.) after the @ symbol

While this implementation is sufficient for basic validation, it does not fully comply with email RFC standards, which are much more complex. For production use with stricter validation requirements, consider using a dedicated library. 