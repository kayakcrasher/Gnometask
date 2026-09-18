"""Gnome Tasks - entry point.

Phase 0: window, tile world, camera, click-to-move gnome, choppable oaks.
"""

import sys
import pygame

from src import settings as S
from src.camera import Camera
from src.tilemap import TileMap
from src.player import Player
from src.world_objects import scatter_oak_trees


def main() -> None:
    pygame.init()
    screen = pygame.display.set_mode((S.SCREEN_W, S.SCREEN_H))
    pygame.display.set_caption(S.CAPTION)
    clock = pygame.time.Clock()

    # --- world ---
    tilemap = TileMap(S.MAP_W, S.MAP_H)
    map_w_px = S.MAP_W * S.TILE_SIZE
    map_h_px = S.MAP_H * S.TILE_SIZE
    camera = Camera(map_w_px, map_h_px)

    player = Player(map_w_px // 2, map_h_px // 2)
    trees = scatter_oak_trees(tilemap)

    wood = 0

    running = True
    while running:
        dt = clock.tick(S.FPS) / 1000.0

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                mx, my = event.pos

                # screen -> world
                wx = mx + camera.x
                wy = my + camera.y

                # clamp to map so the gnome can never target outside
                wx = max(0, min(wx, map_w_px - 1))
                wy = max(0, min(wy, map_h_px - 1))

                clicked_tree = None
                for t in trees:
                    if t.distance_to(wx, wy) < 34:
                        clicked_tree = t
                        break

                if clicked_tree is not None:
                    player.move_to(clicked_tree.x, clicked_tree.y + 24)
                else:
                    player.move_to(wx, wy)

        player.update(dt)

        camera.follow(player.x, player.y, S.SCREEN_W, S.SCREEN_H)

        # --- draw ---
        screen.fill(S.GRASS_DARK)
        tilemap.draw(screen, camera.x, camera.y)

        for t in sorted(trees, key=lambda o: o.y):
            t.draw(screen, camera.x, camera.y)

        player.draw(screen, camera.x, camera.y)

        pygame.display.flip()

    pygame.quit()
    sys.exit(0)


if __name__ == "__main__":
    main()
