import { useState, useCallback } from "react";
import { ChessSquare } from "./ChessSquare";
import { PromotionDialog } from "./PromotionDialog";
import { MoveHistory } from "./MoveHistory";
import { CapturedPieces } from "./CapturedPieces";
import { GameControls } from "./GameControls";
import {
  Board,
  Piece,
  Position,
  Move,
  PieceType,
  PieceColor,
  createInitialBoard,
  createEmptyBoard,
  getLegalMoves,
  isLegalMove,
  isInCheck,
  isCheckmate,
  isStalemate,
  hasInsufficientMaterial,
  positionsEqual,
  positionToNotation,
} from "@/utils/chessLogic";

export const ChessBoard = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<Position | null>(null);
  const [isFlipped, setIsFlipped] = useState(true);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [promotionColor, setPromotionColor] = useState<PieceColor>('white');
  const [gameStatus, setGameStatus] = useState<string | null>(null);

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  const checkGameStatus = useCallback((newBoard: Board, color: PieceColor) => {
    if (isCheckmate(newBoard, color, lastMove)) {
      const winner = color === 'white' ? 'Black' : 'White';
      setGameStatus(`Checkmate! ${winner} wins!`);
      return true;
    }
    
    if (isStalemate(newBoard, color, lastMove)) {
      setGameStatus('Stalemate! Draw.');
      return true;
    }
    
    if (hasInsufficientMaterial(newBoard)) {
      setGameStatus('Draw by insufficient material.');
      return true;
    }
    
    return false;
  }, [lastMove]);

  const executeMove = useCallback((from: Position, to: Position, promoteTo?: PieceType) => {
    const piece = board[from.row][from.col];
    if (!piece) return;

    const newBoard = board.map(row => [...row]);
    const captured = newBoard[to.row][to.col];
    
    // Handle en passant
    let isEnPassant = false;
    if (piece.type === 'pawn' && to.col !== from.col && !captured) {
      isEnPassant = true;
      const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      const capturedPawn = newBoard[capturedPawnRow][to.col];
      if (capturedPawn) {
        if (capturedPawn.color === 'white') {
          setCapturedWhite(prev => [...prev, capturedPawn]);
        } else {
          setCapturedBlack(prev => [...prev, capturedPawn]);
        }
        newBoard[capturedPawnRow][to.col] = null;
      }
    }
    
    // Handle castling
    let isCastling = false;
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      isCastling = true;
      const isKingside = to.col > from.col;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? to.col - 1 : to.col + 1; // Rook goes next to king
      const rook = newBoard[from.row][rookFromCol];
      
      if (rook) {
        newBoard[from.row][rookToCol] = { ...rook, hasMoved: true };
        newBoard[from.row][rookFromCol] = null;
      }
    }
    
    // Handle promotion
    let isPromotion = false;
    if (piece.type === 'pawn') {
      const promotionRow = piece.color === 'white' ? 0 : 7;
      if (to.row === promotionRow) {
        if (!promoteTo) {
          setPromotionSquare(to);
          setPromotionColor(piece.color);
          // Move piece temporarily
          newBoard[to.row][to.col] = { ...piece, hasMoved: true };
          newBoard[from.row][from.col] = null;
          setBoard(newBoard);
          return;
        }
        isPromotion = true;
      }
    }
    
    // Execute move
    const movedPiece = promoteTo ? { type: promoteTo, color: piece.color, hasMoved: true } : { ...piece, hasMoved: true };
    newBoard[to.row][to.col] = movedPiece;
    newBoard[from.row][from.col] = null;
    
    // Track captured pieces
    if (captured) {
      if (captured.color === 'white') {
        setCapturedWhite(prev => [...prev, captured]);
      } else {
        setCapturedBlack(prev => [...prev, captured]);
      }
    }
    
    // Record move
    const move: Move = {
      from,
      to,
      piece,
      captured,
      isEnPassant,
      isCastling,
      isPromotion,
      promotedTo: promoteTo,
    };
    
    // Trim future history if we're not at the end
    const newHistory = historyIndex < moveHistory.length - 1 
      ? [...moveHistory.slice(0, historyIndex + 1), move]
      : [...moveHistory, move];
    
    setMoveHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionSquare(null);
    
    // Switch turn and check game status
    const nextTurn = currentTurn === 'white' ? 'black' : 'white';
    setCurrentTurn(nextTurn);
    
    if (!checkGameStatus(newBoard, nextTurn)) {
      setGameStatus(null);
    }
  }, [board, currentTurn, moveHistory, historyIndex, checkGameStatus]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus) return; // Game is over
    
    const piece = board[pos.row][pos.col];
    
    // If a piece is selected and this is a valid move
    if (selectedSquare && validMoves.some(move => positionsEqual(move, pos))) {
      executeMove(selectedSquare, pos);
      return;
    }
    
    // Select a piece
    if (piece && piece.color === currentTurn) {
      setSelectedSquare(pos);
      setValidMoves(getLegalMoves(board, pos, lastMove));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [board, selectedSquare, validMoves, currentTurn, executeMove, lastMove, gameStatus]);

  const handleDragStart = useCallback((pos: Position) => {
    const piece = board[pos.row][pos.col];
    if (piece && piece.color === currentTurn && !gameStatus) {
      setDraggedPiece(pos);
      setSelectedSquare(pos);
      setValidMoves(getLegalMoves(board, pos, lastMove));
    }
  }, [board, currentTurn, lastMove, gameStatus]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((to: Position) => {
    if (draggedPiece && validMoves.some(move => positionsEqual(move, to))) {
      executeMove(draggedPiece, to);
    }
    setDraggedPiece(null);
  }, [draggedPiece, validMoves, executeMove]);

  const handleReset = useCallback(() => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn('white');
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setHistoryIndex(-1);
    setGameStatus(null);
  }, []);

  const handleClear = useCallback(() => {
    setBoard(createEmptyBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setHistoryIndex(-1);
    setGameStatus(null);
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      // Rebuild board state from history by replaying all moves
      const newBoard = createInitialBoard();
      const newCapturedWhite: Piece[] = [];
      const newCapturedBlack: Piece[] = [];
      
      // Replay all moves up to the new index
      for (let i = 0; i < historyIndex; i++) {
        const move = moveHistory[i];
        const { from, to, isEnPassant, isCastling, promotedTo } = move;
        
        // Handle en passant
        if (isEnPassant) {
          const capturedPawnRow = move.piece.color === 'white' ? to.row + 1 : to.row - 1;
          const capturedPawn = newBoard[capturedPawnRow][to.col];
          if (capturedPawn) {
            if (capturedPawn.color === 'white') {
              newCapturedWhite.push(capturedPawn);
            } else {
              newCapturedBlack.push(capturedPawn);
            }
            newBoard[capturedPawnRow][to.col] = null;
          }
        }
        
        // Handle castling
        if (isCastling) {
          const isKingside = to.col > from.col;
          const rookFromCol = isKingside ? 7 : 0;
          const rookToCol = isKingside ? to.col - 1 : to.col + 1; // Rook goes next to king
          const rook = newBoard[from.row][rookFromCol];
          if (rook) {
            newBoard[from.row][rookToCol] = { ...rook, hasMoved: true };
            newBoard[from.row][rookFromCol] = null;
          }
        }
        
        // Capture piece
        const captured = newBoard[to.row][to.col];
        if (captured) {
          if (captured.color === 'white') {
            newCapturedWhite.push(captured);
          } else {
            newCapturedBlack.push(captured);
          }
        }
        
        // Move piece
        const movedPiece = promotedTo 
          ? { type: promotedTo, color: move.piece.color, hasMoved: true }
          : { ...move.piece, hasMoved: true };
        newBoard[to.row][to.col] = movedPiece;
        newBoard[from.row][from.col] = null;
      }
      
      setBoard(newBoard);
      setCapturedWhite(newCapturedWhite);
      setCapturedBlack(newCapturedBlack);
      setHistoryIndex(historyIndex - 1);
      setCurrentTurn(historyIndex % 2 === 0 ? 'black' : 'white');
      setSelectedSquare(null);
      setValidMoves([]);
      setGameStatus(null);
    }
  }, [historyIndex, moveHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex < moveHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentTurn(historyIndex % 2 === 0 ? 'white' : 'black');
    }
  }, [historyIndex, moveHistory]);

  const handleMoveClick = useCallback((index: number) => {
    setHistoryIndex(index);
    // Rebuild board from history up to this point
    // This is simplified - full implementation would properly reconstruct board state
  }, []);

  const handlePromotion = useCallback((pieceType: PieceType) => {
    if (promotionSquare && selectedSquare) {
      executeMove(selectedSquare, promotionSquare, pieceType);
    }
  }, [promotionSquare, selectedSquare, executeMove]);

  const renderBoard = () => {
    const rows = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    for (let row = 0; row < 8; row++) {
      const displayRow = isFlipped ? row : 7 - row;
      const rankNumber = 8 - displayRow;
      
      const cols = [];
      for (let col = 0; col < 8; col++) {
        const displayCol = isFlipped ? 7 - col : col;
        const position = { row: displayRow, col: displayCol };
        const piece = board[displayRow][displayCol];
        const isLight = (displayRow + displayCol) % 2 !== 0;
        const isSelected = selectedSquare && positionsEqual(selectedSquare, position);
        const isValidMove = validMoves.some(move => positionsEqual(move, position));
        const isLastMoveFrom = lastMove && positionsEqual(lastMove.from, position);
        const isLastMoveTo = lastMove && positionsEqual(lastMove.to, position);
        const isInCheckSquare = piece && piece.type === 'king' && isInCheck(board, piece.color);
        
        cols.push(
          <ChessSquare
            key={`${displayRow}-${displayCol}`}
            piece={piece}
            position={position}
            isLight={isLight}
            isSelected={isSelected}
            isValidMove={isValidMove}
            isLastMoveFrom={isLastMoveFrom}
            isLastMoveTo={isLastMoveTo}
            isInCheck={isInCheckSquare}
            onSquareClick={handleSquareClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        );
      }
      
      rows.push(
        <div key={row} className="flex">
          <div className="w-8 flex items-center justify-center text-sm font-semibold text-muted-foreground">
            {rankNumber}
          </div>
          <div className="grid grid-cols-8 flex-1">
            {cols}
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {rows}
        <div className="flex pl-8 mt-1">
          {files.map((file, idx) => (
            <div key={file} className="flex-1 text-center text-sm font-semibold text-muted-foreground">
              {isFlipped ? files[7 - idx] : file}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          
          <h1 className="text-4xl font-bold text-center text-foreground">
            Chess Game Review
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Game Controls */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <GameControls
              currentTurn={currentTurn}
              onReset={handleReset}
              onClear={handleClear}
              onFlip={handleFlip}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex >= 0}
              canRedo={historyIndex < moveHistory.length - 1}
              isInCheck={isInCheck(board, currentTurn)}
              gameStatus={gameStatus}
            />
          </div>
          
          {/* Center - Chess Board */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-card rounded-lg shadow-2xl p-4">
              {renderBoard()}
            </div>
          </div>
          
          {/* Right sidebar - Move History & Captured Pieces */}
          <div className="lg:col-span-3 order-3 space-y-6">
            <MoveHistory
              moves={moveHistory}
              onMoveClick={handleMoveClick}
              currentMoveIndex={historyIndex}
            />
            <CapturedPieces
              capturedWhite={capturedWhite}
              capturedBlack={capturedBlack}
            />
          </div>
        </div>
      </div>
      
      <PromotionDialog
        isOpen={promotionSquare !== null}
        color={promotionColor}
        onSelect={handlePromotion}
      />
    </div>
  );
};
