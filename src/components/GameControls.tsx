import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RotateCcw, 
  Trash2, 
  FlipVertical, 
  Undo, 
  Redo,
  Activity,
  Bot
} from "lucide-react";
import { PieceColor } from "@/utils/chessLogic";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GameControlsProps {
  currentTurn: PieceColor;
  onReset: () => void;
  onClear: () => void;
  onFlip: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isInCheck: boolean;
  gameStatus: string | null;
}

export const GameControls = ({
  currentTurn,
  onReset,
  onClear,
  onFlip,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isInCheck,
  gameStatus,
}: GameControlsProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Game Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Turn:</span>
            <span className={`text-sm font-bold capitalize ${
              currentTurn === 'white' ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {currentTurn} to move
            </span>
          </div>
          
          {isInCheck && (
            <div className="flex items-center gap-2 text-destructive font-semibold animate-pulse">
              <Activity className="h-4 w-4" />
              <span>Check!</span>
            </div>
          )}
          
          {gameStatus && (
            <div className="p-3 bg-accent text-accent-foreground rounded-md text-center font-semibold">
              {gameStatus}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="w-full"
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="w-full"
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onFlip}
            className="w-full"
          >
            <FlipVertical className="h-4 w-4 mr-2" />
            Flip Board
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Board
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Board
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-muted-foreground">Future Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Play vs Computer
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chess engine integration planned</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Analysis
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Placeholder evaluation bar */}
      <Card className="border-dashed border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-8 mx-auto bg-muted rounded-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-secondary"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              0.0
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Engine evaluation planned
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
