import type { Piece } from "../../core/types";
import styles from './Square.module.scss'

export interface ISquare {
    isDark: boolean;
    piece: Piece | null;
    isSelected: boolean;
    onClick: () => void;
}

export const Square = ({isDark, piece, isSelected, onClick}: ISquare) => {
    const pieceSymbol = piece ? getPieceSymbol(piece) : '';
    return(
        <div className={`${styles.square} ${isDark ? styles.dark : styles.light} ${isSelected ? styles.selected: ''}`} onClick={onClick}>
            {pieceSymbol}
        </div>
    )
}

function getPieceSymbol(piece: Piece): string {
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