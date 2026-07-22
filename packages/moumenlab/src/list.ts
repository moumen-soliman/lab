import { components, fetchIndex } from "./registry";

export async function list(origin: string): Promise<void> {
  const index = await fetchIndex(origin);
  const items = components(index);

  console.log(`\nmoumenlab — ${items.length} component${items.length === 1 ? "" : "s"}\n`);
  for (const item of items) {
    console.log(`  ${item.name}`);
    if (item.description) console.log(`    ${item.description}`);
    console.log(`    ${origin}/components/${item.name}\n`);
  }
  console.log("Install:  npx moumenlab add <name>\n");
}
