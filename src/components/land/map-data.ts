import type { PlaceId } from "@/lib/game/types";

export const REGIONS: { id: PlaceId; d: string }[] = [
  {
    id: "woods",
    d: "M40 80 C 40 40 160 20 240 70 C 300 40 360 90 340 170 C 300 230 160 250 80 210 C 20 170 40 120 40 80 Z",
  },
  {
    id: "pond",
    d: "M360 70 C 430 20 640 20 720 90 C 760 140 700 210 600 230 C 480 250 330 180 360 70 Z",
  },
  {
    id: "dock",
    d: "M20 400 C 50 330 180 320 230 410 C 250 490 120 560 40 520 C 8 480 4 430 20 400 Z",
  },
  {
    id: "cottage",
    d: "M220 280 C 260 230 500 220 560 300 C 600 360 560 470 470 500 C 340 530 180 460 220 280 Z",
  },
  {
    id: "shop",
    d: "M600 330 C 660 290 820 300 860 380 C 880 450 820 530 730 540 C 620 550 560 450 600 330 Z",
  },
  {
    id: "village",
    d: "M820 300 C 980 220 1400 240 1480 400 C 1540 520 1460 820 1180 860 C 940 890 780 720 800 520 C 810 420 760 360 820 300 Z",
  },
  {
    id: "wildlands",
    d: "M1480 160 C 1680 40 2140 80 2280 280 C 2360 460 2200 820 1860 860 C 1600 880 1400 420 1480 160 Z",
  },
  {
    id: "ruins",
    d: "M2140 40 C 2320 -20 2720 60 2760 260 C 2780 420 2600 500 2320 460 C 2140 430 2040 160 2140 40 Z",
  },
  {
    id: "garden",
    d: "M70 540 C 140 500 760 500 790 600 C 820 720 760 940 520 980 C 220 1020 40 860 70 540 Z",
  },
  {
    id: "mines",
    d: "M980 1040 C 1200 980 1700 1020 1880 1180 C 1980 1290 1780 1450 1360 1460 C 1040 1470 840 1260 980 1040 Z",
  },
  {
    id: "haven",
    d: "M1180 720 C 1260 700 1480 720 1520 820 C 1540 900 1460 980 1320 990 C 1200 1000 1140 860 1180 720 Z",
  },
];

export const FLOWER_COLORS = ["#d6a84c", "#a8433b", "#8cb067", "#e8dfc4", "#c24f45"];

export const WILD_FLORA: { src: string; x: number; y: number; w: number; h: number }[] = [
  { src: "/flowers/foxglove.png", x: 132, y: 198, w: 28, h: 48 },
  { src: "/flowers/bluebell.png", x: 210, y: 236, w: 26, h: 44 },
  { src: "/flowers/poppy.png", x: 58, y: 300, w: 24, h: 38 },
  { src: "/flowers/lavender.png", x: 248, y: 620, w: 26, h: 42 },
  { src: "/flowers/daisy.png", x: 720, y: 700, w: 24, h: 38 },
  { src: "/flowers/toadstool.png", x: 88, y: 340, w: 32, h: 32 },
  { src: "/flowers/foxglove.png", x: 560, y: 640, w: 26, h: 46 },
  { src: "/flowers/bluebell.png", x: 1180, y: 390, w: 24, h: 42 },
  { src: "/flowers/poppy.png", x: 1360, y: 620, w: 24, h: 38 },
  { src: "/flowers/lavender.png", x: 1080, y: 580, w: 26, h: 42 },
  { src: "/flowers/daisy.png", x: 420, y: 560, w: 22, h: 36 },
  { src: "/flowers/toadstool.png", x: 190, y: 200, w: 30, h: 30 },
  { src: "/flowers/foxglove.png", x: 1540, y: 240, w: 28, h: 48 },
  { src: "/flowers/bluebell.png", x: 90, y: 860, w: 24, h: 42 },
  { src: "/flowers/poppy.png", x: 680, y: 860, w: 24, h: 38 },
];

export const MUSH_SPOTS = [
  [70, 250],
  [118, 288],
  [46, 318],
  [200, 176],
  [156, 330],
  [240, 620],
  [680, 760],
  [900, 620],
  [1180, 380],
  [1400, 700],
  [80, 780],
  [1480, 240],
] as const;

export const TREE_SPOTS = [
  [90, 160, 1.1],
  [40, 220, 0.85],
  [180, 120, 0.9],
  [1480, 180, 1.05],
  [1540, 280, 0.8],
  [1400, 120, 0.75],
  [80, 980, 0.95],
  [1500, 960, 1],
  [40, 860, 0.7],
  [2320, 80, 0.85],
  [2680, 180, 1],
  [1100, 1320, 0.8],
  [1680, 1380, 0.95],
] as const;

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}
