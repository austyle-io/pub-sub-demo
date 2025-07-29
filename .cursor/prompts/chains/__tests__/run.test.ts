/**
 * Tests for the chain runner script.
 *
 * @module chains/__tests__/run.test
 * @since 1.0.0
 */

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeChain,
  loadChainDefinition,
  substituteParameters,
} from '../run.ts';

describe('Chain Runner', () => {
  let testDir: string;

  beforeEach(() => {
    // Create temporary test directory
    testDir = mkdtempSync(join(tmpdir(), 'chain-test-'));

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }

    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('loadChainDefinition', () => {
    it('should load and parse a valid chain YAML file', () => {
      const chainContent = `
name: Test Chain
description: A test chain
parameters:
  - name: param1
    description: First parameter
  - name: param2
    description: Second parameter
steps:
  - id: step-one
    prompt: |
      Step one with {{param1}}
  - id: step-two
    prompt: |
      Step two with {{param2}}
`;

      const chainFile = join(testDir, '_test.yaml');
      writeFileSync(chainFile, chainContent);

      const chain = loadChainDefinition(chainFile);

      expect(chain.name).toBe('Test Chain');
      expect(chain.description).toBe('A test chain');
      expect(chain.parameters).toHaveLength(2);
      expect(chain.steps).toHaveLength(2);
      expect(chain.steps[0].id).toBe('step-one');
    });

    it('should throw error for non-existent file', () => {
      expect(() => {
        loadChainDefinition(join(testDir, 'non-existent.yaml'));
      }).toThrow();
    });

    it('should handle chain without parameters', () => {
      const chainContent = `
name: Simple Chain
description: A simple chain
steps:
  - id: step-one
    prompt: Simple step
`;

      const chainFile = join(testDir, '_simple.yaml');
      writeFileSync(chainFile, chainContent);

      const chain = loadChainDefinition(chainFile);

      expect(chain.parameters).toBeUndefined();
      expect(chain.steps).toHaveLength(1);
    });
  });

  describe('substituteParameters', () => {
    it('should substitute single parameter', () => {
      const template = 'Hello {{name}}!';
      const params = { name: 'World' };

      const result = substituteParameters(template, params);

      expect(result).toBe('Hello World!');
    });

    it('should substitute multiple parameters', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const params = { name: 'Alice', place: 'Wonderland' };

      const result = substituteParameters(template, params);

      expect(result).toBe('Hello Alice, welcome to Wonderland!');
    });

    it('should leave unmatched parameters unchanged', () => {
      const template = 'Hello {{name}}, your {{missing}} is ready!';
      const params = { name: 'Bob' };

      const result = substituteParameters(template, params);

      expect(result).toBe('Hello Bob, your {{missing}} is ready!');
    });

    it('should handle templates with no parameters', () => {
      const template = 'Hello World!';
      const params = { name: 'Ignored' };

      const result = substituteParameters(template, params);

      expect(result).toBe('Hello World!');
    });

    it('should handle multi-line templates', () => {
      const template = `Line 1: {{param1}}
Line 2: {{param2}}
Line 3: {{param1}} and {{param2}}`;
      const params = { param1: 'foo', param2: 'bar' };

      const result = substituteParameters(template, params);

      expect(result).toBe(`Line 1: foo
Line 2: bar
Line 3: foo and bar`);
    });
  });

  describe('executeChain', () => {
    it('should execute a chain successfully', async () => {
      // Create test chain
      const chainContent = `
name: Test Chain
description: A test chain
parameters:
  - name: feature
    description: Feature name
  - name: description
    description: Feature description
steps:
  - id: analyze
    prompt: |
      Analyze the {{feature}} feature.
      Description: {{description}}
  - id: implement
    prompt: |
      Implement {{feature}}.
`;

      const chainFile = join(testDir, '_test-chain.yaml');
      writeFileSync(chainFile, chainContent);

      // Execute chain
      const outputDir = await executeChain(
        'test-chain',
        ['authentication', 'User login system'],
        testDir,
      );

      // Verify output directory exists
      expect(existsSync(outputDir)).toBe(true);

      // Verify chain output file
      const outputFile = join(outputDir, 'chain_output.md');
      expect(existsSync(outputFile)).toBe(true);

      const outputContent = readFileSync(outputFile, 'utf8');
      expect(outputContent).toContain('# Test Chain Chain Execution');
      expect(outputContent).toContain(
        '**Parameters**: authentication, User login system',
      );
      expect(outputContent).toContain('## Step 1: analyze');
      expect(outputContent).toContain('## Step 2: implement');

      // Verify step files
      const step1File = join(outputDir, 'step_1_analyze.md');
      expect(existsSync(step1File)).toBe(true);

      const step1Content = readFileSync(step1File, 'utf8');
      expect(step1Content).toContain('# Step: analyze');
      expect(step1Content).toContain('Analyze the authentication feature');
      expect(step1Content).toContain('Description: User login system');

      const step2File = join(outputDir, 'step_2_implement.md');
      expect(existsSync(step2File)).toBe(true);

      const step2Content = readFileSync(step2File, 'utf8');
      expect(step2Content).toContain('Implement authentication');

      // Clean up output directory
      rmSync(outputDir, { recursive: true, force: true });
    });

    it('should throw error for non-existent chain', async () => {
      await expect(executeChain('non-existent', [], testDir)).rejects.toThrow(
        "Chain 'non-existent' not found!",
      );
    });

    it('should handle chain with no parameters', async () => {
      const chainContent = `
name: Simple Chain
description: A simple chain
steps:
  - id: simple-step
    prompt: This is a simple step with no parameters
`;

      const chainFile = join(testDir, '_simple.yaml');
      writeFileSync(chainFile, chainContent);

      const outputDir = await executeChain('simple', [], testDir);

      const stepFile = join(outputDir, 'step_1_simple-step.md');
      const stepContent = readFileSync(stepFile, 'utf8');
      expect(stepContent).toContain('This is a simple step with no parameters');

      // Clean up
      rmSync(outputDir, { recursive: true, force: true });
    });

    it('should handle missing parameter values gracefully', async () => {
      const chainContent = `
name: Param Chain
description: Chain with parameters
parameters:
  - name: param1
    description: First param
  - name: param2
    description: Second param
steps:
  - id: step
    prompt: "Params: {{param1}} and {{param2}}"
`;

      const chainFile = join(testDir, '_param.yaml');
      writeFileSync(chainFile, chainContent);

      // Only provide one parameter
      const outputDir = await executeChain('param', ['value1'], testDir);

      const stepFile = join(outputDir, 'step_1_step.md');
      const stepContent = readFileSync(stepFile, 'utf8');
      expect(stepContent).toContain('Params: value1 and {{param2}}');

      // Clean up
      rmSync(outputDir, { recursive: true, force: true });
    });
  });
});
