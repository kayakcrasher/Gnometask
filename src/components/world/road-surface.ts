import polygonClipping, { type Polygon, type Ring } from "polygon-clipping";
import * as THREE from "three";

export type RoadLine = { points: [number, number][]; width: number };

/** Round-ended strips, merged before triangulation so junctions have no seams. */
export function roadFootprint(lines: RoadLine[], shoulder = false, exclude: RoadLine[] = []) {
  const strips: Polygon[] = [];
  for (const line of lines) {
    const radius = line.width / 2 + (shoulder ? Math.min(0.18, line.width * 0.12) : 0);
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1]!;
      const b = line.points[i]!;
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.0001) continue;
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const ring: Ring = [];
      for (const [center, start] of [[b, angle - Math.PI / 2], [a, angle + Math.PI / 2]] as const) {
        for (let step = 0; step <= 8; step++) {
          const theta = start + step * Math.PI / 8;
          // Snap away trigonometric noise before the polygon union.
          ring.push([
            Math.round((center[0] + Math.cos(theta) * radius) * 1e6) / 1e6,
            Math.round((center[1] + Math.sin(theta) * radius) * 1e6) / 1e6,
          ]);
        }
      }
      ring.push([...ring[0]!] as [number, number]);
      strips.push([ring]);
    }
  }
  const merged = strips.length ? polygonClipping.union(strips[0]!, ...strips.slice(1)) : [];
  const mask = exclude.length ? roadFootprint(exclude) : [];
  return merged.length && mask.length ? polygonClipping.difference(merged, mask) : merged;
}

export function roadGeometry(lines: RoadLine[], height: number, shoulder = false, exclude: RoadLine[] = []) {
  const positions: number[] = [];
  const uvs: number[] = [];
  for (const polygon of roadFootprint(lines, shoulder, exclude)) {
    // ShapeGeometry handles the unpaved holes inside town blocks.
    const paths = polygon.map((ring) => ring.slice(0, -1).map(([x, z]) => new THREE.Vector2(x, -z)));
    const shape = new THREE.Shape(paths[0]);
    shape.holes = paths.slice(1).map((points) => new THREE.Path(points));
    const flat = new THREE.ShapeGeometry(shape);
    const geo = flat.toNonIndexed();
    const vertices = geo.getAttribute("position");
    for (let i = 0; i < vertices.count; i += 3) {
      const cross = (vertices.getX(i + 1) - vertices.getX(i)) * (vertices.getY(i + 2) - vertices.getY(i))
        - (vertices.getY(i + 1) - vertices.getY(i)) * (vertices.getX(i + 2) - vertices.getX(i));
      // Boolean intersections can collapse to a line at GPU (float32) precision.
      if (Math.abs(cross) < 1e-10) continue;
      for (const j of cross > 0 ? [i, i + 1, i + 2] : [i, i + 2, i + 1]) {
        const x = vertices.getX(j);
        const z = -vertices.getY(j);
        positions.push(x, height, z);
        // World coordinates keep stone size and alignment identical across every road.
        uvs.push(x / 2.4, z / 2.4);
      }
    }
    geo.dispose();
    flat.dispose();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}
