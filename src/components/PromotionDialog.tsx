import { PieceType, PieceColor } from "@/utils/chessLogic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChessPiece } from "./ChessPiece";

interface PromotionDialogProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

export const PromotionDialog = ({ isOpen, color, onSelect }: PromotionDialogProps) => {
  const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote Pawn</DialogTitle>
          <DialogDescription>
            Choose a piece to promote your pawn to:
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-secondary transition-all duration-200 hover:scale-105"
            >
              <div className="mb-2">
                <ChessPiece
                  piece={{ type: pieceType, color, hasMoved: false }}
                  size={64}
                />
              </div>
              <span className="text-sm font-medium capitalize">{pieceType}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
