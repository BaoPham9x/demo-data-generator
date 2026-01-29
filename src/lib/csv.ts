import { stringify, type Column } from "jsr:@std/csv";

/**
 * Write data array to CSV file
 */
export function writeToCsvFile(
  filepath: string,
  data: unknown[],
  columns: Column[]
): void {
  const csvContent = stringify(data, {
    columns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
  
  Deno.writeTextFileSync(filepath, csvContent);
  console.log(`✅ Written ${data.length} rows to ${filepath}`);
}

/**
 * Get output file path for a table
 */
export function getOutputPath(filename: string): string {
  // Ensure output directory exists
  const outputDir = "./output";
  try {
    Deno.mkdirSync(outputDir, { recursive: true });
  } catch {
    // Directory already exists, ignore
  }
  
  return `${outputDir}/${filename}.csv`;
}
