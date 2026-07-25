export type Position = {
  row: number;
  col: number;
};

export type PlayerId = "p1" | "p2";

export type GameState = {
  positions: Record<PlayerId, Position>;
  turn: PlayerId;
};
