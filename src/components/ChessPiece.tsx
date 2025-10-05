import { Piece } from "@/utils/chessLogic";
import { ACTIVE_PIECE_SET } from "@/utils/chessPieceImages";

interface ChessPieceProps {
  piece: Piece;
  size?: number;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export const ChessPiece = ({ 
  piece, 
  size = 60, 
  className = "", 
  draggable = false,
  onDragStart 
}: ChessPieceProps) => {
  const imageUrl = ACTIVE_PIECE_SET[piece.color][piece.type];
  
  return (
    <img
      src={imageUrl}
      alt={`${piece.color} ${piece.type}`}
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:scale-110 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
      style={{
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
      }}
    />
  );
};
