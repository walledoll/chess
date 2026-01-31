import { useState } from 'react';
import { setDefaultLayout, move, getGameStatus } from '../../core/board';
import { type Board as B, type Position } from '../../core/types';
import Board from '../Board/Board';
import { Captured } from '../CapturedList/Captured';
import styles from './Game.module.scss'

export default function Game() {
  const [board, setBoard] = useState<B>(setDefaultLayout());
  const [selected, setSelected] = useState<Position | null>(null);

  const gameStatus = getGameStatus(board);

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

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        {gameStatus.isCheckmate && (
          <div className={styles.gameOver}>
            <h2>Мат! Победа: {gameStatus.winner === 'white' ? 'Белые' : 'Чёрные'}</h2>
          </div>
        )}
        {gameStatus.isStalemate && (
          <div className={styles.gameOver}>
            <h2>Пат! Ничья</h2>
          </div>
        )}
        {gameStatus.isCheck && !gameStatus.isCheckmate && (
          <div className={styles.check}>
            <h3>Шах {board.sideToMove === 'white' ? 'белым' : 'чёрным'}!</h3>
          </div>
        )}
        <Captured capturedPieces={board.capturedPieces} color='black'/>
      </div>

      <Board board={board} selected={selected} onSquareClick={handleSquareClick} />
      
      <div className={styles.bottomSection}>
        <Captured capturedPieces={board.capturedPieces} color='white'/>
        <div className={styles.turn}>
          Ход: {board.sideToMove === 'white' ? 'Белые' : 'Чёрные'}
        </div>
      </div>
    </div>
  );
}