export interface ZoneConfig {
  id: string;
  name: string;
  emoji: string;
  evsTheme: string;
  description: string;
  colorKey: "berry" | "leaf" | "sky" | "sunshine";
  isFree: boolean;
  order: number;
  starsToUnlock: number;
  kind?: "curriculum";
  badge?: string;
  featured?: boolean;
}

export const zones: ZoneConfig[] = [
  {
    id: "about-me",
    name: "My Home",
    emoji: "👋",
    evsTheme: "About Me",
    description: "Learn about yourself — your body, senses, and feelings!",
    colorKey: "berry",
    isFree: true,
    order: 1,
    starsToUnlock: 0,
  },
  {
    id: "others-in-my-world",
    name: "Village Square",
    emoji: "👨‍👩‍👧‍👦",
    evsTheme: "Others in My World",
    description: "Meet the people around you — family, friends, and helpers!",
    colorKey: "sky",
    isFree: false,
    order: 2,
    starsToUnlock: 5,
  },
  {
    id: "food",
    name: "The Farm",
    emoji: "🍎",
    evsTheme: "My Needs – Food",
    description: "Discover where food comes from and what keeps you healthy!",
    colorKey: "berry",
    isFree: false,
    order: 3,
    starsToUnlock: 10,
  },
  {
    id: "water",
    name: "The River",
    emoji: "💧",
    evsTheme: "My Needs – Water",
    description: "Splash into learning about water and why we need it!",
    colorKey: "sky",
    isFree: false,
    order: 4,
    starsToUnlock: 15,
  },
  {
    id: "shelter",
    name: "Builder's Yard",
    emoji: "🏠",
    evsTheme: "My Need – Shelter",
    description: "Build and explore different types of homes and shelters!",
    colorKey: "sunshine",
    isFree: false,
    order: 5,
    starsToUnlock: 20,
  },
  {
    id: "clothing",
    name: "The Wardrobe",
    emoji: "👕",
    evsTheme: "My Need – Clothing",
    description: "Dress up for every season and learn about fabrics!",
    colorKey: "berry",
    isFree: false,
    order: 6,
    starsToUnlock: 25,
  },
  {
    id: "air",
    name: "Sky Park",
    emoji: "🌬️",
    evsTheme: "My Need – Air",
    description: "Feel the breeze and learn why air is so important!",
    colorKey: "sky",
    isFree: false,
    order: 7,
    starsToUnlock: 30,
  },
  {
    id: "health-safety",
    name: "Health Center",
    emoji: "🏥",
    evsTheme: "Keeping Oneself Clean, Safe and Healthy",
    description: "Learn good habits that keep you strong and safe!",
    colorKey: "leaf",
    isFree: false,
    order: 8,
    starsToUnlock: 35,
  },
  {
    id: "neighbourhood",
    name: "Town Walk",
    emoji: "🏘️",
    evsTheme: "Places in the Neighbourhood",
    description: "Take a walk and discover places around your town!",
    colorKey: "sunshine",
    isFree: false,
    order: 9,
    starsToUnlock: 40,
  },
  {
    id: "plants",
    name: "Magic Garden",
    emoji: "🌱",
    evsTheme: "Plants",
    description: "Grow, explore, and learn all about the wonderful world of plants!",
    colorKey: "leaf",
    isFree: true,
    order: 10,
    starsToUnlock: 0,
  },
  {
    id: "animals",
    name: "Animal Park",
    emoji: "🐾",
    evsTheme: "Animals",
    description: "Meet amazing animals — pets, wild animals, and their babies!",
    colorKey: "sunshine",
    isFree: true,
    order: 11,
    starsToUnlock: 0,
  },
  {
    id: "transport",
    name: "The Station",
    emoji: "🚂",
    evsTheme: "Transport",
    description: "Hop on board and learn about land, water, and air transport!",
    colorKey: "sky",
    isFree: false,
    order: 12,
    starsToUnlock: 50,
  },
  {
    id: "communication",
    name: "Post Office",
    emoji: "📬",
    evsTheme: "Communication",
    description: "Send messages and learn how people talk to each other!",
    colorKey: "berry",
    isFree: false,
    order: 13,
    starsToUnlock: 55,
  },
  {
    id: "sun-moon-stars",
    name: "Star Tower",
    emoji: "⭐",
    evsTheme: "The World Around Me: Sun, Moon, Sky and Stars",
    description: "Look up at the sky and explore the sun, moon, and stars!",
    colorKey: "sunshine",
    isFree: false,
    order: 14,
    starsToUnlock: 60,
  },
  {
    id: "time-space-direction",
    name: "Clock Tower",
    emoji: "🕐",
    evsTheme: "Time, Space, Direction",
    description: "Tell time, find directions, and learn about space around you!",
    colorKey: "leaf",
    isFree: false,
    order: 15,
    starsToUnlock: 65,
  },
  {
    id: "computers",
    name: "Computer Lab",
    emoji: "💻",
    evsTheme: "Computer Studies",
    description: "Train with devices, the IPO cycle, storage, and smart AI helpers!",
    colorKey: "sky",
    isFree: true,
    order: 16,
    starsToUnlock: 0,
    kind: "curriculum",
    badge: "NEW",
    featured: true,
  },
];

export const freeZoneIds = zones
  .filter((z) => z.isFree)
  .map((z) => z.id);

export const getZoneById = (id: string) =>
  zones.find((z) => z.id === id);
