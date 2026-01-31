import { describe, it, expect, beforeEach } from 'vitest';
import {
  isEmptySquare,
  isWithinBoard,
  isPathClear,
  findKing,
  canEnPassant,
  isLegalMove,
  isSquareAttacked,
  isInCheck,
  isInCheckmate,
  isInStalemate,
  canCastle,
  move,
  setDefaultLayout,
  getPieceSymbol,
  getGameStatus,
  getPossibleMoves,
  getAllLegalMoves,
  clearSquare,
  setSquare,
} from './board';
import type { Board, Position, Piece } from './types';

describe('Board Utility Functions', () => {
  describe('isEmptySquare', () => {
    let board: Board;

    beforeEach(() => {
      board = setDefaultLayout();
    });

    it('should return true for an empty square', () => {
      const pos: Position = { row: 3, col: 3 };
      expect(isEmptySquare(pos, board)).toBe(true);
    });

    it('should return false for a square with a piece', () => {
      const pos: Position = { row: 0, col: 0 };
      expect(isEmptySquare(pos, board)).toBe(false);
    });

    it('should return true for all middle squares in default layout', () => {
      for (let row = 2; row <= 5; row++) {
        for (let col = 0; col < 8; col++) {
          expect(isEmptySquare({ row, col }, board)).toBe(true);
        }
      }
    });
  });

  describe('isWithinBoard', () => {
    it('should return true for valid positions', () => {
      expect(isWithinBoard({ row: 0, col: 0 })).toBe(true);
      expect(isWithinBoard({ row: 7, col: 7 })).toBe(true);
      expect(isWithinBoard({ row: 4, col: 4 })).toBe(true);
    });

    it('should return false for positions outside the board', () => {
      expect(isWithinBoard({ row: -1, col: 0 })).toBe(false);
      expect(isWithinBoard({ row: 0, col: -1 })).toBe(false);
      expect(isWithinBoard({ row: 8, col: 0 })).toBe(false);
      expect(isWithinBoard({ row: 0, col: 8 })).toBe(false);
      expect(isWithinBoard({ row: -1, col: -1 })).toBe(false);
      expect(isWithinBoard({ row: 10, col: 10 })).toBe(false);
    });
  });

  describe('isPathClear', () => {
    let board: Board;

    beforeEach(() => {
      board = setDefaultLayout();
    });

    it('should return true for a clear horizontal path', () => {
      const from: Position = { row: 3, col: 0 };
      const to: Position = { row: 3, col: 7 };
      expect(isPathClear(from, to, board)).toBe(true);
    });

    it('should return true for a clear vertical path', () => {
      const from: Position = { row: 2, col: 0 };
      const to: Position = { row: 5, col: 0 };
      expect(isPathClear(from, to, board)).toBe(true);
    });

    it('should return true for a clear diagonal path', () => {
      const from: Position = { row: 2, col: 2 };
      const to: Position = { row: 5, col: 5 };
      expect(isPathClear(from, to, board)).toBe(true);
    });

    it('should return false when path is blocked horizontally', () => {
      const from: Position = { row: 0, col: 0 };
      const to: Position = { row: 0, col: 7 };
      expect(isPathClear(from, to, board)).toBe(false);
    });

    it('should return false when path is blocked vertically', () => {
      const from: Position = { row: 0, col: 0 };
      const to: Position = { row: 7, col: 0 };
      expect(isPathClear(from, to, board)).toBe(false);
    });

    it('should return true when diagonal path is clear after removing pieces', () => {
      // Clear the path completely
      board.grid[1][3] = null; // Remove black pawn
      const validFrom: Position = { row: 0, col: 2 };
      const validTo: Position = { row: 2, col: 4 };
      expect(isPathClear(validFrom, validTo, board)).toBe(true);
    });
  });

  describe('findKing', () => {
    let board: Board;

    beforeEach(() => {
      board = setDefaultLayout();
    });

    it('should find white king in default position', () => {
      const kingPos = findKing(board, 'white');
      expect(kingPos).toEqual({ row: 7, col: 4 });
    });

    it('should find black king in default position', () => {
      const kingPos = findKing(board, 'black');
      expect(kingPos).toEqual({ row: 0, col: 4 });
    });

    it('should return null when king is not on the board', () => {
      board.grid[7][4] = null; // Remove white king
      const kingPos = findKing(board, 'white');
      expect(kingPos).toBeNull();
    });

    it('should find king after it has moved', () => {
      board.grid[7][4] = null;
      board.grid[7][5] = { color: 'white', type: 'king', hasMoved: true };
      const kingPos = findKing(board, 'white');
      expect(kingPos).toEqual({ row: 7, col: 5 });
    });
  });

  describe('clearSquare and setSquare', () => {
    let board: Board;

    beforeEach(() => {
      board = setDefaultLayout();
    });

    it('should clear a square', () => {
      const pos: Position = { row: 0, col: 0 };
      clearSquare(pos, board.grid);
      expect(board.grid[0][0]).toBeNull();
    });

    it('should set a piece on a square', () => {
      const pos: Position = { row: 3, col: 3 };
      const piece: Piece = { color: 'white', type: 'queen', hasMoved: false };
      setSquare(pos, piece, board.grid);
      expect(board.grid[3][3]).toEqual(piece);
    });

    it('should not set null piece', () => {
      const pos: Position = { row: 3, col: 3 };
      board.grid[3][3] = { color: 'white', type: 'pawn', hasMoved: false };
      setSquare(pos, null, board.grid);
      expect(board.grid[3][3]).not.toBeNull();
    });
  });
});

describe('Pawn Movement', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should allow white pawn to move forward one square', () => {
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 5, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(true);
  });

  it('should allow black pawn to move forward one square', () => {
    const from: Position = { row: 1, col: 0 };
    const to: Position = { row: 2, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(true);
  });

  it('should allow white pawn to move two squares from start', () => {
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 4, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(true);
  });

  it('should allow black pawn to move two squares from start', () => {
    const from: Position = { row: 1, col: 0 };
    const to: Position = { row: 3, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(true);
  });

  it('should not allow pawn to move two squares after first move', () => {
    board.grid[5][0] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[6][0] = null;
    const from: Position = { row: 5, col: 0 };
    const to: Position = { row: 3, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(false);
  });

  it('should not allow pawn to move backward', () => {
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 7, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(false);
  });

  it('should not allow pawn to move sideways', () => {
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 6, col: 1 };
    expect(isLegalMove(from, to, board)).toBe(false);
  });

  it('should allow pawn to capture diagonally', () => {
    board.grid[5][1] = { color: 'black', type: 'pawn', hasMoved: false };
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 5, col: 1 };
    expect(isLegalMove(from, to, board)).toBe(true);
  });

  it('should not allow pawn to capture forward', () => {
    board.grid[5][0] = { color: 'black', type: 'pawn', hasMoved: false };
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 5, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(false);
  });

  it('should not allow pawn to move forward if blocked', () => {
    board.grid[5][0] = { color: 'black', type: 'pawn', hasMoved: false };
    const from: Position = { row: 6, col: 0 };
    const to: Position = { row: 4, col: 0 };
    expect(isLegalMove(from, to, board)).toBe(false);
  });
});

describe('En Passant', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should allow en passant capture for white', () => {
    // Setup: white pawn on rank 3, black pawn moves two squares next to it
    board.grid[3][4] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[6][4] = null;
    board.grid[1][5] = null;
    board.grid[3][5] = { color: 'black', type: 'pawn', hasMoved: true };
    board.lastMove = {
      from: { row: 1, col: 5 },
      to: { row: 3, col: 5 },
      piece: { color: 'black', type: 'pawn', hasMoved: true },
    };

    const from: Position = { row: 3, col: 4 };
    const to: Position = { row: 2, col: 5 };
    expect(canEnPassant(from, to, board)).toBe(true);
  });

  it('should allow en passant capture for black', () => {
    // Setup: black pawn on rank 4, white pawn moves two squares next to it
    board.grid[4][4] = { color: 'black', type: 'pawn', hasMoved: true };
    board.grid[1][4] = null;
    board.grid[6][5] = null;
    board.grid[4][5] = { color: 'white', type: 'pawn', hasMoved: true };
    board.lastMove = {
      from: { row: 6, col: 5 },
      to: { row: 4, col: 5 },
      piece: { color: 'white', type: 'pawn', hasMoved: true },
    };

    const from: Position = { row: 4, col: 4 };
    const to: Position = { row: 5, col: 5 };
    expect(canEnPassant(from, to, board)).toBe(true);
  });

  it('should not allow en passant if last move was not a pawn', () => {
    board.grid[3][4] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[3][5] = { color: 'black', type: 'knight', hasMoved: true };
    board.lastMove = {
      from: { row: 1, col: 5 },
      to: { row: 3, col: 5 },
      piece: { color: 'black', type: 'knight', hasMoved: true },
    };

    const from: Position = { row: 3, col: 4 };
    const to: Position = { row: 2, col: 5 };
    expect(canEnPassant(from, to, board)).toBe(false);
  });

  it('should not allow en passant if last move was only one square', () => {
    board.grid[3][4] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[3][5] = { color: 'black', type: 'pawn', hasMoved: true };
    board.lastMove = {
      from: { row: 2, col: 5 },
      to: { row: 3, col: 5 },
      piece: { color: 'black', type: 'pawn', hasMoved: true },
    };

    const from: Position = { row: 3, col: 4 };
    const to: Position = { row: 2, col: 5 };
    expect(canEnPassant(from, to, board)).toBe(false);
  });

  it('should not allow en passant if pawn is not on correct rank', () => {
    board.grid[4][4] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[4][5] = { color: 'black', type: 'pawn', hasMoved: true };
    board.lastMove = {
      from: { row: 2, col: 5 },
      to: { row: 4, col: 5 },
      piece: { color: 'black', type: 'pawn', hasMoved: true },
    };

    const from: Position = { row: 4, col: 4 };
    const to: Position = { row: 3, col: 5 };
    expect(canEnPassant(from, to, board)).toBe(false);
  });
});

describe('Piece Movement', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  describe('Rook Movement', () => {
    it('should allow rook to move horizontally', () => {
      board.grid[3][0] = { color: 'white', type: 'rook', hasMoved: false };
      const from: Position = { row: 3, col: 0 };
      const to: Position = { row: 3, col: 7 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should allow rook to move vertically', () => {
      board.grid[3][0] = { color: 'white', type: 'rook', hasMoved: false };
      const from: Position = { row: 3, col: 0 };
      const to: Position = { row: 5, col: 0 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should not allow rook to move diagonally', () => {
      board.grid[3][3] = { color: 'white', type: 'rook', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 5, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });

    it('should not allow rook to jump over pieces', () => {
      const from: Position = { row: 7, col: 0 };
      const to: Position = { row: 7, col: 7 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });
  });

  describe('Bishop Movement', () => {
    it('should allow bishop to move diagonally', () => {
      board.grid[3][3] = { color: 'white', type: 'bishop', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 5, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should not allow bishop to move horizontally', () => {
      board.grid[3][3] = { color: 'white', type: 'bishop', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 3, col: 7 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });

    it('should not allow bishop to move vertically', () => {
      board.grid[3][3] = { color: 'white', type: 'bishop', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 7, col: 3 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });

    it('should not allow bishop to jump over pieces', () => {
      const from: Position = { row: 7, col: 2 };
      const to: Position = { row: 3, col: 6 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });
  });

  describe('Queen Movement', () => {
    it('should allow queen to move horizontally', () => {
      board.grid[3][3] = { color: 'white', type: 'queen', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 3, col: 7 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should allow queen to move vertically', () => {
      board.grid[3][3] = { color: 'white', type: 'queen', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 5, col: 3 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should allow queen to move diagonally', () => {
      board.grid[3][3] = { color: 'white', type: 'queen', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 5, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should not allow queen to jump over pieces', () => {
      const from: Position = { row: 7, col: 3 };
      const to: Position = { row: 3, col: 3 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });
  });

  describe('King Movement', () => {
    it('should allow king to move one square in any direction', () => {
      board.grid[3][3] = { color: 'white', type: 'king', hasMoved: false };
      board.grid[7][4] = null; // Remove original king
      const from: Position = { row: 3, col: 3 };

      const validDirections = [
        { row: 2, col: 3 }, // up
        { row: 4, col: 3 }, // down
        { row: 3, col: 2 }, // left
        { row: 3, col: 4 }, // right
        { row: 2, col: 2 }, // up-left
        { row: 2, col: 4 }, // up-right
        { row: 4, col: 2 }, // down-left
        { row: 4, col: 4 }, // down-right
      ];

      validDirections.forEach(to => {
        expect(isLegalMove(from, to, board)).toBe(true);
      });
    });

    it('should not allow king to move more than one square', () => {
      board.grid[3][3] = { color: 'white', type: 'king', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 3, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });
  });

  describe('Knight Movement', () => {
    it('should allow knight to move in L-shape', () => {
      const from: Position = { row: 7, col: 1 };
      const to: Position = { row: 5, col: 2 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should allow knight to jump over pieces', () => {
      const from: Position = { row: 7, col: 1 };
      const to: Position = { row: 5, col: 0 };
      expect(isLegalMove(from, to, board)).toBe(true);
    });

    it('should not allow knight to move like a rook', () => {
      board.grid[3][3] = { color: 'white', type: 'knight', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 3, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });

    it('should not allow knight to move like a bishop', () => {
      board.grid[3][3] = { color: 'white', type: 'knight', hasMoved: false };
      const from: Position = { row: 3, col: 3 };
      const to: Position = { row: 5, col: 5 };
      expect(isLegalMove(from, to, board)).toBe(false);
    });
  });
});

describe('Check and Checkmate', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  describe('isSquareAttacked', () => {
    it('should detect when a square is attacked by a pawn', () => {
      const pos: Position = { row: 5, col: 1 };
      expect(isSquareAttacked(pos, board, 'white')).toBe(true);
    });

    it('should detect when a square is not attacked', () => {
      const pos: Position = { row: 3, col: 3 };
      expect(isSquareAttacked(pos, board, 'white')).toBe(false);
    });

    it('should detect when a square is attacked by a knight', () => {
      const pos: Position = { row: 5, col: 0 };
      expect(isSquareAttacked(pos, board, 'white')).toBe(true);
    });
  });

  describe('isInCheck', () => {
    it('should detect when king is in check', () => {
      // Clear pieces and set up check
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[0][4] = { color: 'black', type: 'king', hasMoved: false };
      board.grid[3][4] = { color: 'white', type: 'rook', hasMoved: false };

      expect(isInCheck(board, 'black')).toBe(true);
    });

    it('should return false when king is not in check', () => {
      expect(isInCheck(board, 'white')).toBe(false);
      expect(isInCheck(board, 'black')).toBe(false);
    });

    it('should detect check from a knight', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[4][4] = { color: 'white', type: 'king', hasMoved: false };
      board.grid[2][3] = { color: 'black', type: 'knight', hasMoved: false };

      expect(isInCheck(board, 'white')).toBe(true);
    });
  });

  describe('isInCheckmate', () => {
    it('should detect back rank checkmate', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[7][4] = { color: 'white', type: 'king', hasMoved: false };
      board.grid[7][3] = { color: 'white', type: 'pawn', hasMoved: false };
      board.grid[7][5] = { color: 'white', type: 'pawn', hasMoved: false };
      board.grid[6][4] = { color: 'white', type: 'pawn', hasMoved: false };
      board.grid[0][4] = { color: 'black', type: 'rook', hasMoved: false };

      board.sideToMove = 'white';
      expect(isInCheckmate(board, 'white')).toBe(true);
    });

    it('should return false when not in checkmate', () => {
      expect(isInCheckmate(board, 'white')).toBe(false);
      expect(isInCheckmate(board, 'black')).toBe(false);
    });

    it('should return false when in check but can escape', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[0][4] = { color: 'black', type: 'king', hasMoved: false };
      board.grid[3][4] = { color: 'white', type: 'rook', hasMoved: false };

      expect(isInCheckmate(board, 'black')).toBe(false);
    });
  });

  describe('isInStalemate', () => {
    it('should detect stalemate', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[0][0] = { color: 'black', type: 'king', hasMoved: false };
      board.grid[1][2] = { color: 'white', type: 'queen', hasMoved: false };
      board.grid[2][1] = { color: 'white', type: 'king', hasMoved: false };

      board.sideToMove = 'black';
      expect(isInStalemate(board, 'black')).toBe(true);
    });

    it('should return false when not in stalemate', () => {
      expect(isInStalemate(board, 'white')).toBe(false);
      expect(isInStalemate(board, 'black')).toBe(false);
    });

    it('should return false when in check', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[0][4] = { color: 'black', type: 'king', hasMoved: false };
      board.grid[3][4] = { color: 'white', type: 'rook', hasMoved: false };

      expect(isInStalemate(board, 'black')).toBe(false);
    });
  });
});

describe('Castling', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  describe('canCastle', () => {
    it('should allow kingside castling for white when conditions are met', () => {
      // Clear pieces between king and rook
      board.grid[7][5] = null;
      board.grid[7][6] = null;

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(true);
      expect(result.side).toBe('kingside');
    });

    it('should allow queenside castling for white when conditions are met', () => {
      board.grid[7][1] = null;
      board.grid[7][2] = null;
      board.grid[7][3] = null;

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 2 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(true);
      expect(result.side).toBe('queenside');
    });

    it('should not allow castling if king has moved', () => {
      board.grid[7][5] = null;
      board.grid[7][6] = null;
      board.grid[7][4] = { color: 'white', type: 'king', hasMoved: true };

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(false);
    });

    it('should not allow castling if rook has moved', () => {
      board.grid[7][5] = null;
      board.grid[7][6] = null;
      board.grid[7][7] = { color: 'white', type: 'rook', hasMoved: true };

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(false);
    });

    it('should not allow castling through attacked square', () => {
      board.grid[7][5] = null;
      board.grid[7][6] = null;
      // Place a black rook attacking f1 (row 7, col 5)
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[7][4] = { color: 'white', type: 'king', hasMoved: false };
      board.grid[7][7] = { color: 'white', type: 'rook', hasMoved: false };
      board.grid[0][5] = { color: 'black', type: 'rook', hasMoved: false };

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(false);
    });

    it('should not allow castling when in check', () => {
      board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      board.grid[7][4] = { color: 'white', type: 'king', hasMoved: false };
      board.grid[7][7] = { color: 'white', type: 'rook', hasMoved: false };
      board.grid[0][4] = { color: 'black', type: 'rook', hasMoved: false };

      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(false);
    });

    it('should not allow castling if path is blocked', () => {
      const from: Position = { row: 7, col: 4 };
      const to: Position = { row: 7, col: 6 };
      const result = canCastle(from, to, board);

      expect(result.isValid).toBe(false);
    });
  });
});

describe('Move Function', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should execute a valid move', () => {
    const from: Position = { row: 6, col: 4 };
    const to: Position = { row: 4, col: 4 };
    const newBoard = move(from, to, board);

    expect(newBoard).not.toBeNull();
    expect(newBoard?.grid[4][4]).toEqual({
      color: 'white',
      type: 'pawn',
      hasMoved: true,
    });
    expect(newBoard?.grid[6][4]).toBeNull();
  });

  it('should return null for invalid move', () => {
    const from: Position = { row: 6, col: 4 };
    const to: Position = { row: 3, col: 4 };
    const newBoard = move(from, to, board);

    expect(newBoard).toBeNull();
  });

  it('should switch side to move after valid move', () => {
    const from: Position = { row: 6, col: 4 };
    const to: Position = { row: 4, col: 4 };
    const newBoard = move(from, to, board);

    expect(newBoard?.sideToMove).toBe('black');
  });

  it('should not allow moving opponent\'s piece', () => {
    const from: Position = { row: 1, col: 0 };
    const to: Position = { row: 2, col: 0 };
    const newBoard = move(from, to, board);

    expect(newBoard).toBeNull();
  });

  it('should update move history', () => {
    const from: Position = { row: 6, col: 4 };
    const to: Position = { row: 4, col: 4 };
    const newBoard = move(from, to, board);

    expect(newBoard?.moveHistory.length).toBe(1);
    expect(newBoard?.moveHistory[0]).toEqual({
      from,
      to,
      piece: { color: 'white', type: 'pawn', hasMoved: true },
    });
  });

  it('should capture opponent piece', () => {
    board.grid[4][4] = { color: 'black', type: 'pawn', hasMoved: false };
    board.grid[5][5] = { color: 'white', type: 'pawn', hasMoved: true };

    const from: Position = { row: 5, col: 5 };
    const to: Position = { row: 4, col: 4 };
    const newBoard = move(from, to, board);

    expect(newBoard?.capturedPieces.length).toBe(1);
    expect(newBoard?.capturedPieces[0]).toEqual({
      color: 'black',
      type: 'pawn',
      hasMoved: false,
    });
  });

  it('should execute castling move', () => {
    board.grid[7][5] = null;
    board.grid[7][6] = null;

    const from: Position = { row: 7, col: 4 };
    const to: Position = { row: 7, col: 6 };
    const newBoard = move(from, to, board);

    expect(newBoard).not.toBeNull();
    expect(newBoard?.grid[7][6]?.type).toBe('king');
    expect(newBoard?.grid[7][5]?.type).toBe('rook');
    expect(newBoard?.grid[7][4]).toBeNull();
    expect(newBoard?.grid[7][7]).toBeNull();
  });

  it('should execute en passant capture', () => {
    // Setup for en passant
    board.grid[3][4] = { color: 'white', type: 'pawn', hasMoved: true };
    board.grid[6][4] = null;
    board.grid[1][5] = null;
    board.grid[3][5] = { color: 'black', type: 'pawn', hasMoved: true };
    board.lastMove = {
      from: { row: 1, col: 5 },
      to: { row: 3, col: 5 },
      piece: { color: 'black', type: 'pawn', hasMoved: true },
    };
    board.sideToMove = 'white';

    const from: Position = { row: 3, col: 4 };
    const to: Position = { row: 2, col: 5 };
    const newBoard = move(from, to, board);

    expect(newBoard).not.toBeNull();
    expect(newBoard?.grid[2][5]?.type).toBe('pawn');
    expect(newBoard?.grid[3][5]).toBeNull();
    expect(newBoard?.capturedPieces.length).toBe(1);
  });
});

describe('Game Status', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should return correct status for initial position', () => {
    const status = getGameStatus(board);

    expect(status.isCheck).toBe(false);
    expect(status.isCheckmate).toBe(false);
    expect(status.isStalemate).toBe(false);
    expect(status.isDraw).toBe(false);
    expect(status.winner).toBeNull();
  });

  it('should detect check status', () => {
    board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    board.grid[0][4] = { color: 'black', type: 'king', hasMoved: false };
    board.grid[3][4] = { color: 'white', type: 'rook', hasMoved: false };
    board.sideToMove = 'black';

    const status = getGameStatus(board);

    expect(status.isCheck).toBe(true);
    expect(status.isCheckmate).toBe(false);
  });

  it('should detect checkmate status', () => {
    board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    board.grid[7][4] = { color: 'white', type: 'king', hasMoved: false };
    board.grid[7][3] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[7][5] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[6][4] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[0][4] = { color: 'black', type: 'rook', hasMoved: false };
    board.sideToMove = 'white';

    const status = getGameStatus(board);

    expect(status.isCheck).toBe(true);
    expect(status.isCheckmate).toBe(true);
    expect(status.winner).toBe('black');
  });

  it('should detect stalemate status', () => {
    board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    board.grid[0][0] = { color: 'black', type: 'king', hasMoved: false };
    board.grid[1][2] = { color: 'white', type: 'queen', hasMoved: false };
    board.grid[2][1] = { color: 'white', type: 'king', hasMoved: false };
    board.sideToMove = 'black';

    const status = getGameStatus(board);

    expect(status.isStalemate).toBe(true);
    expect(status.isDraw).toBe(true);
    expect(status.winner).toBeNull();
  });
});

describe('Possible Moves', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should return possible moves for a pawn', () => {
    const pos: Position = { row: 6, col: 4 };
    const moves = getPossibleMoves(pos, board);

    expect(moves).toContainEqual({ row: 5, col: 4 });
    expect(moves).toContainEqual({ row: 4, col: 4 });
    expect(moves.length).toBe(2);
  });

  it('should return possible moves for a knight', () => {
    const pos: Position = { row: 7, col: 1 };
    const moves = getPossibleMoves(pos, board);

    expect(moves).toContainEqual({ row: 5, col: 0 });
    expect(moves).toContainEqual({ row: 5, col: 2 });
    expect(moves.length).toBe(2);
  });

  it('should return empty array for piece with no legal moves', () => {
    const pos: Position = { row: 7, col: 0 }; // Rook trapped
    const moves = getPossibleMoves(pos, board);

    expect(moves.length).toBe(0);
  });

  it('should include castling in king\'s possible moves', () => {
    board.grid[7][5] = null;
    board.grid[7][6] = null;

    const pos: Position = { row: 7, col: 4 };
    const moves = getPossibleMoves(pos, board);

    expect(moves).toContainEqual({ row: 7, col: 6 });
  });
});

describe('Get All Legal Moves', () => {
  let board: Board;

  beforeEach(() => {
    board = setDefaultLayout();
  });

  it('should return all legal moves for white at start', () => {
    const moves = getAllLegalMoves(board, 'white');

    expect(moves.length).toBe(20); // 16 pawn moves + 4 knight moves
  });

  it('should return all legal moves for black at start', () => {
    const moves = getAllLegalMoves(board, 'black');

    expect(moves.length).toBe(20); // 16 pawn moves + 4 knight moves
  });

  it('should return empty array when in checkmate', () => {
    board.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    board.grid[7][4] = { color: 'white', type: 'king', hasMoved: false };
    board.grid[7][3] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[7][5] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[6][4] = { color: 'white', type: 'pawn', hasMoved: false };
    board.grid[0][4] = { color: 'black', type: 'rook', hasMoved: false };
    board.sideToMove = 'white';

    const moves = getAllLegalMoves(board, 'white');

    expect(moves.length).toBe(0);
  });
});

describe('Get Piece Symbol', () => {
  it('should return correct symbol for white pieces', () => {
    expect(getPieceSymbol({ color: 'white', type: 'king', hasMoved: false })).toBe('♔');
    expect(getPieceSymbol({ color: 'white', type: 'queen', hasMoved: false })).toBe('♕');
    expect(getPieceSymbol({ color: 'white', type: 'rook', hasMoved: false })).toBe('♖');
    expect(getPieceSymbol({ color: 'white', type: 'bishop', hasMoved: false })).toBe('♗');
    expect(getPieceSymbol({ color: 'white', type: 'knight', hasMoved: false })).toBe('♘');
    expect(getPieceSymbol({ color: 'white', type: 'pawn', hasMoved: false })).toBe('♙');
  });

  it('should return correct symbol for black pieces', () => {
    expect(getPieceSymbol({ color: 'black', type: 'king', hasMoved: false })).toBe('♚');
    expect(getPieceSymbol({ color: 'black', type: 'queen', hasMoved: false })).toBe('♛');
    expect(getPieceSymbol({ color: 'black', type: 'rook', hasMoved: false })).toBe('♜');
    expect(getPieceSymbol({ color: 'black', type: 'bishop', hasMoved: false })).toBe('♝');
    expect(getPieceSymbol({ color: 'black', type: 'knight', hasMoved: false })).toBe('♞');
    expect(getPieceSymbol({ color: 'black', type: 'pawn', hasMoved: false })).toBe('♟');
  });
});

describe('Default Layout', () => {
  it('should set up the board correctly', () => {
    const board = setDefaultLayout();

    // Check white pieces
    expect(board.grid[7][0]?.type).toBe('rook');
    expect(board.grid[7][1]?.type).toBe('knight');
    expect(board.grid[7][2]?.type).toBe('bishop');
    expect(board.grid[7][3]?.type).toBe('queen');
    expect(board.grid[7][4]?.type).toBe('king');
    expect(board.grid[7][5]?.type).toBe('bishop');
    expect(board.grid[7][6]?.type).toBe('knight');
    expect(board.grid[7][7]?.type).toBe('rook');

    // Check white pawns
    for (let col = 0; col < 8; col++) {
      expect(board.grid[6][col]?.type).toBe('pawn');
      expect(board.grid[6][col]?.color).toBe('white');
    }

    // Check black pieces
    expect(board.grid[0][0]?.type).toBe('rook');
    expect(board.grid[0][1]?.type).toBe('knight');
    expect(board.grid[0][2]?.type).toBe('bishop');
    expect(board.grid[0][3]?.type).toBe('queen');
    expect(board.grid[0][4]?.type).toBe('king');

    // Check black pawns
    for (let col = 0; col < 8; col++) {
      expect(board.grid[1][col]?.type).toBe('pawn');
      expect(board.grid[1][col]?.color).toBe('black');
    }

    // Check empty squares
    for (let row = 2; row <= 5; row++) {
      for (let col = 0; col < 8; col++) {
        expect(board.grid[row][col]).toBeNull();
      }
    }

    // Check initial state
    expect(board.sideToMove).toBe('white');
    expect(board.lastMove).toBeNull();
    expect(board.capturedPieces).toEqual([]);
    expect(board.moveHistory).toEqual([]);
  });
});