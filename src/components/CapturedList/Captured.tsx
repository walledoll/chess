import { getPieceSymbol } from "../../core/board";
import type { Piece } from "../../core/types";

export interface ICaptured {
    capturedPieces: (Piece | null)[];
}

export const Captured = ({capturedPieces}: ICaptured) => {
    return(
        <div>
            {capturedPieces.map((piece) => {
                return  <div>
                            {getPieceSymbol(piece as Piece)}
                        </div>
            })}
        </div>
    )
}