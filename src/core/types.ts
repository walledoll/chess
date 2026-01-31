export type Color = 'black' | 'white';

export type Type = 'bishop' | 'knight' | 'pawn' | 'king' | 'queen' | 'rook';

export interface Piece  {
  color: Color;
  type: Type;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
}

export interface Board {
  grid: (Piece | null)[][];
  sideToMove: Color;
  lastMove: Move | null;
  moveHistory: (Move | null)[];
  capturedPieces: (Piece | null)[];
  selectedPiece: Piece | null;
}

