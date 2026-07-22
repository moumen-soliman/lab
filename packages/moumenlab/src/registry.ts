export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
}

export interface RegistryIndex {
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

export function registryOrigin(): string {
  return (process.env.MOUMENLAB_REGISTRY ?? "https://lab.moumen.dev").replace(/\/$/, "");
}

export async function fetchIndex(origin: string): Promise<RegistryIndex> {
  const url = `${origin}/r/registry.json`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (error) {
    throw new Error(`Could not reach the registry at ${url} (${(error as Error).message})`);
  }
  if (!res.ok) throw new Error(`Registry responded ${res.status} for ${url}`);
  return (await res.json()) as RegistryIndex;
}

export function components(index: RegistryIndex): RegistryItem[] {
  return index.items.filter((item) => item.type === "registry:component");
}
