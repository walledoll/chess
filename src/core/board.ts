import type { Board, Color, Piece, Position, Type, Move } from "./types";

const BOARD_SIZE = 8;
const WHITE_PAWN_START_ROW = 6;
const BLACK_PAWN_START_ROW = 1;
const WHITE_BACK_RANK = 7;
const BLACK_BACK_RANK = 0;
const WHITE_EN_PASSANT_RANK = 3;
const BLACK_EN_PASSANT_RANK = 4;

export const isEmptySquare = (pos: Position, { grid }: Board): boolean => {
    return grid[pos.row][pos.col] === null;
};

export const isWithinBoard = (pos: Position): boolean => {
    return pos.col >= 0 && pos.col < BOARD_SIZE && pos.row >= 0 && pos.row < BOARD_SIZE;
};

export const isPathClear = (from: Position, to: Position, board: Board): boolean => {
    const dx = to.row - from.row;
    const dy = to.col - from.col;
    
    // Get direction of movement
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    
    // Check each square between from and to (exclusive)
    let currentRow = from.row + stepX;
    let currentCol = from.col + stepY;
    
    while (currentCol !== to.col || currentRow !== to.row) {
        if (!isEmptySquare({ row: currentRow, col: currentCol }, board)) {
            return false;
        }
        currentCol += stepY;
        currentRow += stepX;
    }
    return true;
};

export const findKing = (board: Board, color: Color): Position | null => {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board.grid[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                return { row, col };
            }
        }
    }
    return null;
};

export const canEnPassant = (from: Position, to: Position, board: Board): boolean => {
    const piece = board.grid[from.row][from.col];
    const { lastMove } = board;
    
    if (!piece || piece.type !== 'pawn' || !lastMove) {
        return false;
    }

    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const direction = piece.color === 'white' ? -1 : 1;
    const enPassantRank = piece.color === 'white' ? WHITE_EN_PASSANT_RANK : BLACK_EN_PASSANT_RANK;

    // Must be on the correct rank for en passant
    if (from.row !== enPassantRank) {
        return false;
    }

    // Must be diagonal move by one square
    if (Math.abs(dx) !== 1 || dy !== direction) {
        return false;
    }

    // Target square must be empty
    if (!isEmptySquare(to, board)) {
        return false;
    }

    // Last move must be an enemy pawn moving two squares
    const lastMovePiece = lastMove.piece;
    if (lastMovePiece.type !== 'pawn' || lastMovePiece.color === piece.color) {
        return false;
    }

    // Enemy pawn must have moved 2 squares forward
    const lastMoveDistance = Math.abs(lastMove.to.row - lastMove.from.row);
    if (lastMoveDistance !== 2) {
        return false;
    }

    // Enemy pawn must be adjacent to our pawn
    if (lastMove.to.row !== from.row || lastMove.to.col !== to.col) {
        return false;
    }

    return true;
};

const isValidPawnMove = (
    from: Position, 
    to: Position, 
    piece: Piece, 
    targetPiece: Piece | null, 
    board: Board
): boolean => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? WHITE_PAWN_START_ROW : BLACK_PAWN_START_ROW;
    const isFirstMove = from.row === startRow;

    // Capture move (diagonal) - includes regular capture
    if (targetPiece) {
        return Math.abs(dx) === 1 && dy === direction;
    }

    // Check for en passant (diagonal move to empty square)
    if (Math.abs(dx) === 1 && dy === direction && isEmptySquare(to, board)) {
        return canEnPassant(from, to, board);
    }

    // Forward movement only
    if (dx !== 0) return false;

    // Single square forward
    if (dy === direction) return true;

    // Double square forward from starting position
    if (isFirstMove && dy === 2 * direction) {
        const middleRow = from.row + direction;
        return isEmptySquare({ row: middleRow, col: from.col }, board);
    }

    return false;
};

const isValidRookMove = (from: Position, to: Position, board: Board): boolean => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    
    // Must move in straight line (horizontal or vertical)
    const isStraightLine = (dx === 0 && dy !== 0) || (dx !== 0 && dy === 0);
    if (!isStraightLine) return false;
    
    return isPathClear(from, to, board);
};

const isValidBishopMove = (from: Position, to: Position, board: Board): boolean => {
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    
    // Must move diagonally
    if (Math.abs(dx) !== Math.abs(dy)) return false;
    
    return isPathClear(from, to, board);
};

const isValidQueenMove = (from: Position, to: Position, board: Board): boolean => {
    // Queen moves like rook or bishop
    return isValidRookMove(from, to, board) || isValidBishopMove(from, to, board);
};

const isValidKingMove = (from: Position, to: Position): boolean => {
    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);
    
    return dx <= 1 && dy <= 1;
};

const isValidKnightMove = (from: Position, to: Position): boolean => {
    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);
    
    return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
};

export const isLegalMove = (
    from: Position, 
    to: Position, 
    board: Board, 
    skipCheckValidation: boolean = false
): boolean => {
    const { grid } = board;
    const piece = grid[from.row][from.col];
    const targetPiece = grid[to.row][to.col];

    if (!piece) return false;
    if (!isWithinBoard(from) || !isWithinBoard(to)) return false;
    if (from.row === to.row && from.col === to.col) return false;
    if (targetPiece?.color === piece.color) return false;

    let isPseudoLegal = false;
    switch (piece.type) {
        case 'pawn':
            isPseudoLegal = isValidPawnMove(from, to, piece, targetPiece, board);
            break;
        case 'rook':
            isPseudoLegal = isValidRookMove(from, to, board);
            break;
        case 'bishop':
            isPseudoLegal = isValidBishopMove(from, to, board);
            break;
        case 'queen':
            isPseudoLegal = isValidQueenMove(from, to, board);
            break;
        case 'king':
            isPseudoLegal = isValidKingMove(from, to);
            break;
        case 'knight':
            isPseudoLegal = isValidKnightMove(from, to);
            break;
        default:
            return false;
    }

    if (!isPseudoLegal) return false;

    // Don't validate check if we're already checking for check (prevents infinite recursion)
    if (skipCheckValidation) return true;

    // A move is only legal if it doesn't leave the king in check
    const testBoard = makeMove(from, to, board, true);
    if (!testBoard) return false;

    return !isInCheck(testBoard, piece.color);
};

export const isSquareAttacked = (pos: Position, board: Board, byColor: Color): boolean => {
    // Check if any piece of 'byColor' can attack the given position
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board.grid[row][col];
            if (piece && piece.color === byColor) {
                if (isLegalMove({ row, col }, pos, board, true)) {
                    return true;
                }
            }
        }
    }
    return false;
};

export const isInCheck = (board: Board, color: Color): boolean => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;

    const opponentColor: Color = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(kingPos, board, opponentColor);
};

export const isInCheckmate = (board: Board, color: Color): boolean => {
    if (!isInCheck(board, color)) return false;

    for (let fromRow = 0; fromRow < BOARD_SIZE; fromRow++) {
        for (let fromCol = 0; fromCol < BOARD_SIZE; fromCol++) {
            const piece = board.grid[fromRow][fromCol];
            if (!piece || piece.color !== color) continue;

            for (let toRow = 0; toRow < BOARD_SIZE; toRow++) {
                for (let toCol = 0; toCol < BOARD_SIZE; toCol++) {
                    const from = { row: fromRow, col: fromCol };
                    const to = { row: toRow, col: toCol };

                    if (isLegalMove(from, to, board)) {
                        return false;
                    }

                    if (piece.type === 'king') {
                        const castlingInfo = canCastle(from, to, board);
                        if (castlingInfo.isValid) {
                            const testBoard = performCastle(from, to, board, castlingInfo);
                            if (!isInCheck(testBoard, color)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    return true;
};

export const isInStalemate = (board: Board, color: Color): boolean => {
    if (isInCheck(board, color)) return false;

    for (let fromRow = 0; fromRow < BOARD_SIZE; fromRow++) {
        for (let fromCol = 0; fromCol < BOARD_SIZE; fromCol++) {
            const piece = board.grid[fromRow][fromCol];
            if (!piece || piece.color !== color) continue;

            for (let toRow = 0; toRow < BOARD_SIZE; toRow++) {
                for (let toCol = 0; toCol < BOARD_SIZE; toCol++) {
                    const from = { row: fromRow, col: fromCol };
                    const to = { row: toRow, col: toCol };

                    if (isLegalMove(from, to, board)) {
                        return false; 
                    }

                    if (piece.type === 'king') {
                        const castlingInfo = canCastle(from, to, board);
                        if (castlingInfo.isValid) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
};

interface CastlingResult {
    isValid: boolean;
    rookPosition?: Position;
    rookDestination?: Position;
    side?: 'kingside' | 'queenside';
}

export const canCastle = (from: Position, to: Position, board: Board): CastlingResult => {
    const piece = board.grid[from.row][from.col];

    if (!piece || piece.type !== 'king' || piece.hasMoved) {
        return { isValid: false };
    }

    if (isInCheck(board, piece.color)) {
        return { isValid: false };
    }

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    if (dy !== 0 || Math.abs(dx) !== 2) {
        return { isValid: false };
    }

    const isQueenside = dx < 0;
    const rookCol = isQueenside ? 0 : 7;
    const rook = board.grid[from.row][rookCol];

    if (!rook || rook.type !== 'rook' || rook.hasMoved) {
        return { isValid: false };
    }

    const rookPosition: Position = { row: from.row, col: rookCol };
    if (!isPathClear(from, rookPosition, board)) {
        return { isValid: false };
    }

    const step = isQueenside ? -1 : 1;
    const opponentColor: Color = piece.color === 'white' ? 'black' : 'white';
    
    for (let i = 0; i <= 2; i++) {
        const checkCol = from.col + (step * i);
        if (isSquareAttacked({ row: from.row, col: checkCol }, board, opponentColor)) {
            return { isValid: false };
        }
    }

    const rookDestCol = isQueenside ? from.col - 1 : from.col + 1;

    return {
        isValid: true,
        rookPosition,
        rookDestination: { row: from.row, col: rookDestCol },
        side: isQueenside ? 'queenside' : 'kingside'
    };
};

const performCastle = (
    from: Position, 
    to: Position, 
    board: Board, 
    castlingInfo: CastlingResult
): Board => {
    const newBoard = cloneBoard(board);
    const king = newBoard.grid[from.row][from.col];
    
    if (!king || !castlingInfo.rookPosition || !castlingInfo.rookDestination) {
        return newBoard;
    }

    const rook = newBoard.grid[castlingInfo.rookPosition.row][castlingInfo.rookPosition.col];
    
    if (!rook) return newBoard;

    // Move king
    clearSquare(from, newBoard.grid);
    setSquare(to, { ...king, hasMoved: true }, newBoard.grid);

    // Move rook
    clearSquare(castlingInfo.rookPosition, newBoard.grid);
    setSquare(castlingInfo.rookDestination, { ...rook, hasMoved: true }, newBoard.grid);

    return newBoard;
};

export const clearSquare = (pos: Position, grid: (Piece | null)[][]): void => {
    grid[pos.row][pos.col] = null;
};

export const setSquare = (pos: Position, piece: Piece | null, grid: (Piece | null)[][]): void => {
    if (!piece) return;
    grid[pos.row][pos.col] = piece;
};

const cloneBoard = (board: Board): Board => {
    return {
        grid: board.grid.map(row => row.map(cell => cell ? { ...cell } : null)),
        sideToMove: board.sideToMove,
        lastMove: board.lastMove ? { ...board.lastMove } : null,
        selectedPiece: board.selectedPiece ? { ...board.selectedPiece } : null,
        capturedPieces: [...board.capturedPieces],
        moveHistory: [...board.moveHistory],
    };
};

// Internal function to make a move without validation (used for testing positions)
const makeMove = (
    from: Position, 
    to: Position, 
    board: Board, 
    skipValidation: boolean = false
): Board | null => {
    const piece = board.grid[from.row][from.col];
    if (!piece) return null;

    const newBoard = cloneBoard(board);
    const targetPiece = newBoard.grid[to.row][to.col];

    const isEnPassantCapture = canEnPassant(from, to, board);
    if (isEnPassantCapture) {
        const capturedPawnRow = from.row; // Same row as attacking pawn
        const capturedPawnCol = to.col;   // Column of target square
        const capturedPawn = newBoard.grid[capturedPawnRow][capturedPawnCol];
        if (capturedPawn) {
            newBoard.capturedPieces.push(capturedPawn);
            clearSquare({ row: capturedPawnRow, col: capturedPawnCol }, newBoard.grid);
        }
    }

    if (targetPiece) {
        newBoard.capturedPieces.push(targetPiece);
    }

    const movedPiece: Piece = { ...piece, hasMoved: true };

    clearSquare(from, newBoard.grid);
    setSquare(to, movedPiece, newBoard.grid);

    newBoard.lastMove = { from, to, piece: movedPiece };
    if (!skipValidation) {
        newBoard.moveHistory.push({ from, to, piece: movedPiece });
        newBoard.sideToMove = board.sideToMove === 'white' ? 'black' : 'white';
    }

    return newBoard;
};

export const move = (from: Position, to: Position, board: Board): Board | null => {
    const piece = board.grid[from.row][from.col];
    
    if (!piece) return null;

    if (piece.color !== board.sideToMove) return null;

    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);
    if (piece.type === 'king' && dx === 2 && dy === 0) {
        const castlingInfo = canCastle(from, to, board);
        if (castlingInfo.isValid) {
            const newBoard = performCastle(from, to, board, castlingInfo);
            newBoard.sideToMove = board.sideToMove === 'white' ? 'black' : 'white';
            newBoard.lastMove = { from, to, piece };
            newBoard.moveHistory.push({ from, to, piece });
            return newBoard;
        }
        return null; 
    }

    if (!isLegalMove(from, to, board)) return null;

    return makeMove(from, to, board);
};

export const setDefaultLayout = (): Board => {
    const board: Board = {
        grid: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        sideToMove: 'white',
        lastMove: null,
        selectedPiece: null,
        capturedPieces: [],
        moveHistory: [],
    };

    const backRank: Type[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    // Setup white pieces
    for (let col = 0; col < BOARD_SIZE; col++) {
        board.grid[WHITE_BACK_RANK][col] = {
            color: 'white',
            type: backRank[col],
            hasMoved: false,
        };
        board.grid[WHITE_PAWN_START_ROW][col] = {
            color: 'white',
            type: 'pawn',
            hasMoved: false,
        };
    }

    // Setup black pieces
    for (let col = 0; col < BOARD_SIZE; col++) {
        board.grid[BLACK_BACK_RANK][col] = {
            color: 'black',
            type: backRank[col],
            hasMoved: false,
        };
        board.grid[BLACK_PAWN_START_ROW][col] = {
            color: 'black',
            type: 'pawn',
            hasMoved: false,
        };
    }

    return board;
};

export const printBoard = (board: Board): void => {
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

    for (let row = 0; row < BOARD_SIZE; row++) {
        let line = `${BOARD_SIZE - row} `;
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board.grid[row][col];
            line += cell ? ` ${pieceToSymbol[cell.color][cell.type]}` : ' .';
        }
        console.log(line);
    }
    console.log('   a b c d e f g h');
};

export function getPieceSymbol(piece: Piece): string {
    const symbols: Record<string, string> = {
        'white-pawn': '♙',
        'white-rook': '♖',
        'white-knight': '♘',
        'white-bishop': '♗',
        'white-queen': '♕',
        'white-king': '♔',
        'black-pawn': '♟',
        'black-rook': '♜',
        'black-knight': '♞',
        'black-bishop': '♝',
        'black-queen': '♛',
        'black-king': '♚',
    };
    return symbols[`${piece.color}-${piece.type}`] || '';
}

export interface GameStatus {
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    winner: Color | null;
}

export const getGameStatus = (board: Board): GameStatus => {
    const currentPlayer = board.sideToMove;
    const isCheck = isInCheck(board, currentPlayer);
    const isCheckmate = isInCheckmate(board, currentPlayer);
    const isStalemate = isInStalemate(board, currentPlayer);

    return {
        isCheck,
        isCheckmate,
        isStalemate,
        isDraw: isStalemate,
        winner: isCheckmate ? (currentPlayer === 'white' ? 'black' : 'white') : null,
    };
};

export const getPossibleMoves = (pos: Position, board: Board): Position[] => {
    const moves: Position[] = [];
    const piece = board.grid[pos.row][pos.col];
    
    if (!piece) return moves;

    // Check all squares on the board
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const targetPos = { row, col };

            if (isLegalMove(pos, targetPos, board)) {
                moves.push(targetPos);
            }

            if (piece.type === 'king') {
                const castlingInfo = canCastle(pos, targetPos, board);
                if (castlingInfo.isValid) {
                    moves.push(targetPos);
                }
            }
        }
    }

    return moves;
};

export const getAllLegalMoves = (board: Board, color: Color): Move[] => {
    const moves: Move[] = [];

    for (let fromRow = 0; fromRow < BOARD_SIZE; fromRow++) {
        for (let fromCol = 0; fromCol < BOARD_SIZE; fromCol++) {
            const piece = board.grid[fromRow][fromCol];
            if (!piece || piece.color !== color) continue;

            const from = { row: fromRow, col: fromCol };
            const possibleMoves = getPossibleMoves(from, board);

            for (const to of possibleMoves) {
                moves.push({ from, to, piece });
            }
        }
    }

    return moves;
};