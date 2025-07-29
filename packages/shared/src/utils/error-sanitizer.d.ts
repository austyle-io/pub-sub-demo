/**
 * @summary Sanitizes an error message to ensure it is safe for client-side display.
 * @remarks
 * This function checks if the error message is a known safe error. If it is, it
 * returns the corresponding user-friendly message. Otherwise, it returns a generic
 * error message to avoid exposing sensitive information.
 * @param error - The error message to sanitize.
 * @returns A safe error message.
 * @since 1.0.0
 */
export declare const sanitizeError: (error: string) => string;
/**
 * @summary Sanitizes an error of unknown type to ensure it is safe for client-side display.
 * @remarks
 * This function handles errors of any type, extracts the message if it's an `Error`
 * object or a string, and then sanitizes it using the `sanitizeError` function.
 * @param error - The error to sanitize.
 * @returns A safe error message.
 * @since 1.0.0
 */
export declare const sanitizeApiError: (error: unknown) => string;
//# sourceMappingURL=error-sanitizer.d.ts.map
