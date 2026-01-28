import { useState } from 'react';
import { setDefaultLayout, move } from '../../core/board';
import { type Board as B, type Position } from '../../core/types'; // ваша логика
import Board from '../Board/Board';

export default function Game() {
  const [board, setBoard] = useState<B>(setDefaultLayout());
  const [selected, setSelected] = useState<Position | null>(null);

  const handleSquareClick = (pos: Position) => {
    if (selected) {
      const newBoard = move(selected, pos, board);
      if (newBoard) {
        setBoard(newBoard);
        setSelected(null);
      } else {
        if (board.grid[pos.row][pos.col]) {
          setSelected(pos);
        } else {
          setSelected(null); 
        }
      }
    } else {
      if (board.grid[pos.row][pos.col]) {
        setSelected(pos);
      }
    }
  };

  return <Board board={board} selected={selected} onSquareClick={handleSquareClick} />;
}