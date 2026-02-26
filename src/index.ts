#!/usr/bin/env node

/**
 * Mermaid Viber CLI
 *
 * Command-line utility to convert Mermaid diagram text files to styled JPEG images
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { renderMermaidToJPEG } from './renderer.js';

const program = new Command();

program
  .name('mermaid-viber')
  .description('Convert Mermaid diagram text files to styled JPEG images')
  .version('1.0.0')
  .option('-i, --input <directory>', 'Input directory containing .txt files', 'mermaids')
  .option('-o, --output <directory>', 'Output directory for JPEG files', 'images')
  .parse(process.argv);

const options = program.opts();

interface ProcessingResult {
  filename: string;
  success: boolean;
  error?: string;
}

async function main() {
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);

  console.log('🎨 Mermaid Viber CLI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Input directory:  ${inputDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log();

  // Ensure output directory exists
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    console.error(`❌ Failed to create output directory: ${error}`);
    process.exit(1);
  }

  // Read input directory
  let files: string[];
  try {
    files = await fs.readdir(inputDir);
  } catch (error) {
    console.error(`❌ Failed to read input directory: ${error}`);
    process.exit(1);
  }

  // Filter for .txt files
  const txtFiles = files.filter(file => file.endsWith('.txt'));

  if (txtFiles.length === 0) {
    console.log('⚠️  No .txt files found in input directory');
    return;
  }

  console.log(`📄 Found ${txtFiles.length} diagram file(s)\n`);

  // Process each file
  const results: ProcessingResult[] = [];

  for (const file of txtFiles) {
    const inputPath = path.join(inputDir, file);
    const outputFilename = file.replace(/\.txt$/, '.jpg');
    const outputPath = path.join(outputDir, outputFilename);

    console.log(`🔄 Processing: ${file}`);

    try {
      // Read mermaid diagram content
      const content = await fs.readFile(inputPath, 'utf-8');

      // Render to JPEG
      const jpegBuffer = await renderMermaidToJPEG(content);

      // Write output file
      await fs.writeFile(outputPath, jpegBuffer);

      console.log(`   ✅ Created: ${outputFilename}`);
      results.push({ filename: file, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Failed: ${errorMessage}`);
      results.push({ filename: file, success: false, error: errorMessage });
    }
  }

  // Summary
  console.log();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed:     ${failed}`);
  console.log();

  if (failed > 0) {
    console.log('Failed files:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.filename}: ${r.error}`);
    });
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
