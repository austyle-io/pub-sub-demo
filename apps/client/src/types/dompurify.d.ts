declare module 'dompurify' {
  interface Config {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    ALLOW_DATA_ATTR?: boolean;
    FORBID_SCRIPT?: boolean;
    STRIP_COMMENTS?: boolean;
    [key: string]: any;
  }

  interface DOMPurify {
    sanitize(dirty: string, config?: Config): string;
  }

  const DOMPurify: DOMPurify;
  export default DOMPurify;
}
