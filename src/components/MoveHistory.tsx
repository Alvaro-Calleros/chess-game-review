import { Move, moveToAlgebraic } from "@/utils/chessLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoveHistoryProps {
  moves: Move[];
  onMoveClick: (index: number) => void;
  currentMoveIndex: number;
}

export const MoveHistory = ({ moves, onMoveClick, currentMoveIndex }: MoveHistoryProps) => {
  const { toast } = useToast();

  const exportPGN = () => {
    const pgn = movesToPGN(moves);
    navigator.clipboard.writeText(pgn);
    toast({
      title: "Copied to clipboard",
      description: "Move history exported as PGN",
    });
  };

  const movesToPGN = (moves: Move[]): string => {
    let pgn = '';
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moveToAlgebraic(moves[i], [] as any, !!moves[i].captured);
      const blackMove = i + 1 < moves.length 
        ? moveToAlgebraic(moves[i + 1], [] as any, !!moves[i + 1].captured)
        : '';
      
      pgn += `${moveNum}. ${whiteMove}${blackMove ? ' ' + blackMove : ''} `;
    }
    return pgn.trim();
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Move History</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportPGN}
          disabled={moves.length === 0}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {moves.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No moves yet
            </p>
          ) : (
            <div className="space-y-1">
              {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, idx) => {
                const whiteIdx = idx * 2;
                const blackIdx = whiteIdx + 1;
                const whiteMove = moves[whiteIdx];
                const blackMove = blackIdx < moves.length ? moves[blackIdx] : null;

                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground w-8">
                      {idx + 1}.
                    </span>
                    <button
                      onClick={() => onMoveClick(whiteIdx)}
                      className={`flex-1 text-left px-2 py-1 rounded hover:bg-secondary transition-colors ${
                        currentMoveIndex === whiteIdx ? 'bg-accent text-accent-foreground font-medium' : ''
                      }`}
                    >
                      {moveToAlgebraic(whiteMove, [] as any, !!whiteMove.captured)}
                    </button>
                    {blackMove && (
                      <button
                        onClick={() => onMoveClick(blackIdx)}
                        className={`flex-1 text-left px-2 py-1 rounded hover:bg-secondary transition-colors ${
                          currentMoveIndex === blackIdx ? 'bg-accent text-accent-foreground font-medium' : ''
                        }`}
                      >
                        {moveToAlgebraic(blackMove, [] as any, !!blackMove.captured)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
