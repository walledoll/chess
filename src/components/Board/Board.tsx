import { Square } from '../Square/Square';
import { type Board, type Position } from '../../core/types';
import { getPossibleMoves, findKing, isInCheck } from '../../core/board';
import styles from './Board.module.scss'

interface ChessBoardProps {
  board: Board;
  selected: Position | null;
  onSquareClick: (pos: Position) => void;
}

export default function ChessBoard({ board, selected, onSquareClick }: ChessBoardProps) {
  const rows = [];

  const validMoves = selected ? getPossibleMoves(selected, board) : [];

  const whiteKingPos = findKing(board, 'white');
  const blackKingPos = findKing(board, 'black');
  const whiteInCheck = isInCheck(board, 'white');
  const blackInCheck = isInCheck(board, 'black');

  for (let row = 0; row < 8; row++) {
    const squares = [];
    for (let col = 0; col < 8; col++) {
      const piece = board.grid[row][col];
      const isSelected = selected?.row === row && selected?.col === col;
      const isDark = (row + col) % 2 === 1;

      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      );

      const isKingInCheck = 
        (whiteInCheck && whiteKingPos?.row === row && whiteKingPos?.col === col) ||
        (blackInCheck && blackKingPos?.row === row && blackKingPos?.col === col);

      squares.push(
        <Square
          key={`${row}-${col}`}
          piece={piece}
          isDark={isDark}
          isSelected={isSelected}
          isValidMove={isValidMove}
          isInCheck={isKingInCheck}
          onClick={() => onSquareClick({ row, col })}
        />
      );
    }
    rows.push(
      <div key={row} className={styles.boardRow}>
        {squares}
      </div>
    );
  }

  return <div className={styles.chessBoard}>{rows}</div>;
}