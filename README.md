# FunBerry Kids 🍓

**Fun learning games for curious little minds!**

An educational games platform for kids aged 5-8, aligned with the ICSE Class 2 syllabus. Features an adventure-village world with 15 zones and 45+ mini-games covering Environmental Studies (EVS).

**Agents (Cursor, Codex, etc.):** read [`AGENTS.md`](AGENTS.md) before changing the product. It is the source of truth for what this site is, what it is not, and where to edit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Website | Next.js 15, Tailwind CSS, Framer Motion |
| Mobile App | React Native, Expo |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Payments | Stripe (web), RevenueCat (mobile) |
| Language | TypeScript |

## Project Structure

```
funberry/
├── apps/
│   ├── web/          # Next.js website (landing, dashboard, game player)
│   └── mobile/       # Expo React Native app (iOS + Android)
├── packages/
│   ├── config/       # Brand config, colors, zones, pricing
│   ├── ui/           # Shared kid-friendly UI components
│   ├── game-engine/  # Game templates, engine core, EVS game data
│   ├── supabase/     # DB client, types, hooks
│   └── assets/       # Images, sounds, Lottie files
└── supabase/         # Database migrations and seed data
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (for mobile)
- Supabase account (for backend)

### Setup

```bash
# 1. Install dependencies
cd funberry
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env with your Supabase credentials
# Get these from: https://supabase.com/dashboard

# 4. Run database migrations
# Apply files in supabase/migrations/ to your Supabase project

# 5. Start development
npm run dev:web      # Website at http://localhost:3000
npm run dev:mobile   # Expo mobile app
```

## Game Types

| Template | Description |
|----------|-------------|
| DragSort | Drag items into correct category buckets |
| MemoryMatch | Flip cards to find matching pairs |
| PictureQuiz | Choose the correct picture answer |
| SequenceBuilder | Arrange steps in the right order |
| OddOneOut | Find the item that doesn't belong |
| TrueFalse | Answer true or false statements |
| ColorActivity | Color regions with the right colors |
| WordPictureLink | Connect words to matching pictures |
| InteractiveStory | Story with choice-based progression |
| BubblePop | Pop the correct bubbles before time runs out |
| StarCatcher | Catch falling items with left/right controls |

## EVS Zones (15 total)

My Home, Village Square, The Farm, The River, Builder's Yard, The Wardrobe, Sky Park, Health Center, Town Walk, Magic Garden, Animal Park, The Station, Post Office, Star Tower, Clock Tower

## Renaming the App

The brand name lives in `packages/config/src/brand.ts`. Change it there and it propagates across the entire project.

## License

Proprietary. All rights reserved.
