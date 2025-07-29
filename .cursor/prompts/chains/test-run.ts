#!/usr/bin/env node --experimental-strip-types

/**
 * Simple test runner for the chain runner.
 * Run with: node --experimental-strip-types test-run.ts
 *
 * @module chains/test-run
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
import {
  executeChain,
  loadChainDefinition,
  substituteParameters,
} from './run.ts';

const testDir = mkdtempSync(join(tmpdir(), 'chain-test-'));

async function runTests() {
  console.log('🧪 Running Chain Runner Tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: substituteParameters
  console.log('Test: substituteParameters');
  try {
    const result = substituteParameters(
      'Hello {{name}}, welcome to {{place}}!',
      { name: 'Alice', place: 'Wonderland' },
    );

    if (result === 'Hello Alice, welcome to Wonderland!') {
      console.log('  ✅ PASS: Parameter substitution works correctly');
      passed++;
    } else {
      console.log(
        '  ❌ FAIL: Expected "Hello Alice, welcome to Wonderland!" but got:',
        result,
      );
      failed++;
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error);
    failed++;
  }

  // Test 2: loadChainDefinition
  console.log('\nTest: loadChainDefinition');
  try {
    const chainContent = `
name: Test Chain
description: A test chain
parameters:
  - name: param1
    description: First parameter
steps:
  - id: step-one
    prompt: Test step
`;

    const chainFile = join(testDir, '_test.yaml');
    writeFileSync(chainFile, chainContent);

    const chain = loadChainDefinition(chainFile);

    if (chain.name === 'Test Chain' && chain.steps.length === 1) {
      console.log('  ✅ PASS: Chain definition loaded correctly');
      passed++;
    } else {
      console.log('  ❌ FAIL: Chain not loaded correctly');
      failed++;
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error);
    failed++;
  }

  // Test 3: executeChain
  console.log('\nTest: executeChain');
  try {
    const chainContent = `
name: Test Chain
description: A test chain
parameters:
  - name: feature
    description: Feature name
steps:
  - id: implement
    prompt: Implement {{feature}} feature
`;

    const chainFile = join(testDir, '_test-exec.yaml');
    writeFileSync(chainFile, chainContent);

    const outputDir = await executeChain(
      'test-exec',
      ['authentication'],
      testDir,
    );

    const stepFile = join(outputDir, 'step_1_implement.md');
    if (existsSync(stepFile)) {
      const content = readFileSync(stepFile, 'utf8');
      if (content.includes('Implement authentication feature')) {
        console.log('  ✅ PASS: Chain executed successfully');
        passed++;
      } else {
        console.log('  ❌ FAIL: Step content incorrect');
        failed++;
      }
    } else {
      console.log('  ❌ FAIL: Step file not created');
      failed++;
    }

    // Clean up output directory
    rmSync(outputDir, { recursive: true, force: true });
  } catch (error) {
    console.log('  ❌ FAIL:', error);
    failed++;
  }

  // Clean up test directory
  rmSync(testDir, { recursive: true, force: true });

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📋 Total: ${passed + failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
