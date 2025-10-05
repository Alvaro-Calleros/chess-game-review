import { PieceColor, PieceType } from './chessLogic';

// Chess piece SVG URLs from Wikimedia Commons (high quality, free to use)
export const PIECE_IMAGES: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  },
  black: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  },
};

// Alternative: Chess.com style pieces (if you prefer a different style)
export const PIECE_IMAGES_CHESS_COM_STYLE: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
    queen: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
    rook: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
    bishop: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
    knight: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
    pawn: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
  },
  black: {
    king: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png',
    queen: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
    rook: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
    bishop: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
    knight: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
    pawn: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
  },
};

// You can switch between different piece sets by changing this export
export const ACTIVE_PIECE_SET = PIECE_IMAGES; // or PIECE_IMAGES_CHESS_COM_STYLE
