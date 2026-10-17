import * as THREE from "three";
import { roadFootprint, type RoadLine } from "@/lib/game/data/road-footprint";
export { roadFootprint, type RoadLine } from "@/lib/game/data/road-footprint";

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
