import { getPieceSymbol } from "../../core/board";
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

