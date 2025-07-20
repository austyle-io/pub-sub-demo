import React, { useState, useCallback } from 'react';
import { sanitizeText } from '../utils/input-sanitizer';

interface SecureTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  rows?: number;
}

export const SecureTextArea: React.FC<SecureTextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  maxLength = 10000,
  className = '',
  rows = 10
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    
    // Apply basic sanitization while typing
    if (rawValue.length <= maxLength) {
      const sanitized = sanitizeText(rawValue);
      onChange(sanitized);
    }
  }, [onChange, maxLength]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Apply full sanitization on blur
    const fullySanitized = sanitizeText(value);
    if (fullySanitized !== value) {
      onChange(fullySanitized);
    }
  }, [value, onChange]);

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        rows={rows}
        style={{
          border: isFocused ? '2px solid #4c6ef5' : '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          width: '100%',
          resize: 'vertical'
        }}
      />
      <small style={{ color: '#666', fontSize: '12px' }}>
        {value.length}/{maxLength} characters
      </small>
    </div>
  );
};
