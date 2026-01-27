import type { Board, Color, Piece, Position, Type } from "./types";

export interface BoardState { 
    initialState: Board;
}

export const canMove = (piece: Piece, state: Board) => {
    if(state.sideToMove !== piece.color) {
        return false;
    }
}

export const isEmptySquare = (pos: Position, { grid }: Board): boolean => {
    return grid[pos.row][pos.col] === null;
}

export const isWithinBoard = (pos: Position) => {
    return pos.col >= 0 && pos.col < 8 && pos.row >= 0 && pos.row < 8;
}

export const isLegalMove = (from: Position, to: Position, board: Board): boolean => {
    const { grid } = board;
    const piece = grid[from.row][from.col];
    const targetPiece = grid[to.row][to.col];
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    if(targetPiece?.color === piece?.color) {
        return false;
    }
    if(!piece) {
        return false;
    }
    if (!isWithinBoard(to) || !isWithinBoard(from)) {
        return false;
    }

    // check if didnt move
    if (dx === 0 && dy === 0) {
        return false;
    }
    switch (piece.type) {
        case 'pawn': {
            const firstMove = (piece.color === 'white' && from.row === 6) || (piece.color === 'black' && from.row === 1);
            if(targetPiece) {
                if(Math.abs(dx) === 1) {
                    if(piece.color === 'white') {
                        return dy === -1;
                    } else {
                        return dy === 1;
                    }
                }
                return false;
            }
            if(firstMove) {
                if(piece.color === 'white') {
                    if(dx === 0) {
                        if (dy === -1) return true;
                        if (dy === -2) {
                            const middleRow = from.row - 1;
                            return isEmptySquare({row: middleRow, col: from.col}, board);
                        }
                    }
                } else {
                    if(dx === 0) {
                        if (dy === 1) return true;
                        if (dy === 2) {
                            const middleRow = from.row + 1;
                            return isEmptySquare({row: middleRow, col: from.col}, board);
                        }
                    }
                }
            }
            if(piece.color === 'white') {
                return dx === 0 && dy === -1;
            } else {
                return dx === 0 && dy === 1;
            }
        }
        case 'rook': {
            const validRookMove = (dx === 0 && dy !== 0) || (dx !== 0 && dy === 0);
            if (!validRookMove) {
                return false;
            }
            if (!isPathClear(from, to, board)){
                return false;
            }
            return true;
        }
        case 'bishop': {
            const validBishopMove = Math.abs(dx) === Math.abs(dy);
            if (!validBishopMove) {
                return false;
            }
            if(!isPathClear(from, to, board)){
                return false;
            }
            return true;
        }
        case 'queen': {
            const validQueenMove = (dx === 0 && dy !== 0) || (dx !== 0 && dy === 0) || (Math.abs(dx) === Math.abs(dy));
            if (!validQueenMove) {
                return false;
            }
            if (!isPathClear(from, to, board)) {
                return false;
            }
            return true;
        }
        case 'king': {
            const validKingMove = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
            if (!validKingMove) {
                return false;
            }
            if(!isEmptySquare(to, board)) {
                return false;
            }
            return true;
        }
        case 'knight': {
            const validKnightMove = (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
            if (!validKnightMove) {
                return false;
            }
            return true;
        }
        default:
            return false;
    }
}

export const isPathClear = (from: Position, to: Position, board: Board) => {
    const dx = to.row - from.row;
    const dy = to.col - from.col;
    //move direction
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    //indexes to calculate clear cells
    let currentRow = from.row + stepX;
    let currentCol = from.col + stepY;
    while (currentCol !== to.col || currentRow !== to.row) {
        if(!isEmptySquare({row: currentRow, col: currentCol}, board)){
            return false;
        }
        currentCol += stepY;
        currentRow += stepX;
    }
    return true;
}

export const setDefaultLayout = (): Board => {
    const board: Board = {
        grid: Array(8).fill(null).map(() => Array(8).fill(null)),
        sideToMove: 'white',
        lastMove: null,
        selectedPiece: null,
        capturedPieces: [],
        moveHistory: [],
    }
    const { grid } = board;
    const backRank: Type[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    //white pieces
    for(let col = 0; col < grid.length; ++col){
        grid[7][col] = {
            color: 'white',
            type: backRank[col],
        }
        grid[6][col] = {
            color: 'white',
            type: 'pawn',
        }
    }
    //black pieces
    for(let col = 0; col < grid.length; ++col) {
        grid[0][col] = {
            color: 'black',
            type: backRank[col],
        }
        grid[1][col] = {
            color: 'black',
            type: 'pawn',
        }
    }
    return board;
}

export const printBoard = (board: Board) => {
  const pieceToSymbol: Record<Color, Record<Type, string>> = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };
  for (let row = 0; row < 8; row++) {
    let line = `${8 - row} `; // нумерация строк: 8,7,...,1
    for (let col = 0; col < 8; col++) {
      const cell = board.grid[row][col];
      if (cell) {
        line += ` ${pieceToSymbol[cell.color][cell.type]}`;
      } else {
        line += ' .';
      }
    }
    console.log(line);
  }
  console.log('   a b c d e f g h');
};