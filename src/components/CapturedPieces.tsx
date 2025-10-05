import { Piece, PIECE_VALUES, PieceColor } from "@/utils/chessLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChessPiece } from "./ChessPiece";

interface CapturedPiecesProps {
  capturedWhite: Piece[];
  capturedBlack: Piece[];
}

export const CapturedPieces = ({ capturedWhite, capturedBlack }: CapturedPiecesProps) => {
  const calculateMaterialAdvantage = () => {
    const whiteValue = capturedBlack.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0);
    const blackValue = capturedWhite.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0);
    return whiteValue - blackValue;
  };

  const advantage = calculateMaterialAdvantage();

  const renderCapturedPieces = (pieces: Piece[], color: PieceColor) => {
    if (pieces.length === 0) {
      return <span className="text-sm text-muted-foreground">None</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, idx) => (
          <ChessPiece
            key={idx}
            piece={piece}
            size={32}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Black Captured</CardTitle>
            {advantage > 0 && (
              <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                +{advantage}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="min-h-[60px]">
          {renderCapturedPieces(capturedBlack, 'black')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">White Captured</CardTitle>
            {advantage < 0 && (
              <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                +{Math.abs(advantage)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="min-h-[60px]">
          {renderCapturedPieces(capturedWhite, 'white')}
        </CardContent>
      </Card>
    </div>
  );
};
