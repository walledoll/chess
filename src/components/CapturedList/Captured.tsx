import { getPieceSymbol } from "../../core/board";
import type { Color, Piece } from "../../core/types";
import styles from './Captured.module.scss'

export interface ICaptured {
    capturedPieces: (Piece | null)[];
    color: Color;
}

export const Captured = ({capturedPieces, color}: ICaptured) => {
    return(
        <div className={styles.container}>
            {capturedPieces.map((piece) => {
                return (piece?.color === color ?  
                <div className={styles.cell}>
                    {getPieceSymbol(piece as Piece)}
                </div>
                :
                '')
            })}
        </div>
    )
}