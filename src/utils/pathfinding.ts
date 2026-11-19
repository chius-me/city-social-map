import type { RelationEdge } from "../types";
import { CHARACTERS } from "../data/characters";
import { EDGES } from "../data/edges";

export interface PathStep {
  from: string;
  to: string;
  edge?: RelationEdge;
  /** If connected via shared faction (e.g., two Soccer Team players with no explicit edge) */
  sharedFactionId?: string;
}

export interface PathResult {
  found: boolean;
  sameNode?: boolean;
  isJohnLennon?: boolean;
  nodes: string[];
  steps: PathStep[];
}

/**
 * Computes shortest social path between two CITY residents using BFS.
 * Prioritizes explicit relationship edges first; falls back to shared-faction
 * membership (e.g. CITY South Soccer Team teammates) if no edge-only path exists,
 * while faithfully keeping John Lennon isolated!
 */
export function findSocialPath(startId: string, endId: string): PathResult {
  if (startId === endId) {
    return { found: true, sameNode: true, nodes: [startId], steps: [] };
  }

  if (startId === "john-lennon" || endId === "john-lennon") {
    return { found: false, isJohnLennon: true, nodes: [], steps: [] };
  }

  // Build adjacency list: edge links have priority (weight 1); faction links optional fallback
  const edgeAdj = new Map<string, { next: string; edge: RelationEdge }[]>();
  for (const c of CHARACTERS) {
    edgeAdj.set(c.id, []);
  }
  for (const edge of EDGES) {
    edgeAdj.get(edge.from)?.push({ next: edge.to, edge });
    edgeAdj.get(edge.to)?.push({ next: edge.from, edge });
  }

  // First try explicit edges only
  const edgePath = runBfs(startId, endId, edgeAdj, false);
  if (edgePath) return edgePath;

  // Fallback: allow shared-faction hops (for Soccer Team members like Yamato -> Tatewaku)
  const combinedAdj = new Map<
    string,
    { next: string; edge?: RelationEdge; sharedFactionId?: string }[]
  >();
  for (const c of CHARACTERS) {
    combinedAdj.set(c.id, [...(edgeAdj.get(c.id) ?? [])]);
  }
  for (const c1 of CHARACTERS) {
    for (const c2 of CHARACTERS) {
      if (c1.id >= c2.id) continue;
      const shared = c1.factions.find((f) => c2.factions.includes(f));
      if (shared) {
        combinedAdj.get(c1.id)?.push({ next: c2.id, sharedFactionId: shared });
        combinedAdj.get(c2.id)?.push({ next: c1.id, sharedFactionId: shared });
      }
    }
  }

  const combinedPath = runBfs(startId, endId, combinedAdj, true);
  if (combinedPath) return combinedPath;

  return { found: false, nodes: [], steps: [] };
}

function runBfs(
  startId: string,
  endId: string,
  adj: Map<string, { next: string; edge?: RelationEdge; sharedFactionId?: string }[]>,
  allowFaction: boolean
): PathResult | null {
  const visited = new Set<string>([startId]);
  const parent = new Map<
    string,
    { prev: string; edge?: RelationEdge; sharedFactionId?: string }
  >();
  const queue: string[] = [startId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr) ?? [];
    for (const item of neighbors) {
      if (!allowFaction && !item.edge) continue;
      if (visited.has(item.next)) continue;
      visited.add(item.next);
      parent.set(item.next, {
        prev: curr,
        edge: item.edge,
        sharedFactionId: item.sharedFactionId,
      });
      if (item.next === endId) {
        const nodes: string[] = [];
        const steps: PathStep[] = [];
        let cursor = endId;
        while (cursor !== startId) {
          nodes.unshift(cursor);
          const p = parent.get(cursor)!;
          steps.unshift({
            from: p.prev,
            to: cursor,
            edge: p.edge,
            sharedFactionId: p.sharedFactionId,
          });
          cursor = p.prev;
        }
        nodes.unshift(startId);
        return { found: true, nodes, steps };
      }
      queue.push(item.next);
    }
  }
  return null;
}
