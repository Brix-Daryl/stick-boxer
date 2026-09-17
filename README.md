# Stick Boxer — AI-Assisted Web Game

A lightweight, responsive HTML5 canvas boxing game built for the Withcenter AI Content Creator evaluation.

## Project Overview
- **Game Concept**: A fast-paced tap-boxing reaction challenge featuring dynamic 2D canvas stickmen.
- **Controls**: Mouse click and mobile touch compatible (Left side = Punch / Attack, Right side = Guard / Defend).
- **Campaign**: Ten-round progression featuring distinct opponent archetypes: brawler, outfighter, counter-puncher, and slugger.
- **AI Skill Integration**: Configured and balanced using an `agentskills.io` archetype generator skill.

## Repository Structure
- `skills/`: Agent skill definitions, instruction refinement runs, and generated archetype parameters.
- `game/`: Web game source code (HTML5, Canvas API, vanilla JavaScript).

## Study of AI & Learning Notes

### 1. Working with the `agentskills.io` Standard
Rather than relying on vague, one-off prompts, I adopted structured agent specifications (`SKILL.md`) with explicit parameter constraints, execution workflows, and typed JSON schemas. This guarantees predictable, parseable configurations that plug directly into application logic.

### 2. Instruction Iteration & Refinement
- **Initial Run**: The first prompt generated qualitative descriptions ("Extremely Fast", "High Defense") that could not be parsed by game loops.
- **Refined Run**: Enforced strict numeric parameters (`telegraphDurationMs`, `attackCooldownMs`, `blockProbability`), ensuring fighters adhered to human mobile reaction thresholds (300ms–800ms).

### 3. Key Problem Solved During Development
- **The Issue**: Rapid tapping on mobile browsers caused standard click listeners to experience a ~300ms delay and triggered unwanted double-tap zoom behavior, interrupting gameplay.
- **The Fix**: 
  1. Applied `touch-action: manipulation;` and `user-select: none;` across the canvas and tap zones.
  2. Migrated input handling to unified Pointer Events (`pointerdown`) with `e.preventDefault()`, eliminating mobile tap latency across touchscreens and desktop mice.

## Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Brix-Daryl/stick-boxer.git
   cd stick-boxer/game
   ```

## License
- This project is licensed under the **PolyForm Noncommercial License 1.0.0**. You are free to view, clone, and run the code for personal, educational, and evaluation purposes. Commercial use or redistribution for profit is strictly prohibited.