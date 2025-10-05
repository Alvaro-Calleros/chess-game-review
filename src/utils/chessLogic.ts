export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  isPromotion?: boolean;
  promotedTo?: PieceType;
}

export type Board = (Piece | null)[][];

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup back rank pieces - Queen on d-file (col 3), King on e-file (col 4)
  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'king', 'queen', 'bishop', 'knight', 'rook'];
  
  // White pieces (bottom)
  for (let col = 0; col < 8; col++) {
    board[7][col] = { type: backRank[col], color: 'white', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
  
  // Black pieces (top)
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'black', hasMoved: false };
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
  }
  
  return board;
};

export const createEmptyBoard = (): Board => {
  return Array(8).fill(null).map(() => Array(8).fill(null));
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

const getPawnMoves = (board: Board, from: Position, piece: Piece, lastMove: Move | null): Position[] => {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // Forward move
  const forward = { row: from.row + direction, col: from.col };
  if (isValidPosition(forward) && !board[forward.row][forward.col]) {
    moves.push(forward);
    
    // Double move from starting position
    if (from.row === startRow) {
      const doubleForward = { row: from.row + 2 * direction, col: from.col };
      if (!board[doubleForward.row][doubleForward.col]) {
        moves.push(doubleForward);
      }
    }
  }
  
  // Diagonal captures
  for (const colOffset of [-1, 1]) {
    const capture = { row: from.row + direction, col: from.col + colOffset };
    if (isValidPosition(capture)) {
      const target = board[capture.row][capture.col];
      if (target && target.color !== piece.color) {
        moves.push(capture);
      }
      
      // En passant
      if (lastMove && lastMove.piece.type === 'pawn' && 
          Math.abs(lastMove.to.row - lastMove.from.row) === 2 &&
          lastMove.to.row === from.row && 
          lastMove.to.col === from.col + colOffset) {
        moves.push(capture);
      }
    }
  }
  
  return moves;
};

const getRookMoves = (board: Board, from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dRow, dCol] of directions) {
    let row = from.row + dRow;
    let col = from.col + dCol;
    
    while (isValidPosition({ row, col })) {
      const target = board[row][col];
      if (!target) {
        moves.push({ row, col });
      } else {
        if (target.color !== piece.color) {
          moves.push({ row, col });
        }
        break;
      }
      row += dRow;
      col += dCol;
    }
  }
  
  return moves;
};

const getKnightMoves = (board: Board, from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dRow, dCol] of offsets) {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const target = board[pos.row][pos.col];
      if (!target || target.color !== piece.color) {
        moves.push(pos);
      }
    }
  }
  
  return moves;
};

const getBishopMoves = (board: Board, from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dRow, dCol] of directions) {
    let row = from.row + dRow;
    let col = from.col + dCol;
    
    while (isValidPosition({ row, col })) {
      const target = board[row][col];
      if (!target) {
        moves.push({ row, col });
      } else {
        if (target.color !== piece.color) {
          moves.push({ row, col });
        }
        break;
      }
      row += dRow;
      col += dCol;
    }
  }
  
  return moves;
};

const getQueenMoves = (board: Board, from: Position, piece: Piece): Position[] => {
  return [...getRookMoves(board, from, piece), ...getBishopMoves(board, from, piece)];
};

const getKingMoves = (board: Board, from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dRow, dCol] of offsets) {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const target = board[pos.row][pos.col];
      if (!target || target.color !== piece.color) {
        moves.push(pos);
      }
    }
  }
  // Castling
  if (!piece.hasMoved) {
    const row = from.row;
    const kingCol = from.col;
    
    // Kingside castling (King moves 2 squares toward h-file)
    const kingsideRook = board[row][7];
    if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
      // Check all squares between King and Rook are empty
      let pathClear = true;
      for (let col = kingCol + 1; col < 7; col++) {
        if (board[row][col]) {
          pathClear = false;
          break;
        }
      }
      if (pathClear) {
        moves.push({ row, col: kingCol + 2 }); // King moves 2 squares right
      }
    }
    
    // Queenside castling (King moves 2 squares toward a-file)
    const queensideRook = board[row][0];
    if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
      // Check all squares between King and Rook are empty
      let pathClear = true;
      for (let col = 1; col < kingCol; col++) {
        if (board[row][col]) {
          pathClear = false;
          break;
        }
      }
      if (pathClear) {
        moves.push({ row, col: kingCol - 2 }); // King moves 2 squares left
      }
    }
  }

  return moves;
  };
export const getPseudoLegalMoves = (board: Board, from: Position, lastMove: Move | null = null): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece, lastMove);
    case 'rook':
      return getRookMoves(board, from, piece);
    case 'knight':
      return getKnightMoves(board, from, piece);
    case 'bishop':
      return getBishopMoves(board, from, piece);
    case 'queen':
      return getQueenMoves(board, from, piece);
    case 'king':
      return getKingMoves(board, from, piece);
    default:
      return [];
  }
};

const findKing = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isSquareAttacked = (board: Board, pos: Position, byColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getPseudoLegalMoves(board, { row, col });
        if (moves.some(move => positionsEqual(move, pos))) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos, opponentColor);
};

const simulateMove = (board: Board, from: Position, to: Position): Board => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (piece) {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
    newBoard[from.row][from.col] = null;
  }
  
  return newBoard;
};

export const isLegalMove = (board: Board, from: Position, to: Position, lastMove: Move | null = null): boolean => {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  
  const pseudoLegalMoves = getPseudoLegalMoves(board, from, lastMove);
  if (!pseudoLegalMoves.some(move => positionsEqual(move, to))) {
    return false;
  }
  
  // Check for castling special validation
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    
    // King can't be in check
    if (isInCheck(board, piece.color)) {
      return false;
    }
    
    // King can't pass through check
    const middleCol = from.col + (to.col > from.col ? 1 : -1);
    const middleSquare = { row: from.row, col: middleCol };
    const middleBoard = simulateMove(board, from, middleSquare);
    if (isInCheck(middleBoard, piece.color)) {
      return false;
    }
  }
  
  // Simulate move and check if king is in check
  const newBoard = simulateMove(board, from, to);
  return !isInCheck(newBoard, piece.color);
};

export const getLegalMoves = (board: Board, from: Position, lastMove: Move | null = null): Position[] => {
  const pseudoLegalMoves = getPseudoLegalMoves(board, from, lastMove);
  return pseudoLegalMoves.filter(to => isLegalMove(board, from, to, lastMove));
};

export const getAllLegalMoves = (board: Board, color: PieceColor, lastMove: Move | null = null): Move[] => {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const legalMoves = getLegalMoves(board, from, lastMove);
        
        for (const to of legalMoves) {
          moves.push({
            from,
            to,
            piece,
            captured: board[to.row][to.col] || undefined,
          });
        }
      }
    }
  }
  
  return moves;
};

export const isCheckmate = (board: Board, color: PieceColor, lastMove: Move | null = null): boolean => {
  return isInCheck(board, color) && getAllLegalMoves(board, color, lastMove).length === 0;
};

export const isStalemate = (board: Board, color: PieceColor, lastMove: Move | null = null): boolean => {
  return !isInCheck(board, color) && getAllLegalMoves(board, color, lastMove).length === 0;
};

export const hasInsufficientMaterial = (board: Board): boolean => {
  const pieces: Piece[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type !== 'king') {
        pieces.push(piece);
      }
    }
  }
  
  // King vs King
  if (pieces.length === 0) return true;
  
  // King + Bishop vs King or King + Knight vs King
  if (pieces.length === 1 && (pieces[0].type === 'bishop' || pieces[0].type === 'knight')) {
    return true;
  }
  
  // King + Bishop vs King + Bishop (same color squares)
  if (pieces.length === 2 && pieces.every(p => p.type === 'bishop')) {
    // Would need to check if bishops are on same colored squares
    return true;
  }
  
  return false;
};

export const positionToNotation = (pos: Position): string => {
  return String.fromCharCode(97 + pos.col) + (8 - pos.row);
};

export const moveToAlgebraic = (move: Move, board: Board, isCapture: boolean = false): string => {
  const { from, to, piece } = move;
  
  // Castling
  if (move.isCastling) {
    return to.col > from.col ? 'O-O-O' : 'O-O';
  }
  
  let notation = '';
  
  // Piece letter (except pawns)
  if (piece.type !== 'pawn') {
    notation += piece.type.charAt(0).toUpperCase();
  }
  
  // For pawns, show starting file on capture
  if (piece.type === 'pawn' && isCapture) {
    notation += String.fromCharCode(97 + from.col);
  }
  
  // Capture notation
  if (isCapture || move.captured) {
    notation += 'x';
  }
  
  // Destination square
  notation += positionToNotation(to);
  
  // Promotion
  if (move.isPromotion && move.promotedTo) {
    notation += '=' + move.promotedTo.charAt(0).toUpperCase();
  }
  
  // Check/checkmate (would need to be added after the move is made)
  
  return notation;
};
