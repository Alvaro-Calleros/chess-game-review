import { cn } from "@/lib/utils";
import { Piece, Position } from "@/utils/chessLogic";
import { ChessPiece } from "./ChessPiece";

interface ChessSquareProps {
  piece: Piece | null;
  position: Position;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
  isInCheck: boolean;
  onSquareClick: (pos: Position) => void;
  onDragStart: (pos: Position) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (pos: Position) => void;
}

export const ChessSquare = ({
  piece,
  position,
  isLight,
  isSelected,
  isValidMove,
  isLastMoveFrom,
  isLastMoveTo,
  isInCheck,
  onSquareClick,
  onDragStart,
  onDragOver,
  onDrop,
}: ChessSquareProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      onDragStart(position);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(position);
  };

  return (
    <div
      className={cn(
        "relative aspect-square flex items-center justify-center cursor-pointer transition-all duration-300",
        isLight ? "bg-chess-light" : "bg-chess-dark",
        isSelected && "ring-4 ring-chess-highlight-selected ring-inset shadow-lg",
        (isLastMoveFrom || isLastMoveTo) && "bg-chess-highlight-last",
        isInCheck && "bg-chess-highlight-check animate-pulse"
      )}
      onClick={() => onSquareClick(position)}
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      {piece && (
        <ChessPiece
          piece={piece}
          size={60}
          draggable
          onDragStart={handleDragStart}
        />
      )}
      
      {isValidMove && !piece && (
        <div className="absolute w-4 h-4 bg-chess-highlight-move rounded-full opacity-70" />
      )}
      
      {isValidMove && piece && (
        <div className="absolute inset-0 border-4 border-chess-highlight-move rounded-sm opacity-70" />
      )}
    </div>
  );
};
