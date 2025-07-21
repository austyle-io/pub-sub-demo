# Gemini CLI

## Overview

The Gemini CLI is configured for this project to interact with Google's Gemini AI API. This document covers the setup, configuration, and security best practices for using the Gemini CLI in development.

## Configuration

The Gemini CLI configuration is stored in the `.gemini/.env` file. This file contains environment-specific settings for interacting with Google's Gemini API.

## Required API Setup

1. **Google Cloud Project**: You need an active Google Cloud project with the Gemini API enabled
2. **API Key**: Generate an API key from the Google Cloud Console for authentication
3. **Service Account** (optional): For production use, create a service account with appropriate permissions

## IAM Role Requirements

The following IAM roles are required for full functionality:

- `roles/aiplatform.user` - For making API calls to Gemini
- `roles/aiplatform.viewer` - For reading model information
- Additional project-specific roles may be required based on your use case

## Security Considerations

⚠️ **IMPORTANT**: Never place secrets, API keys, or sensitive credentials directly in the `.gemini/` directory. This violates security best practices.

Instead:

- Use environment variables loaded from secure sources
- Leverage secret management tools like 1Password CLI
- Store sensitive values in `.env.local` (which should be in `.gitignore`)
- Use git-secrets to scan for accidental credential commits

## Example .gemini/.env Structure

```bash
# .gemini/.env - Configuration file (no secrets here!)
GEMINI_PROJECT_ID=your-project-id
GEMINI_REGION=us-central1
GEMINI_MODEL=gemini-pro

# API keys should be loaded from environment variables
# Example: GEMINI_API_KEY=$GEMINI_API_KEY_FROM_ENV
```

## Usage

Ensure your environment variables are properly set before using the Gemini CLI:

```bash
# Load API key from secure storage (e.g., 1Password)
export GEMINI_API_KEY=$(op read "op://Personal/Gemini API/credential")

# Run Gemini CLI commands
gemini chat "Your prompt here"
```

## Best Practices

### Security

- Never commit API keys or sensitive credentials
- Use secure storage solutions like 1Password CLI
- Regularly rotate API keys
- Monitor API usage and costs

### Development

- Test CLI commands in development environment first
- Use project-specific configurations
- Document any custom prompts or workflows

## Troubleshooting

### Common Issues

**Authentication Errors**:

```bash
# Verify API key is loaded
echo $GEMINI_API_KEY

# Check project configuration
cat .gemini/.env
```

**Permission Errors**:

- Verify IAM roles are correctly assigned
- Check project ID and region settings
- Ensure API is enabled in Google Cloud Console

**Configuration Issues**:

- Verify `.gemini/.env` file exists and is properly formatted
- Check environment variable loading
- Validate project settings

## Related Documentation

- [Google Cloud Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [IAM Best Practices](https://cloud.google.com/iam/docs/using-iam-securely)
- [Secret Management](../01_getting-started/00_INDEX.md#environment-variables)
