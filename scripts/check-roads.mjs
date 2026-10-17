import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

// Exercise the actual triangulated surface, including crossings and town-block holes.
const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from "node:assert/strict";
      import { roadFootprint, roadGeometry } from "./src/components/world/road-surface";
      import { ROADS, ROAD_TOP } from "./src/lib/game/data/country";
      import { TOWN_GRIDS, townStreets, capitolStreets } from "./src/lib/game/data/grids";

      function area(geometry) {
        const p = geometry.getAttribute("position");
        let total = 0;
        for (let i = 0; i < p.count; i += 3) {
          const cross = (p.getZ(i + 1) - p.getZ(i)) * (p.getX(i + 2) - p.getX(i))
            - (p.getX(i + 1) - p.getX(i)) * (p.getZ(i + 2) - p.getZ(i));
          assert(cross > 0, "Every road triangle must face up and have positive area: " + cross + " at " + i);
          total += cross / 2;
        }
        return total;
      }
      const horizontal = { points: [[-5, 0], [5, 0]], width: 2 };
      const vertical = { points: [[0, -5], [0, 5]], width: 2 };
      const single = roadGeometry([horizontal], ROAD_TOP);
      const crossing = roadGeometry([horizontal, vertical], ROAD_TOP);
      assert.equal(roadFootprint([horizontal, vertical]).length, 1, "Crossroads must be connected");
      assert(Math.abs(area(crossing) - (area(single) * 2 - 4)) < 0.0001,
        "Crossroads must triangulate overlapping paving only once");
      const duplicate = roadGeometry([horizontal, horizontal], ROAD_TOP);
      assert(Math.abs(area(duplicate) - area(single)) < 0.0001, "Duplicate segments must not add faces");
      const block = [
        { points: [[0, 0], [10, 0]], width: 2 },
        { points: [[10, 0], [10, 10]], width: 2 },
        { points: [[10, 10], [0, 10]], width: 2 },
        { points: [[0, 10], [0, 0]], width: 2 },
      ];
      assert.equal(roadFootprint(block)[0].length, 2, "Town blocks must keep an unpaved interior");
      const blockGeo = roadGeometry(block, ROAD_TOP);
      assert(area(blockGeo) < 80 && area(blockGeo) > 75, "Triangulation must preserve the block hole");
      assert.equal(roadGeometry([{ points: [[0, 0], [0, 0]], width: 2 }], ROAD_TOP)
        .getAttribute("position").count, 0, "Zero-length segments must be ignored");
      const lines = ROADS.map(r => ({ points: r.points, width: 1.65 }));
      for (const s of [...TOWN_GRIDS.flatMap(townStreets), ...capitolStreets()]) {
        lines.push({ points: [[s.ax, s.ay], [s.bx, s.by]], width: s.width });
      }
      for (const line of lines) line.points = line.points.map(([x, y]) => [(x - 1400) * 0.05, (y - 740) * 0.05]);
      assert.equal(roadFootprint(lines).length, 1, "Every town street must connect to the road network");
      for (const shoulder of [false, true]) {
        const geo = roadGeometry(lines, ROAD_TOP, shoulder);
        assert(area(geo) > 0, "The full road network must triangulate");
        const p = geo.getAttribute("position");
        const uv = geo.getAttribute("uv");
        for (let i = 0; i < p.count; i++) {
          assert(Number.isFinite(p.getX(i)) && Number.isFinite(p.getZ(i)));
          assert(Math.abs(p.getY(i) - ROAD_TOP) < 0.000001);
          assert(Math.abs(uv.getX(i) - p.getX(i) / 2.4) < 0.00001);
          assert(Math.abs(uv.getY(i) - p.getZ(i) / 2.4) < 0.00001);
        }
        geo.dispose();
      }
      for (const geo of [single, crossing, duplicate, blockGeo]) geo.dispose();
      console.log("Road checks passed: junctions, duplicate faces, block holes, winding, UVs, full network.");
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
});
try {
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

