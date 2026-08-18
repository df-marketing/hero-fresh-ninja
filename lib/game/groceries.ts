export type GroceryDefinition = {
  id: string;
  label: string;
  emoji: string;
  points: number;
  danger?: boolean;
};

export const GROCERIES: GroceryDefinition[] = [
  { id: "rambutan", label: "Rambutan", emoji: "🔴", points: 10 },
  { id: "manggis", label: "Manggis", emoji: "🟣", points: 15 },
  { id: "durian", label: "Durian", emoji: "🟢", points: 25 },
  { id: "pisang", label: "Pisang", emoji: "🍌", points: 5 },
  { id: "tomato", label: "Tomato", emoji: "🍅", points: 5 },
  { id: "cili", label: "Cili", emoji: "🌶️", points: 10 },
  { id: "buah-busuk", label: "Buah busuk", emoji: "💣", points: 0, danger: true },
];

export const GAME_SECONDS = 60;
export const STARTING_LIVES = 3;
