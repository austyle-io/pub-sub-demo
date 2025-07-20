import { writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { openApiSpec } from '../src/openapi'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const outputPath = join(__dirname, '..', '..', '..', 'openapi.json')

writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2))

console.log(`OpenAPI specification generated at: ${outputPath}`)