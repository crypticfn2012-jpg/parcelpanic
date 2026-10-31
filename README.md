# PARCEL PANIC

**Steal. Deliver. Survive.**

A stylised 3D browser party game built with Three.js. This repository is the active project.

## Run locally

Use a local HTTP server rather than opening the HTML file directly. CrazyGames SDK v3 recognises localhost as its local test environment.

With Node.js installed:

    npx serve .

Then open the localhost URL printed by the server.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Mouse | Look around |
| Space | Jump / double jump |
| Shift | Sprint |
| E | Pick up / steal |
| Q | Throw parcel |
| F | Push a rival |
| Escape | Pause / resume |
| Mobile | On-screen movement stick, camera swipe and action buttons |

## Current playable build

- Four modes: Delivery Rush, Team Delivery, Last Runner Standing and Golden Package.
- Four map themes: Neon City, Tropical Trouble, The Factory and Skyfall.
- Third-person character movement, jumping, sprinting and pushing.
- Common, rare, epic, golden and diamond parcels with pickup, stealing, throwing and delivery scoring.
- Team colours and shared team score, plus a shrinking safe zone in Last Runner Standing.
- Match events, animated delivery rings, map landmarks and a redesigned responsive lobby/HUD.
- Local profile progression (XP, coins, match results) with CrazyGames Data API integration and a local-storage fallback.
- CrazyGames SDK v3 initialisation, gameplay lifecycle and optional rewarded-ad integration.

**Multiplayer status:** the current opponents are clearly labelled local AI runners. There is not yet an authoritative online multiplayer server, internet matchmaking, party system or real human-vs-human play. The game must not be described as online multiplayer until that infrastructure is implemented and tested.

## CrazyGames setup

The site includes the official SDK v3 script and initialises it through `src/crazygames.js`. It safely falls back to local play when the SDK is unavailable or disabled. The game uses the SDK's game lifecycle and data modules, and only requests a rewarded ad after the player presses the optional reward button.

For production submission:
1. Add the GitHub Pages or production URL as the game URL in the CrazyGames developer portal.
2. Enable Progress Save in the CrazyGames game settings before relying on cloud data.
3. Enable rewarded ads for the game before testing the optional post-match bonus.
4. Test the game in CrazyGames preview; SDK behaviour and ad inventory cannot be fully validated from a normal GitHub preview.

## Files

- `index.html`: entry point and game UI.
- `src/game.js`: Three.js arena, movement, AI, parcels, modes and match flow.
- `src/style.css`: responsive visual system and HUD.
- `src/crazygames.js`: SDK v3 wrapper, persistence fallback and ad lifecycle.

## Validation

GitHub Actions checks JavaScript syntax on every push. Browser playtesting and CrazyGames portal verification are still required before release.
