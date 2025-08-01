// Optimized Rubik's cube representation using flat buffer for WebAssembly
// 54 stickers stored as u8 color values (0-5)
// Face layout: U(0-8), D(9-17), F(18-26), B(27-35), R(36-44), L(45-53)
// Each face uses standard 3x3 indexing: 0-2 top row, 3-5 middle, 6-8 bottom

#[cfg(target_arch = "wasm32")]
use js_sys;
#[repr(C)]
#[derive(Debug, Clone, PartialEq)]
pub struct OptimizedCube {
    stickers: [u8; 54],
}

// Move encoding: each move is represented as a single byte enum value
// 0-5: U, D, F, B, R, L (90° clockwise rotations)
// 6-11: U', D', F', B', R', L' (90° counter-clockwise rotations)
// 12-17: U2, D2, F2, B2, R2, L2 (180° double rotations)
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum MoveCode {
    U = 0,
    D = 1,
    F = 2,
    B = 3,
    R = 4,
    L = 5,
    Up = 6,
    Dp = 7,
    Fp = 8,
    Bp = 9,
    Rp = 10,
    Lp = 11,
    U2 = 12,
    D2 = 13,
    F2 = 14,
    B2 = 15,
    R2 = 16,
    L2 = 17,
}

impl MoveCode {
    /// Parse a move string into a MoveCode enum variant
    /// Supports standard notation: U, U', U2, etc.
    pub fn from_str(move_str: &str) -> Result<Self, String> {
        match move_str {
            "U" => Ok(MoveCode::U),
            "D" => Ok(MoveCode::D),
            "F" => Ok(MoveCode::F),
            "B" => Ok(MoveCode::B),
            "R" => Ok(MoveCode::R),
            "L" => Ok(MoveCode::L),
            "U'" => Ok(MoveCode::Up),
            "D'" => Ok(MoveCode::Dp),
            "F'" => Ok(MoveCode::Fp),
            "B'" => Ok(MoveCode::Bp),
            "R'" => Ok(MoveCode::Rp),
            "L'" => Ok(MoveCode::Lp),
            "U2" => Ok(MoveCode::U2),
            "D2" => Ok(MoveCode::D2),
            "F2" => Ok(MoveCode::F2),
            "B2" => Ok(MoveCode::B2),
            "R2" => Ok(MoveCode::R2),
            "L2" => Ok(MoveCode::L2),
            _ => Err(format!("Invalid move: {}", move_str)),
        }
    }

    /// Convert a byte value (0-17) to a MoveCode enum variant
    /// Used for efficient move storage and batch processing
    pub fn from_u8(code: u8) -> Result<Self, String> {
        if code <= 17 {
            Ok(unsafe { std::mem::transmute(code) })
        } else {
            Err(format!("Invalid move code: {}", code))
        }
    }
}

impl OptimizedCube {
    /// Color constants for cube faces (matches standard color scheme)
    /// WHITE=U, YELLOW=D, GREEN=F, BLUE=B, RED=R, ORANGE=L
    pub const WHITE: u8 = 0;
    pub const YELLOW: u8 = 1;
    pub const GREEN: u8 = 2;
    pub const BLUE: u8 = 3;
    pub const RED: u8 = 4;
    pub const ORANGE: u8 = 5;

    /// Create a new cube in solved state
    pub fn new() -> OptimizedCube {
        OptimizedCube::solved()
    }

    /// Convert face ID and position to flat buffer index
    /// Face: 0=U, 1=D, 2=F, 3=B, 4=R, 5=L
    /// Position: 0-8 within face (row-major order)
    /// Returns: absolute index in stickers array (0-53)
    #[inline(always)]
    fn face_index(face: usize, index: usize) -> usize {
        match face {
            0 => index,      // U face: 0-8
            1 => 9 + index,  // D face: 9-17
            2 => 18 + index, // F face: 18-26
            3 => 27 + index, // B face: 27-35
            4 => 36 + index, // R face: 36-44
            5 => 45 + index, // L face: 45-53
            _ => panic!("Invalid face: {}", face),
        }
    }

    /// Face index constants for improved readability
    const U: usize = 0;
    const D: usize = 1;
    const F: usize = 2;
    const B: usize = 3;
    const R: usize = 4;
    const L: usize = 5;

    /// Create a cube in solved state with each face showing its own color
    pub fn solved() -> OptimizedCube {
        let mut stickers = [0u8; 54];

        // Fill each face with its color
        for i in 0..9 {
            stickers[i] = Self::WHITE;
        } // U face
        for i in 9..18 {
            stickers[i] = Self::YELLOW;
        } // D face
        for i in 18..27 {
            stickers[i] = Self::GREEN;
        } // F face
        for i in 27..36 {
            stickers[i] = Self::BLUE;
        } // B face
        for i in 36..45 {
            stickers[i] = Self::RED;
        } // R face
        for i in 45..54 {
            stickers[i] = Self::ORANGE;
        } // L face

        OptimizedCube { stickers }
    }

    /// Get raw pointer to sticker data for WebAssembly/JavaScript interop
    /// Enables zero-copy access from JavaScript
    pub fn ptr(&self) -> *const u8 {
        self.stickers.as_ptr()
    }

    /// Get immutable reference to the sticker array
    pub fn stickers(&self) -> &[u8; 54] {
        &self.stickers
    }

    /// Get mutable reference to the sticker array
    pub fn stickers_mut(&mut self) -> &mut [u8; 54] {
        &mut self.stickers
    }

    /// Apply a single move to the cube using optimized algorithms
    /// Prime moves (X') are implemented as 3 clockwise moves
    /// Double moves (X2) are implemented as 2 clockwise moves
    pub fn apply_move_code(&mut self, move_code: MoveCode) {
        match move_code {
            MoveCode::U => self.apply_u_move(),
            MoveCode::D => self.apply_d_move(),
            MoveCode::F => self.apply_f_move(),
            MoveCode::B => self.apply_b_move(),
            MoveCode::R => self.apply_r_move(),
            MoveCode::L => self.apply_l_move(),
            MoveCode::Up => {
                self.apply_u_move();
                self.apply_u_move();
                self.apply_u_move();
            }
            MoveCode::Dp => {
                self.apply_d_move();
                self.apply_d_move();
                self.apply_d_move();
            }
            MoveCode::Fp => {
                self.apply_f_move();
                self.apply_f_move();
                self.apply_f_move();
            }
            MoveCode::Bp => {
                self.apply_b_move();
                self.apply_b_move();
                self.apply_b_move();
            }
            MoveCode::Rp => {
                self.apply_r_move();
                self.apply_r_move();
                self.apply_r_move();
            }
            MoveCode::Lp => {
                self.apply_l_move();
                self.apply_l_move();
                self.apply_l_move();
            }
            MoveCode::U2 => {
                self.apply_u_move();
                self.apply_u_move();
            }
            MoveCode::D2 => {
                self.apply_d_move();
                self.apply_d_move();
            }
            MoveCode::F2 => {
                self.apply_f_move();
                self.apply_f_move();
            }
            MoveCode::B2 => {
                self.apply_b_move();
                self.apply_b_move();
            }
            MoveCode::R2 => {
                self.apply_r_move();
                self.apply_r_move();
            }
            MoveCode::L2 => {
                self.apply_l_move();
                self.apply_l_move();
            }
        }
    }

    /// Apply U move: rotate upper face 90° clockwise
    /// Also cycles the top row of adjacent faces: F→R→B→L→F
    fn apply_u_move(&mut self) {
        // Rotate U face stickers 90° clockwise
        let temp = self.stickers[0];
        self.stickers[0] = self.stickers[6];
        self.stickers[6] = self.stickers[8];
        self.stickers[8] = self.stickers[2];
        self.stickers[2] = temp;

        let temp = self.stickers[1];
        self.stickers[1] = self.stickers[3];
        self.stickers[3] = self.stickers[7];
        self.stickers[7] = self.stickers[5];
        self.stickers[5] = temp;
        // Cycle top edges of adjacent faces: F[0,1,2] → R[0,1,2] → B[0,1,2] → L[0,1,2] → F[0,1,2]
        let temp = [
            self.stickers[Self::face_index(Self::F, 0)],
            self.stickers[Self::face_index(Self::F, 1)],
            self.stickers[Self::face_index(Self::F, 2)],
        ];

        // R[0,1,2] → F[0,1,2]
        self.stickers[Self::face_index(Self::F, 0)] = self.stickers[Self::face_index(Self::R, 0)];
        self.stickers[Self::face_index(Self::F, 1)] = self.stickers[Self::face_index(Self::R, 1)];
        self.stickers[Self::face_index(Self::F, 2)] = self.stickers[Self::face_index(Self::R, 2)];

        // B[0,1,2] → R[0,1,2]
        self.stickers[Self::face_index(Self::R, 0)] = self.stickers[Self::face_index(Self::B, 0)];
        self.stickers[Self::face_index(Self::R, 1)] = self.stickers[Self::face_index(Self::B, 1)];
        self.stickers[Self::face_index(Self::R, 2)] = self.stickers[Self::face_index(Self::B, 2)];

        // L[0,1,2] → B[0,1,2]
        self.stickers[Self::face_index(Self::B, 0)] = self.stickers[Self::face_index(Self::L, 0)];
        self.stickers[Self::face_index(Self::B, 1)] = self.stickers[Self::face_index(Self::L, 1)];
        self.stickers[Self::face_index(Self::B, 2)] = self.stickers[Self::face_index(Self::L, 2)];

        // temp (old F[0,1,2]) → L[0,1,2]
        self.stickers[Self::face_index(Self::L, 0)] = temp[0];
        self.stickers[Self::face_index(Self::L, 1)] = temp[1];
        self.stickers[Self::face_index(Self::L, 2)] = temp[2];
    }

    /// Apply D move: rotate bottom face 90° clockwise
    /// Also cycles the bottom row of adjacent faces: F→L→B→R→F
    fn apply_d_move(&mut self) {
        // Rotate D face stickers 90° clockwise
        let temp = self.stickers[9];
        self.stickers[9] = self.stickers[15];
        self.stickers[15] = self.stickers[17];
        self.stickers[17] = self.stickers[11];
        self.stickers[11] = temp;

        let temp = self.stickers[10];
        self.stickers[10] = self.stickers[12];
        self.stickers[12] = self.stickers[16];
        self.stickers[16] = self.stickers[14];
        self.stickers[14] = temp;
        // Cycle bottom edges of adjacent faces: F[6,7,8] → L[6,7,8] → B[6,7,8] → R[6,7,8] → F[6,7,8]
        let temp = [
            self.stickers[Self::face_index(Self::F, 6)],
            self.stickers[Self::face_index(Self::F, 7)],
            self.stickers[Self::face_index(Self::F, 8)],
        ];

        // L[6,7,8] → F[6,7,8]
        self.stickers[Self::face_index(Self::F, 6)] = self.stickers[Self::face_index(Self::L, 6)];
        self.stickers[Self::face_index(Self::F, 7)] = self.stickers[Self::face_index(Self::L, 7)];
        self.stickers[Self::face_index(Self::F, 8)] = self.stickers[Self::face_index(Self::L, 8)];

        // B[6,7,8] → L[6,7,8]
        self.stickers[Self::face_index(Self::L, 6)] = self.stickers[Self::face_index(Self::B, 6)];
        self.stickers[Self::face_index(Self::L, 7)] = self.stickers[Self::face_index(Self::B, 7)];
        self.stickers[Self::face_index(Self::L, 8)] = self.stickers[Self::face_index(Self::B, 8)];

        // R[6,7,8] → B[6,7,8]
        self.stickers[Self::face_index(Self::B, 6)] = self.stickers[Self::face_index(Self::R, 6)];
        self.stickers[Self::face_index(Self::B, 7)] = self.stickers[Self::face_index(Self::R, 7)];
        self.stickers[Self::face_index(Self::B, 8)] = self.stickers[Self::face_index(Self::R, 8)];

        // temp (old F[6,7,8]) → R[6,7,8]
        self.stickers[Self::face_index(Self::R, 6)] = temp[0];
        self.stickers[Self::face_index(Self::R, 7)] = temp[1];
        self.stickers[Self::face_index(Self::R, 8)] = temp[2];
    }

    /// Apply F move: rotate front face 90° clockwise
    /// Also cycles edges between U, R, D, L faces in a complex pattern
    fn apply_f_move(&mut self) {
        // Rotate F face stickers 90° clockwise
        let temp = self.stickers[18];
        self.stickers[18] = self.stickers[24];
        self.stickers[24] = self.stickers[26];
        self.stickers[26] = self.stickers[20];
        self.stickers[20] = temp;

        let temp = self.stickers[19];
        self.stickers[19] = self.stickers[21];
        self.stickers[21] = self.stickers[25];
        self.stickers[25] = self.stickers[23];
        self.stickers[23] = temp;
        // Cycle edges: U bottom row → R left column → D top row (reversed) → L right column (reversed) → U
        let temp = [
            self.stickers[Self::face_index(Self::U, 6)],
            self.stickers[Self::face_index(Self::U, 7)],
            self.stickers[Self::face_index(Self::U, 8)],
        ];

        // L right column (reversed) → U bottom row
        self.stickers[Self::face_index(Self::U, 6)] = self.stickers[Self::face_index(Self::L, 8)];
        self.stickers[Self::face_index(Self::U, 7)] = self.stickers[Self::face_index(Self::L, 5)];
        self.stickers[Self::face_index(Self::U, 8)] = self.stickers[Self::face_index(Self::L, 2)];

        // D top row (reversed) → L right column
        self.stickers[Self::face_index(Self::L, 8)] = self.stickers[Self::face_index(Self::D, 2)];
        self.stickers[Self::face_index(Self::L, 5)] = self.stickers[Self::face_index(Self::D, 1)];
        self.stickers[Self::face_index(Self::L, 2)] = self.stickers[Self::face_index(Self::D, 0)];

        // R left column → D top row (reversed)
        self.stickers[Self::face_index(Self::D, 2)] = self.stickers[Self::face_index(Self::R, 0)];
        self.stickers[Self::face_index(Self::D, 1)] = self.stickers[Self::face_index(Self::R, 3)];
        self.stickers[Self::face_index(Self::D, 0)] = self.stickers[Self::face_index(Self::R, 6)];

        // temp (old U bottom row) → R left column
        self.stickers[Self::face_index(Self::R, 0)] = temp[0];
        self.stickers[Self::face_index(Self::R, 3)] = temp[1];
        self.stickers[Self::face_index(Self::R, 6)] = temp[2];
    }

    /// Apply B move: rotate back face 90° clockwise
    /// Also cycles edges between U, L, D, R faces with reversals
    fn apply_b_move(&mut self) {
        // Rotate B face stickers 90° clockwise
        let temp = self.stickers[27];
        self.stickers[27] = self.stickers[33];
        self.stickers[33] = self.stickers[35];
        self.stickers[35] = self.stickers[29];
        self.stickers[29] = temp;

        let temp = self.stickers[28];
        self.stickers[28] = self.stickers[30];
        self.stickers[30] = self.stickers[34];
        self.stickers[34] = self.stickers[32];
        self.stickers[32] = temp;
        // Cycle edges: U top row → R right column → D bottom row (reversed) → L left column (reversed) → U
        let temp = [
            self.stickers[Self::face_index(Self::U, 0)],
            self.stickers[Self::face_index(Self::U, 1)],
            self.stickers[Self::face_index(Self::U, 2)],
        ];

        // R right column → U top row
        self.stickers[Self::face_index(Self::U, 0)] = self.stickers[Self::face_index(Self::R, 2)];
        self.stickers[Self::face_index(Self::U, 1)] = self.stickers[Self::face_index(Self::R, 5)];
        self.stickers[Self::face_index(Self::U, 2)] = self.stickers[Self::face_index(Self::R, 8)];

        // D bottom row (reversed) → R right column
        self.stickers[Self::face_index(Self::R, 2)] = self.stickers[Self::face_index(Self::D, 8)];
        self.stickers[Self::face_index(Self::R, 5)] = self.stickers[Self::face_index(Self::D, 7)];
        self.stickers[Self::face_index(Self::R, 8)] = self.stickers[Self::face_index(Self::D, 6)];

        // L left column (reversed) → D bottom row
        self.stickers[Self::face_index(Self::D, 8)] = self.stickers[Self::face_index(Self::L, 6)];
        self.stickers[Self::face_index(Self::D, 7)] = self.stickers[Self::face_index(Self::L, 3)];
        self.stickers[Self::face_index(Self::D, 6)] = self.stickers[Self::face_index(Self::L, 0)];

        // temp (old U top row) → L left column (reversed)
        self.stickers[Self::face_index(Self::L, 6)] = temp[0];
        self.stickers[Self::face_index(Self::L, 3)] = temp[1];
        self.stickers[Self::face_index(Self::L, 0)] = temp[2];
    }

    /// Apply R move: rotate right face 90° clockwise
    /// Also cycles the right columns of U, F, D faces and left column of B (reversed)
    fn apply_r_move(&mut self) {
        // Rotate R face stickers 90° clockwise
        let temp = self.stickers[36];
        self.stickers[36] = self.stickers[42];
        self.stickers[42] = self.stickers[44];
        self.stickers[44] = self.stickers[38];
        self.stickers[38] = temp;

        let temp = self.stickers[37];
        self.stickers[37] = self.stickers[39];
        self.stickers[39] = self.stickers[43];
        self.stickers[43] = self.stickers[41];
        self.stickers[41] = temp;
        // Cycle right columns: U → F → D → B (reversed) → U
        let temp = [
            self.stickers[Self::face_index(Self::U, 2)],
            self.stickers[Self::face_index(Self::U, 5)],
            self.stickers[Self::face_index(Self::U, 8)],
        ];

        // F right column → U right column
        self.stickers[Self::face_index(Self::U, 2)] = self.stickers[Self::face_index(Self::F, 2)];
        self.stickers[Self::face_index(Self::U, 5)] = self.stickers[Self::face_index(Self::F, 5)];
        self.stickers[Self::face_index(Self::U, 8)] = self.stickers[Self::face_index(Self::F, 8)];

        // D right column → F right column
        self.stickers[Self::face_index(Self::F, 2)] = self.stickers[Self::face_index(Self::D, 2)];
        self.stickers[Self::face_index(Self::F, 5)] = self.stickers[Self::face_index(Self::D, 5)];
        self.stickers[Self::face_index(Self::F, 8)] = self.stickers[Self::face_index(Self::D, 8)];

        // B left column (reversed) → D right column
        self.stickers[Self::face_index(Self::D, 2)] = self.stickers[Self::face_index(Self::B, 6)];
        self.stickers[Self::face_index(Self::D, 5)] = self.stickers[Self::face_index(Self::B, 3)];
        self.stickers[Self::face_index(Self::D, 8)] = self.stickers[Self::face_index(Self::B, 0)];

        // temp (old U right column) → B left column (reversed)
        self.stickers[Self::face_index(Self::B, 6)] = temp[0];
        self.stickers[Self::face_index(Self::B, 3)] = temp[1];
        self.stickers[Self::face_index(Self::B, 0)] = temp[2];
    }

    /// Apply L move: rotate left face 90° clockwise
    /// Also cycles the left columns of U, B (reversed), D, F faces
    fn apply_l_move(&mut self) {
        // Rotate L face stickers 90° clockwise
        let temp = self.stickers[45];
        self.stickers[45] = self.stickers[51];
        self.stickers[51] = self.stickers[53];
        self.stickers[53] = self.stickers[47];
        self.stickers[47] = temp;

        let temp = self.stickers[46];
        self.stickers[46] = self.stickers[48];
        self.stickers[48] = self.stickers[52];
        self.stickers[52] = self.stickers[50];
        self.stickers[50] = temp;
        // Cycle left columns: U → B (reversed) → D → F → U
        let temp = [
            self.stickers[Self::face_index(Self::U, 0)],
            self.stickers[Self::face_index(Self::U, 3)],
            self.stickers[Self::face_index(Self::U, 6)],
        ];

        // B right column (reversed) → U left column
        self.stickers[Self::face_index(Self::U, 0)] = self.stickers[Self::face_index(Self::B, 8)];
        self.stickers[Self::face_index(Self::U, 3)] = self.stickers[Self::face_index(Self::B, 5)];
        self.stickers[Self::face_index(Self::U, 6)] = self.stickers[Self::face_index(Self::B, 2)];

        // D left column → B right column (reversed)
        self.stickers[Self::face_index(Self::B, 8)] = self.stickers[Self::face_index(Self::D, 0)];
        self.stickers[Self::face_index(Self::B, 5)] = self.stickers[Self::face_index(Self::D, 3)];
        self.stickers[Self::face_index(Self::B, 2)] = self.stickers[Self::face_index(Self::D, 6)];

        // F left column → D left column
        self.stickers[Self::face_index(Self::D, 0)] = self.stickers[Self::face_index(Self::F, 0)];
        self.stickers[Self::face_index(Self::D, 3)] = self.stickers[Self::face_index(Self::F, 3)];
        self.stickers[Self::face_index(Self::D, 6)] = self.stickers[Self::face_index(Self::F, 6)];

        // temp (old U left column) → F left column
        self.stickers[Self::face_index(Self::F, 0)] = temp[0];
        self.stickers[Self::face_index(Self::F, 3)] = temp[1];
        self.stickers[Self::face_index(Self::F, 6)] = temp[2];
    }

    /// Apply multiple moves from a byte array (efficient batch processing)
    pub fn apply_moves(&mut self, moves: &[u8]) {
        for &move_byte in moves {
            if let Ok(move_code) = MoveCode::from_u8(move_byte) {
                self.apply_move_code(move_code);
            }
        }
    }

    /// Apply a single move from string notation (e.g., "U", "R'", "F2")
    pub fn apply_move(&mut self, move_str: &str) -> Result<(), String> {
        let move_code = MoveCode::from_str(move_str)?;
        self.apply_move_code(move_code);
        Ok(())
    }

    /// Apply a scramble sequence from string (space-separated moves)
    pub fn apply_scramble(&mut self, scramble: &str) -> Result<(), String> {
        for move_str in scramble.split_whitespace() {
            if !move_str.is_empty() {
                self.apply_move(move_str)?;
            }
        }
        Ok(())
    }

    /// Parse scramble string into byte array for efficient batch processing
    pub fn parse_scramble(scramble: &str) -> Result<Vec<u8>, String> {
        let mut moves = Vec::new();
        for move_str in scramble.split_whitespace() {
            if !move_str.is_empty() {
                let move_code = MoveCode::from_str(move_str)?;
                moves.push(move_code as u8);
            }
        }
        Ok(moves)
    }

    /// Get face axis for WCA validation (0=UD, 1=FB, 2=RL)
    fn get_face_axis(face: u8) -> u8 {
        match face {
            0 | 1 => 0, // U/D axis
            2 | 3 => 1, // F/B axis
            4 | 5 => 2, // R/L axis
            _ => 255,   // Invalid
        }
    }

    /// Check if a move is valid according to WCA rules
    fn is_valid_move(
        move_code: u8,
        previous_move: Option<u8>,
        before_previous_move: Option<u8>,
    ) -> bool {
        // Check if move code is valid (0-17)
        if move_code > 17 {
            return false;
        }

        let current_face = move_code % 6;

        if let Some(prev_move) = previous_move {
            let previous_face = prev_move % 6;

            // Rule 1: Don't allow consecutive moves on the same face
            if current_face == previous_face {
                return false;
            }

            // Rule 2: WCA axis rule - if last two moves were on the same axis,
            // don't allow a third consecutive move on that axis
            if let Some(before_prev_move) = before_previous_move {
                let before_previous_face = before_prev_move % 6;
                let current_axis = Self::get_face_axis(current_face);
                let previous_axis = Self::get_face_axis(previous_face);
                let before_previous_axis = Self::get_face_axis(before_previous_face);

                if previous_axis == before_previous_axis && current_axis == previous_axis {
                    return false;
                }
            }
        }

        true
    }

    /// Generate a random scramble of the specified length
    /// Follows WCA rules: no consecutive moves on same face, no 3 moves on same axis
    pub fn generate_random_scramble(length: usize) -> Vec<u8> {
        let mut moves = Vec::with_capacity(length);

        static mut SEED: u64 = 0;
        static mut INITIALIZED: bool = false;

        // Initialize seed with random value on first use
        unsafe {
            if !INITIALIZED {
                #[cfg(target_arch = "wasm32")]
                {
                    SEED = (js_sys::Math::random() * (u64::MAX as f64)) as u64;
                    if SEED == 0 {
                        SEED = 12345;
                    }
                }
                #[cfg(not(target_arch = "wasm32"))]
                {
                    use std::time::{SystemTime, UNIX_EPOCH};
                    SEED = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_nanos() as u64;
                    if SEED == 0 {
                        SEED = 12345;
                    }
                }
                INITIALIZED = true;
            }
        }

        let mut attempts = 0;
        const MAX_ATTEMPTS: usize = 1000; // Prevent infinite loops

        while moves.len() < length && attempts < MAX_ATTEMPTS {
            unsafe {
                SEED = SEED.wrapping_mul(1103515245).wrapping_add(12345);
                let move_code = ((SEED >> 16) % 18) as u8;

                let previous_move = if moves.len() > 0 {
                    Some(moves[moves.len() - 1])
                } else {
                    None
                };
                let before_previous_move = if moves.len() > 1 {
                    Some(moves[moves.len() - 2])
                } else {
                    None
                };

                if Self::is_valid_move(move_code, previous_move, before_previous_move) {
                    moves.push(move_code);
                }
            }

            attempts += 1;
        }

        moves
    }

    /// Validate a scramble sequence according to WCA rules
    pub fn validate_scramble(moves: &[u8]) -> bool {
        for i in 0..moves.len() {
            let current_move = moves[i];
            let previous_move = if i > 0 { Some(moves[i - 1]) } else { None };
            let before_previous_move = if i > 1 { Some(moves[i - 2]) } else { None };

            if !Self::is_valid_move(current_move, previous_move, before_previous_move) {
                return false;
            }
        }

        true
    }

    /// Generate a competition-standard scramble (20 moves)
    pub fn generate_competition_scramble() -> Vec<u8> {
        Self::generate_random_scramble(20)
    }

    /// Generate a practice scramble (15 moves)
    pub fn generate_practice_scramble() -> Vec<u8> {
        Self::generate_random_scramble(15)
    }

    /// Generate a long scramble (25 moves)
    pub fn generate_long_scramble() -> Vec<u8> {
        Self::generate_random_scramble(25)
    }

    /// Convert move codes to string representation for display
    pub fn moves_to_string(moves: &[u8]) -> String {
        moves
            .iter()
            .filter_map(|&move_code| match move_code {
                0 => Some("U"),
                1 => Some("D"),
                2 => Some("F"),
                3 => Some("B"),
                4 => Some("R"),
                5 => Some("L"),
                6 => Some("U'"),
                7 => Some("D'"),
                8 => Some("F'"),
                9 => Some("B'"),
                10 => Some("R'"),
                11 => Some("L'"),
                12 => Some("U2"),
                13 => Some("D2"),
                14 => Some("F2"),
                15 => Some("B2"),
                16 => Some("R2"),
                17 => Some("L2"),
                _ => None,
            })
            .collect::<Vec<&str>>()
            .join(" ")
    }

    /// Check if the cube is in solved state
    pub fn is_solved(&self) -> bool {
        let solved = Self::solved();
        self.stickers == solved.stickers
    }

    /// Get a face as a slice of 9 stickers (0-8 indices)
    /// Returns empty slice for invalid face index
    pub fn get_face(&self, face: usize) -> &[u8] {
        match face {
            0 => &self.stickers[0..9],   // U
            1 => &self.stickers[9..18],  // D
            2 => &self.stickers[18..27], // F
            3 => &self.stickers[27..36], // B
            4 => &self.stickers[36..45], // R
            5 => &self.stickers[45..54], // L
            _ => &[],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cube_initialization() {
        let cube = OptimizedCube::new();
        let solved = OptimizedCube::solved();
        assert_eq!(cube.stickers, solved.stickers);
        assert!(cube.is_solved());
    }

    #[test]
    fn test_solved_cube_structure() {
        let cube = OptimizedCube::solved();

        // Check U face (white)
        for i in 0..9 {
            assert_eq!(cube.stickers[i], OptimizedCube::WHITE);
        }

        // Check D face (yellow)
        for i in 9..18 {
            assert_eq!(cube.stickers[i], OptimizedCube::YELLOW);
        }

        // Check F face (green)
        for i in 18..27 {
            assert_eq!(cube.stickers[i], OptimizedCube::GREEN);
        }

        // Check B face (blue)
        for i in 27..36 {
            assert_eq!(cube.stickers[i], OptimizedCube::BLUE);
        }

        // Check R face (red)
        for i in 36..45 {
            assert_eq!(cube.stickers[i], OptimizedCube::RED);
        }

        // Check L face (orange)
        for i in 45..54 {
            assert_eq!(cube.stickers[i], OptimizedCube::ORANGE);
        }
    }

    #[test]
    fn test_move_parsing() {
        assert_eq!(MoveCode::from_str("U").unwrap(), MoveCode::U);
        assert_eq!(MoveCode::from_str("D'").unwrap(), MoveCode::Dp);
        assert_eq!(MoveCode::from_str("F2").unwrap(), MoveCode::F2);
        assert_eq!(MoveCode::from_str("R'").unwrap(), MoveCode::Rp);

        assert!(MoveCode::from_str("X").is_err());
        assert!(MoveCode::from_str("U3").is_err());
    }

    #[test]
    fn test_move_code_conversion() {
        for i in 0u8..18u8 {
            let move_code = MoveCode::from_u8(i).unwrap();
            assert_eq!(move_code as u8, i);
        }

        assert!(MoveCode::from_u8(18).is_err());
        assert!(MoveCode::from_u8(255).is_err());
    }

    #[test]
    fn test_basic_u_move() {
        let mut cube = OptimizedCube::solved();
        let original = cube.clone();

        // Apply U move
        cube.apply_move_code(MoveCode::U);
        assert!(!cube.is_solved());

        // Apply U' to reverse
        cube.apply_move_code(MoveCode::Up);
        assert_eq!(cube.stickers, original.stickers);
        assert!(cube.is_solved());
    }

    #[test]
    fn test_u_move_properties() {
        let mut cube = OptimizedCube::solved();
        let original = cube.clone();

        // U followed by U' should return to original
        cube.apply_move_code(MoveCode::U);
        cube.apply_move_code(MoveCode::Up);
        assert_eq!(cube.stickers, original.stickers);

        // Reset cube
        cube = OptimizedCube::solved();

        // Four U moves should return to original
        for _ in 0..4 {
            cube.apply_move_code(MoveCode::U);
        }
        assert_eq!(cube.stickers, original.stickers);

        // Reset cube
        cube = OptimizedCube::solved();

        // U2 should equal two U moves
        let mut cube2 = OptimizedCube::solved();
        cube.apply_move_code(MoveCode::U2);
        cube2.apply_move_code(MoveCode::U);
        cube2.apply_move_code(MoveCode::U);
        assert_eq!(cube.stickers, cube2.stickers);
    }

    #[test]
    fn test_all_face_moves() {
        let moves = [
            MoveCode::U,
            MoveCode::D,
            MoveCode::F,
            MoveCode::B,
            MoveCode::R,
            MoveCode::L,
        ];

        for move_code in moves {
            let mut cube = OptimizedCube::solved();
            let original = cube.clone();

            // Apply move four times should return to original
            for _ in 0..4 {
                cube.apply_move_code(move_code);
            }
            assert_eq!(
                cube.stickers, original.stickers,
                "Move {:?} failed 4x test",
                move_code
            );
        }
    }

    #[test]
    fn test_prime_moves() {
        let move_pairs = [
            (MoveCode::U, MoveCode::Up),
            (MoveCode::D, MoveCode::Dp),
            (MoveCode::F, MoveCode::Fp),
            (MoveCode::B, MoveCode::Bp),
            (MoveCode::R, MoveCode::Rp),
            (MoveCode::L, MoveCode::Lp),
        ];

        for (normal, prime) in move_pairs {
            let mut cube = OptimizedCube::solved();
            let original = cube.clone();

            // Normal + prime should cancel out
            cube.apply_move_code(normal);
            cube.apply_move_code(prime);
            assert_eq!(
                cube.stickers, original.stickers,
                "Move pair {:?}/{:?} failed",
                normal, prime
            );

            // Prime + normal should cancel out
            cube = OptimizedCube::solved();
            cube.apply_move_code(prime);
            cube.apply_move_code(normal);
            assert_eq!(
                cube.stickers, original.stickers,
                "Reverse move pair {:?}/{:?} failed",
                prime, normal
            );
        }
    }

    #[test]
    fn test_double_moves() {
        let move_pairs = [
            (MoveCode::U, MoveCode::U2),
            (MoveCode::D, MoveCode::D2),
            (MoveCode::F, MoveCode::F2),
            (MoveCode::B, MoveCode::B2),
            (MoveCode::R, MoveCode::R2),
            (MoveCode::L, MoveCode::L2),
        ];

        for (normal, double) in move_pairs {
            let mut cube1 = OptimizedCube::solved();
            let mut cube2 = OptimizedCube::solved();

            // Double move should equal two normal moves
            cube1.apply_move_code(double);
            cube2.apply_move_code(normal);
            cube2.apply_move_code(normal);
            assert_eq!(
                cube1.stickers, cube2.stickers,
                "Double move {:?} doesn't equal 2x{:?}",
                double, normal
            );

            // Two double moves should return to original
            let original = OptimizedCube::solved();
            cube1.apply_move_code(double);
            assert_eq!(
                cube1.stickers, original.stickers,
                "2x{:?} should return to solved",
                double
            );
        }
    }

    #[test]
    fn test_center_preservation() {
        let mut cube = OptimizedCube::solved();
        let centers = [4, 13, 22, 31, 40, 49]; // Center positions for each face
        let center_colors = [
            cube.stickers[4],  // U center
            cube.stickers[13], // D center
            cube.stickers[22], // F center
            cube.stickers[31], // B center
            cube.stickers[40], // R center
            cube.stickers[49], // L center
        ];

        // Apply various moves - but not all faces in sequence
        // because that would be like a full cube rotation
        let moves = [MoveCode::U, MoveCode::R, MoveCode::Up, MoveCode::Rp];
        for move_code in moves {
            cube.apply_move_code(move_code);
        }

        // Centers should remain unchanged
        for (i, &center_pos) in centers.iter().enumerate() {
            assert_eq!(
                cube.stickers[center_pos], center_colors[i],
                "Center at position {} changed from {} to {}",
                center_pos, center_colors[i], cube.stickers[center_pos]
            );
        }
    }

    #[test]
    fn test_scramble_parsing() {
        let scramble = "R U R' U' R U R' F' R U R' U' R' F R";
        let moves = OptimizedCube::parse_scramble(scramble).unwrap();

        assert!(!moves.is_empty());

        // Apply parsed moves
        let mut cube = OptimizedCube::solved();
        cube.apply_moves(&moves);
        assert!(!cube.is_solved());
    }

    #[test]
    fn test_scramble_application() {
        let mut cube = OptimizedCube::solved();
        let scramble = "R U R' U'";

        cube.apply_scramble(scramble).unwrap();
        assert!(!cube.is_solved());

        // Apply inverse to solve
        let inverse = "U R U' R'";
        cube.apply_scramble(inverse).unwrap();
        assert!(cube.is_solved());
    }

    #[test]
    fn test_batch_vs_individual_moves() {
        let scramble = "R U R' U' R U R' F' R U R' U' R' F R";
        let moves = OptimizedCube::parse_scramble(scramble).unwrap();

        let mut cube1 = OptimizedCube::solved();
        let mut cube2 = OptimizedCube::solved();

        // Apply as batch
        cube1.apply_moves(&moves);

        // Apply individually
        cube2.apply_scramble(scramble).unwrap();

        assert_eq!(cube1.stickers, cube2.stickers);
    }

    #[test]
    fn test_get_face() {
        let cube = OptimizedCube::solved();

        assert_eq!(cube.get_face(0), &[0; 9]); // U face - all white
        assert_eq!(cube.get_face(1), &[1; 9]); // D face - all yellow
        assert_eq!(cube.get_face(2), &[2; 9]); // F face - all green
        assert_eq!(cube.get_face(3), &[3; 9]); // B face - all blue
        assert_eq!(cube.get_face(4), &[4; 9]); // R face - all red
        assert_eq!(cube.get_face(5), &[5; 9]); // L face - all orange

        assert_eq!(cube.get_face(6), &[]); // Invalid face
    }

    #[test]
    fn test_sticker_access() {
        let cube = OptimizedCube::solved();

        // Test zero-copy access
        let ptr = cube.ptr();
        assert!(!ptr.is_null());

        // Test stickers array access
        let stickers = cube.stickers();
        assert_eq!(stickers.len(), 54);

        // Test mutable access
        let mut cube = OptimizedCube::solved();
        let stickers_mut = cube.stickers_mut();
        stickers_mut[0] = 5;
        assert_eq!(cube.stickers[0], 5);
    }

    #[test]
    fn test_random_scramble_generation() {
        let scramble1 = OptimizedCube::generate_random_scramble(25);
        let scramble2 = OptimizedCube::generate_random_scramble(25);

        assert_eq!(scramble1.len(), 25);
        assert_eq!(scramble2.len(), 25);

        // Should be different (very high probability)
        assert_ne!(scramble1, scramble2);

        // All moves should be valid
        for &move_code in &scramble1 {
            assert!(MoveCode::from_u8(move_code).is_ok());
        }
    }

    #[test]
    fn test_complex_move_sequence() {
        let mut cube = OptimizedCube::solved();

        // Apply R U R' U' (simple 4-move sequence)
        let sequence = "R U R' U'";
        cube.apply_scramble(sequence).unwrap();
        assert!(
            !cube.is_solved(),
            "After R U R' U', cube should not be solved"
        );

        // Apply the inverse: U R U' R'
        let inverse = "U R U' R'";
        cube.apply_scramble(inverse).unwrap();
        assert!(
            cube.is_solved(),
            "After applying inverse sequence, cube should be solved"
        );
    }

    #[test]
    fn test_face_rotation_correctness() {
        let mut cube = OptimizedCube::solved();

        // Test U move specifically - check that corners rotate correctly
        let before_corners = [
            cube.stickers[0],
            cube.stickers[2],
            cube.stickers[8],
            cube.stickers[6], // U face corners
        ];

        cube.apply_move_code(MoveCode::U);

        let after_corners = [
            cube.stickers[0],
            cube.stickers[2],
            cube.stickers[8],
            cube.stickers[6],
        ];

        // After U move, corners should have rotated clockwise
        assert_eq!(after_corners[0], before_corners[3]); // 0 <- 6
        assert_eq!(after_corners[1], before_corners[0]); // 2 <- 0
        assert_eq!(after_corners[2], before_corners[1]); // 8 <- 2
        assert_eq!(after_corners[3], before_corners[2]); // 6 <- 8
    }

    #[test]
    fn test_stress_random_scrambles() {
        for _ in 0..100 {
            let scramble = OptimizedCube::generate_random_scramble(50);
            let mut cube = OptimizedCube::solved();
            cube.apply_moves(&scramble);

            // Cube should not crash and should be in a valid state
            // (We can't easily test for correctness without a reference implementation)
            assert_eq!(cube.stickers().len(), 54);
        }
    }

    #[test]
    fn test_r_move_cancellation() {
        let mut cube = OptimizedCube::solved();
        let original = cube.clone();

        // Apply R move
        cube.apply_move_code(MoveCode::R);
        assert!(!cube.is_solved(), "After R move, cube should not be solved");

        // Apply R' move
        cube.apply_move_code(MoveCode::Rp);
        assert_eq!(
            cube.stickers, original.stickers,
            "R followed by R' should return to original state"
        );
        assert!(cube.is_solved(), "After R + R', cube should be solved");

        // Test with string interface
        cube = OptimizedCube::solved();
        cube.apply_move("R").unwrap();
        cube.apply_move("R'").unwrap();
        assert!(
            cube.is_solved(),
            "String interface: R + R' should return to solved"
        );
    }

    #[test]
    fn test_all_move_cancellations() {
        let move_pairs = [
            (MoveCode::U, MoveCode::Up),
            (MoveCode::D, MoveCode::Dp),
            (MoveCode::F, MoveCode::Fp),
            (MoveCode::B, MoveCode::Bp),
            (MoveCode::R, MoveCode::Rp),
            (MoveCode::L, MoveCode::Lp),
        ];

        for (normal, prime) in move_pairs {
            let mut cube = OptimizedCube::solved();
            let original = cube.clone();

            // Normal + prime should cancel
            cube.apply_move_code(normal);
            cube.apply_move_code(prime);
            assert_eq!(
                cube.stickers, original.stickers,
                "Move {:?} + {:?} should cancel",
                normal, prime
            );
        }
    }

    #[test]
    fn test_move_correctness() {
        // Test each move with detailed expected vs actual behavior
        println!("\n=== COMPREHENSIVE MOVE TESTS ===");

        test_u_move_detailed();
        test_d_move_detailed();
        test_f_move_detailed();
        test_b_move_detailed();
        test_r_move_detailed();
        test_l_move_detailed();
    }

    fn test_u_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- U MOVE TEST ---");

        // Apply U move
        cube.apply_u_move();

        // Check U face rotation (should rotate clockwise)
        let u_face = cube.get_face(0);
        println!("U face after U: {:?}", u_face);
        println!("Expected: All 0s (white), but rotated positions");

        // Check adjacent faces top edges
        let f_face = cube.get_face(2); // F face
        let r_face = cube.get_face(4); // R face
        let b_face = cube.get_face(3); // B face
        let l_face = cube.get_face(5); // L face

        println!(
            "F top edge (0,1,2): [{}, {}, {}] - Expected: [4, 4, 4] (red from R)",
            f_face[0], f_face[1], f_face[2]
        );
        println!(
            "R top edge (0,1,2): [{}, {}, {}] - Expected: [3, 3, 3] (blue from B)",
            r_face[0], r_face[1], r_face[2]
        );
        println!(
            "B top edge (0,1,2): [{}, {}, {}] - Expected: [5, 5, 5] (orange from L)",
            b_face[0], b_face[1], b_face[2]
        );
        println!(
            "L top edge (0,1,2): [{}, {}, {}] - Expected: [2, 2, 2] (green from F)",
            l_face[0], l_face[1], l_face[2]
        );

        // Verify cycle: F→R→B→L→F
        assert_eq!(
            [f_face[0], f_face[1], f_face[2]],
            [4, 4, 4],
            "F should get R's top edge"
        );
        assert_eq!(
            [r_face[0], r_face[1], r_face[2]],
            [3, 3, 3],
            "R should get B's top edge"
        );
        assert_eq!(
            [b_face[0], b_face[1], b_face[2]],
            [5, 5, 5],
            "B should get L's top edge"
        );
        assert_eq!(
            [l_face[0], l_face[1], l_face[2]],
            [2, 2, 2],
            "L should get F's top edge"
        );
    }

    fn test_d_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- D MOVE TEST ---");

        cube.apply_d_move();

        // Check D face rotation
        let d_face = cube.get_face(1);
        println!("D face after D: {:?}", d_face);

        // Check adjacent faces bottom edges
        let f_face = cube.get_face(2);
        let l_face = cube.get_face(5);
        let b_face = cube.get_face(3);
        let r_face = cube.get_face(4);

        println!(
            "F bottom edge (6,7,8): [{}, {}, {}] - Expected: [5, 5, 5] (orange from L)",
            f_face[6], f_face[7], f_face[8]
        );
        println!(
            "L bottom edge (6,7,8): [{}, {}, {}] - Expected: [3, 3, 3] (blue from B)",
            l_face[6], l_face[7], l_face[8]
        );
        println!(
            "B bottom edge (6,7,8): [{}, {}, {}] - Expected: [4, 4, 4] (red from R)",
            b_face[6], b_face[7], b_face[8]
        );
        println!(
            "R bottom edge (6,7,8): [{}, {}, {}] - Expected: [2, 2, 2] (green from F)",
            r_face[6], r_face[7], r_face[8]
        );

        // Note: B face might need reversal
        println!("Note: B face values might be reversed due to orientation");
    }

    fn test_f_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- F MOVE TEST ---");

        cube.apply_f_move();

        // Check F face rotation
        let f_face = cube.get_face(2);
        println!("F face after F: {:?}", f_face);

        // Check edge cycles
        let u_face = cube.get_face(0);
        let r_face = cube.get_face(4);
        let d_face = cube.get_face(1);
        let l_face = cube.get_face(5);

        println!(
            "U bottom edge (6,7,8): [{}, {}, {}] - Expected: [5, 5, 5] (orange from L right)",
            u_face[6], u_face[7], u_face[8]
        );
        println!(
            "R left edge (0,3,6): [{}, {}, {}] - Expected: [0, 0, 0] (white from U bottom)",
            r_face[0], r_face[3], r_face[6]
        );
        println!(
            "D top edge (0,1,2): [{}, {}, {}] - Expected: [4, 4, 4] (red from R left)",
            d_face[0], d_face[1], d_face[2]
        );
        println!(
            "L right edge (2,5,8): [{}, {}, {}] - Expected: [1, 1, 1] (yellow from D top)",
            l_face[2], l_face[5], l_face[8]
        );

        // Verify cycle: U bottom → R left → D top → L right → U bottom
    }

    fn test_b_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- B MOVE TEST ---");

        cube.apply_b_move();

        let u_face = cube.get_face(0);
        let l_face = cube.get_face(5);
        let d_face = cube.get_face(1);
        let r_face = cube.get_face(4);

        println!(
            "U top edge (0,1,2): [{}, {}, {}] - Expected: [4, 4, 4] (red from R right)",
            u_face[0], u_face[1], u_face[2]
        );
        println!(
            "L left edge (0,3,6): [{}, {}, {}] - Expected: [0, 0, 0] (white from U top)",
            l_face[0], l_face[3], l_face[6]
        );
        println!(
            "D bottom edge (6,7,8): [{}, {}, {}] - Expected: [5, 5, 5] (orange from L left)",
            d_face[6], d_face[7], d_face[8]
        );
        println!(
            "R right edge (2,5,8): [{}, {}, {}] - Expected: [1, 1, 1] (yellow from D bottom)",
            r_face[2], r_face[5], r_face[8]
        );

        // Verify cycle: U top → L left → D bottom → R right → U top
    }

    fn test_r_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- R MOVE TEST ---");

        cube.apply_r_move();

        // Check R face rotation
        let r_face = cube.get_face(4);
        println!("R face after R: {:?}", r_face);
        println!("Expected: All 4s (red), but rotated clockwise");

        let u_face = cube.get_face(0);
        let f_face = cube.get_face(2);
        let d_face = cube.get_face(1);
        let b_face = cube.get_face(3);

        println!(
            "U right edge (2,5,8): [{}, {}, {}] - Expected: [2, 2, 2] (green from F right)",
            u_face[2], u_face[5], u_face[8]
        );
        println!(
            "F right edge (2,5,8): [{}, {}, {}] - Expected: [1, 1, 1] (yellow from D right)",
            f_face[2], f_face[5], f_face[8]
        );
        println!(
            "D right edge (2,5,8): [{}, {}, {}] - Expected: [3, 3, 3] (blue from B left)",
            d_face[2], d_face[5], d_face[8]
        );
        println!(
            "B left edge (0,3,6): [{}, {}, {}] - Expected: [0, 0, 0] (white from U right)",
            b_face[0], b_face[3], b_face[6]
        );

        println!("Note: B face might need reversal handling");

        // Verify cycle: U right → F right → D right → B left → U right
    }

    fn test_l_move_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- L MOVE TEST ---");

        cube.apply_l_move();

        let u_face = cube.get_face(0);
        let b_face = cube.get_face(3);
        let d_face = cube.get_face(1);
        let f_face = cube.get_face(2);

        println!(
            "U left edge (0,3,6): [{}, {}, {}] - Expected: [3, 3, 3] (blue from B right)",
            u_face[0], u_face[3], u_face[6]
        );
        println!(
            "B right edge (2,5,8): [{}, {}, {}] - Expected: [1, 1, 1] (yellow from D left)",
            b_face[2], b_face[5], b_face[8]
        );
        println!(
            "D left edge (0,3,6): [{}, {}, {}] - Expected: [2, 2, 2] (green from F left)",
            d_face[0], d_face[3], d_face[6]
        );
        println!(
            "F left edge (0,3,6): [{}, {}, {}] - Expected: [0, 0, 0] (white from U left)",
            f_face[0], f_face[3], f_face[6]
        );

        println!("Note: B face might need reversal handling");

        // Verify cycle: U left → B right → D left → F left → U left
    }

    #[test]
    fn test_edge_rotation_patterns() {
        println!("\n=== EDGE ROTATION PATTERN TESTS ===");
        println!("Testing if edges maintain their internal order when cycling");

        test_u_edge_rotation();
        test_r_edge_rotation();
        test_f_edge_rotation();
    }

    fn create_patterned_cube() -> OptimizedCube {
        let mut cube = OptimizedCube::solved();

        // Create distinct patterns for face edges to test rotation
        // Each edge gets a unique pattern so we can track how they move

        // F face (18-26): Green base with numbered edges
        // Layout: 18 19 20
        //         21 22 23
        //         24 25 26
        cube.stickers[18] = 100; // top-left
        cube.stickers[19] = 101; // top-center
        cube.stickers[20] = 102; // top-right
        cube.stickers[21] = 103; // middle-left
        cube.stickers[23] = 104; // middle-right
        cube.stickers[24] = 105; // bottom-left
        cube.stickers[25] = 106; // bottom-center
        cube.stickers[26] = 107; // bottom-right

        // R face (36-44): Red base with numbered edges
        cube.stickers[36] = 200; // top-left
        cube.stickers[37] = 201; // top-center
        cube.stickers[38] = 202; // top-right
        cube.stickers[39] = 203; // middle-left
        cube.stickers[41] = 204; // middle-right
        cube.stickers[42] = 205; // bottom-left
        cube.stickers[43] = 206; // bottom-center
        cube.stickers[44] = 207; // bottom-right

        // B face (27-35): Blue base with numbered edges
        cube.stickers[27] = 50; // top-left
        cube.stickers[28] = 51; // top-center
        cube.stickers[29] = 52; // top-right
        cube.stickers[30] = 53; // middle-left
        cube.stickers[32] = 54; // middle-right
        cube.stickers[33] = 55; // bottom-left
        cube.stickers[34] = 56; // bottom-center
        cube.stickers[35] = 57; // bottom-right

        // L face (45-53): Orange base with numbered edges
        cube.stickers[45] = 150; // top-left
        cube.stickers[46] = 151; // top-center
        cube.stickers[47] = 152; // top-right
        cube.stickers[48] = 153; // middle-left
        cube.stickers[50] = 154; // middle-right
        cube.stickers[51] = 155; // bottom-left
        cube.stickers[52] = 156; // bottom-center
        cube.stickers[53] = 157; // bottom-right

        // U face (0-8): White base with numbered edges
        cube.stickers[0] = 10; // top-left
        cube.stickers[1] = 11; // top-center
        cube.stickers[2] = 12; // top-right
        cube.stickers[3] = 13; // middle-left
        cube.stickers[5] = 14; // middle-right
        cube.stickers[6] = 15; // bottom-left
        cube.stickers[7] = 16; // bottom-center
        cube.stickers[8] = 17; // bottom-right

        // D face (9-17): Yellow base with numbered edges
        cube.stickers[9] = 60; // top-left
        cube.stickers[10] = 61; // top-center
        cube.stickers[11] = 62; // top-right
        cube.stickers[12] = 63; // middle-left
        cube.stickers[14] = 64; // middle-right
        cube.stickers[15] = 65; // bottom-left
        cube.stickers[16] = 66; // bottom-center
        cube.stickers[17] = 67; // bottom-right

        cube
    }

    fn test_u_edge_rotation() {
        let mut cube = create_patterned_cube();
        println!("\n--- U EDGE ROTATION TEST ---");

        // Record initial adjacent face top edges (indices 0,1,2 for each face)
        let f_initial = [cube.stickers[18], cube.stickers[19], cube.stickers[20]]; // F top row
        let r_initial = [cube.stickers[36], cube.stickers[37], cube.stickers[38]]; // R top row
        let b_initial = [cube.stickers[27], cube.stickers[28], cube.stickers[29]]; // B top row
        let l_initial = [cube.stickers[45], cube.stickers[46], cube.stickers[47]]; // L top row

        println!("Before U move:");
        println!("F top edge: {:?}", f_initial);
        println!("R top edge: {:?}", r_initial);
        println!("B top edge: {:?}", b_initial);
        println!("L top edge: {:?}", l_initial);

        cube.apply_u_move();

        let f_after = [cube.stickers[18], cube.stickers[19], cube.stickers[20]];
        let r_after = [cube.stickers[36], cube.stickers[37], cube.stickers[38]];
        let b_after = [cube.stickers[27], cube.stickers[28], cube.stickers[29]];
        let l_after = [cube.stickers[45], cube.stickers[46], cube.stickers[47]];

        println!("\nAfter U move:");
        println!(
            "F top edge: {:?} - Should be R's pattern: {:?}",
            f_after, r_initial
        );
        println!(
            "R top edge: {:?} - Should be B's pattern: {:?}",
            r_after, b_initial
        );
        println!(
            "B top edge: {:?} - Should be L's pattern: {:?}",
            b_after, l_initial
        );
        println!(
            "L top edge: {:?} - Should be F's pattern: {:?}",
            l_after, f_initial
        );

        // Check if cycle is correct: F←R←B←L←F
        println!("\nEdge cycle check (F←R←B←L←F):");
        println!("F gets R: {}", f_after == r_initial);
        println!("R gets B: {}", r_after == b_initial);
        println!("B gets L: {}", b_after == l_initial);
        println!("L gets F: {}", l_after == f_initial);
    }

    fn test_r_edge_rotation() {
        let mut cube = create_patterned_cube();
        println!("\n--- R EDGE ROTATION TEST ---");

        // Record initial right columns with patterns
        let u_initial = [cube.stickers[2], cube.stickers[5], cube.stickers[8]]; // U right column
        let f_initial = [cube.stickers[20], cube.stickers[23], cube.stickers[26]]; // F right column
        let d_initial = [cube.stickers[11], cube.stickers[14], cube.stickers[17]]; // D right column
        let b_initial = [cube.stickers[27], cube.stickers[30], cube.stickers[33]]; // B left column

        println!("Before R move:");
        println!("U right edge: {:?}", u_initial);
        println!("F right edge: {:?}", f_initial);
        println!("D right edge: {:?}", d_initial);
        println!("B left edge: {:?}", b_initial);

        cube.apply_r_move();

        let u_after = [cube.stickers[2], cube.stickers[5], cube.stickers[8]];
        let f_after = [cube.stickers[20], cube.stickers[23], cube.stickers[26]];
        let d_after = [cube.stickers[11], cube.stickers[14], cube.stickers[17]];
        let b_after = [cube.stickers[27], cube.stickers[30], cube.stickers[33]];

        println!("\nAfter R move:");
        println!(
            "U right edge: {:?} - Expected from F: {:?}",
            u_after, f_initial
        );
        println!(
            "F right edge: {:?} - Expected from D: {:?}",
            f_after, d_initial
        );
        println!(
            "D right edge: {:?} - Expected from B: {:?}",
            d_after, b_initial
        );
        println!(
            "B left edge: {:?} - Expected from U: {:?}",
            b_after, u_initial
        );

        // Test expected cycle: U←F←D←B←U (with possible B reversal)
        let b_reversed = [b_initial[2], b_initial[1], b_initial[0]];
        let u_reversed = [u_initial[2], u_initial[1], u_initial[0]];

        println!("\nEdge cycle check:");
        println!("U gets F: {}", u_after == f_initial);
        println!("F gets D: {}", f_after == d_initial);
        println!("D gets B: {}", d_after == b_initial);
        println!("D gets B: {}", d_after == b_reversed);
        println!("B gets U: {}", b_after == u_initial);
        println!("B gets U: {}", b_after == u_reversed);
    }

    fn test_f_edge_rotation() {
        let mut cube = create_patterned_cube();
        println!("\n--- F EDGE ROTATION TEST ---");

        let u_initial = [cube.stickers[6], cube.stickers[7], cube.stickers[8]]; // U bottom row
        let r_initial = [cube.stickers[36], cube.stickers[39], cube.stickers[42]]; // R left column
        let d_initial = [cube.stickers[9], cube.stickers[10], cube.stickers[11]]; // D top row
        let l_initial = [cube.stickers[47], cube.stickers[50], cube.stickers[53]]; // L right column

        println!("Before F move:");
        println!("U bottom edge: {:?}", u_initial);
        println!("R left edge: {:?}", r_initial);
        println!("D top edge: {:?}", d_initial);
        println!("L right edge: {:?}", l_initial);

        cube.apply_f_move();

        let u_after = [cube.stickers[6], cube.stickers[7], cube.stickers[8]];
        let r_after = [cube.stickers[36], cube.stickers[39], cube.stickers[42]];
        let d_after = [cube.stickers[9], cube.stickers[10], cube.stickers[11]];
        let l_after = [cube.stickers[47], cube.stickers[50], cube.stickers[53]];

        println!("\nAfter F move:");
        println!(
            "U bottom edge: {:?} - Expected from L: {:?}",
            u_after, l_initial
        );
        println!(
            "R left edge: {:?} - Expected from U: {:?}",
            r_after, u_initial
        );
        println!(
            "D top edge: {:?} - Expected from R: {:?}",
            d_after, r_initial
        );
        println!(
            "L right edge: {:?} - Expected from D: {:?}",
            l_after, d_initial
        );

        // Test cycle: U←L←D←R←U (with possible orientation changes)
        let l_reversed = [l_initial[2], l_initial[1], l_initial[0]];
        let r_reversed = [r_initial[2], r_initial[1], r_initial[0]];
        let d_reversed = [d_initial[2], d_initial[1], d_initial[0]];
        let u_reversed = [u_initial[2], u_initial[1], u_initial[0]];

        println!("\nEdge cycle check (with orientation variants):");
        println!("U gets L: {}", u_after == l_initial);
        println!("U gets L: {}", u_after == l_reversed);
        println!("R gets U: {}", r_after == u_initial);
        println!("R gets U: {}", r_after == u_reversed);
        println!("D gets R: {}", d_after == r_initial);
        println!("D gets R: {}", d_after == r_reversed);
        println!("L gets D: {}", l_after == d_initial);
        println!("L gets D: {}", l_after == d_reversed);
    }

    #[test]
    fn test_face_rotation_direction() {
        println!("\n=== FACE ROTATION DIRECTION TESTS ===");
        println!("Testing if faces rotate clockwise when viewed from outside");

        test_r_face_rotation_direction();
        test_b_face_rotation_direction();
        test_d_face_b_reversal();
        test_r_face_b_reversal();
    }

    fn test_r_face_rotation_direction() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- R FACE ROTATION DIRECTION TEST ---");

        // Create a distinct pattern on R face to see rotation
        cube.stickers[36] = 10; // top-left
        cube.stickers[37] = 11; // top-center
        cube.stickers[38] = 12; // top-right
        cube.stickers[39] = 13; // middle-left
        cube.stickers[40] = 4; // center stays red
        cube.stickers[41] = 14; // middle-right
        cube.stickers[42] = 15; // bottom-left
        cube.stickers[43] = 16; // bottom-center
        cube.stickers[44] = 17; // bottom-right

        println!("R face before R move:");
        println!(
            "[{} {} {}]",
            cube.stickers[36], cube.stickers[37], cube.stickers[38]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[39], cube.stickers[40], cube.stickers[41]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        cube.apply_r_move();

        println!("R face after R move:");
        println!(
            "[{} {} {}]",
            cube.stickers[36], cube.stickers[37], cube.stickers[38]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[39], cube.stickers[40], cube.stickers[41]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        // For clockwise rotation: 10 should move to position 38 (top-left → top-right)
        println!("Expected clockwise rotation: 10 at position 38, 12 at position 44, etc.");
        println!(
            "Position 38 has: {} (should be 10 for clockwise)",
            cube.stickers[38]
        );
        println!(
            "Position 44 has: {} (should be 12 for clockwise)",
            cube.stickers[44]
        );
        println!(
            "Position 42 has: {} (should be 17 for clockwise)",
            cube.stickers[42]
        );
        println!(
            "Position 36 has: {} (should be 15 for clockwise)",
            cube.stickers[36]
        );

        // Test if it's actually clockwise
        let is_clockwise = cube.stickers[38] == 10
            && cube.stickers[44] == 12
            && cube.stickers[42] == 17
            && cube.stickers[36] == 15;
        println!("R face rotates clockwise: {}", is_clockwise);
    }

    fn test_b_face_rotation_direction() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- B FACE ROTATION DIRECTION TEST ---");

        // Create pattern on B face
        cube.stickers[27] = 20; // top-left
        cube.stickers[28] = 21; // top-center
        cube.stickers[29] = 22; // top-right
        cube.stickers[30] = 23; // middle-left
        cube.stickers[31] = 3; // center stays blue
        cube.stickers[32] = 24; // middle-right
        cube.stickers[33] = 25; // bottom-left
        cube.stickers[34] = 26; // bottom-center
        cube.stickers[35] = 27; // bottom-right

        println!("B face before B move:");
        println!(
            "[{} {} {}]",
            cube.stickers[27], cube.stickers[28], cube.stickers[29]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[30], cube.stickers[31], cube.stickers[32]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );

        cube.apply_b_move();

        println!("B face after B move:");
        println!(
            "[{} {} {}]",
            cube.stickers[27], cube.stickers[28], cube.stickers[29]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[30], cube.stickers[31], cube.stickers[32]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );

        // For clockwise rotation when viewed from outside (behind the cube)
        println!("Expected clockwise rotation: 20 at position 29, 22 at position 35, etc.");
        println!(
            "Position 29 has: {} (should be 20 for clockwise)",
            cube.stickers[29]
        );
        println!(
            "Position 35 has: {} (should be 22 for clockwise)",
            cube.stickers[35]
        );

        let is_clockwise = cube.stickers[29] == 20
            && cube.stickers[35] == 22
            && cube.stickers[33] == 27
            && cube.stickers[27] == 25;
        println!("B face rotates clockwise: {}", is_clockwise);
    }

    fn test_d_face_b_reversal() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- D MOVE B FACE REVERSAL TEST ---");

        // Create distinct patterns on bottom edges
        cube.stickers[24] = 100;
        cube.stickers[25] = 101;
        cube.stickers[26] = 102; // F bottom
        cube.stickers[51] = 110;
        cube.stickers[52] = 111;
        cube.stickers[53] = 112; // L bottom
        cube.stickers[33] = 50;
        cube.stickers[34] = 51;
        cube.stickers[35] = 52; // B bottom
        cube.stickers[42] = 150;
        cube.stickers[43] = 151;
        cube.stickers[44] = 152; // R bottom

        println!("Before D move:");
        println!(
            "F bottom: [{}, {}, {}]",
            cube.stickers[24], cube.stickers[25], cube.stickers[26]
        );
        println!(
            "L bottom: [{}, {}, {}]",
            cube.stickers[51], cube.stickers[52], cube.stickers[53]
        );
        println!(
            "B bottom: [{}, {}, {}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );
        println!(
            "R bottom: [{}, {}, {}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        cube.apply_d_move();

        println!("After D move:");
        println!(
            "F bottom: [{}, {}, {}]",
            cube.stickers[24], cube.stickers[25], cube.stickers[26]
        );
        println!(
            "L bottom: [{}, {}, {}]",
            cube.stickers[51], cube.stickers[52], cube.stickers[53]
        );
        println!(
            "B bottom: [{}, {}, {}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );
        println!(
            "R bottom: [{}, {}, {}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        // Expected cycle: F←L←B←R←F
        println!("Expected cycle F←L←B←R←F:");
        println!(
            "F should get L: [110,111,112] → actual: [{},{},{}]",
            cube.stickers[24], cube.stickers[25], cube.stickers[26]
        );

        // B face reversal check - when going from L to B, should the order reverse?
        println!(
            "L should get B: [50,51,52] or [52,51,50] → actual: [{},{},{}]",
            cube.stickers[51], cube.stickers[52], cube.stickers[53]
        );

        let f_correct =
            [cube.stickers[24], cube.stickers[25], cube.stickers[26]] == [110, 111, 112];
        let l_normal = [cube.stickers[51], cube.stickers[52], cube.stickers[53]] == [50, 51, 52];
        let l_reversed = [cube.stickers[51], cube.stickers[52], cube.stickers[53]] == [52, 51, 50];

        println!("F gets L correctly: {}", f_correct);
        println!("L gets B (normal order): {}", l_normal);
        println!("L gets B (reversed order): {}", l_reversed);
    }

    fn test_r_face_b_reversal() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- R MOVE B FACE REVERSAL TEST ---");

        // Create patterns on right edges
        cube.stickers[2] = 10;
        cube.stickers[5] = 11;
        cube.stickers[8] = 12; // U right
        cube.stickers[20] = 20;
        cube.stickers[23] = 21;
        cube.stickers[26] = 22; // F right
        cube.stickers[11] = 30;
        cube.stickers[14] = 31;
        cube.stickers[17] = 32; // D right
        cube.stickers[27] = 40;
        cube.stickers[30] = 41;
        cube.stickers[33] = 42; // B left (from R perspective)

        println!("Before R move:");
        println!(
            "U right: [{}, {}, {}]",
            cube.stickers[2], cube.stickers[5], cube.stickers[8]
        );
        println!(
            "F right: [{}, {}, {}]",
            cube.stickers[20], cube.stickers[23], cube.stickers[26]
        );
        println!(
            "D right: [{}, {}, {}]",
            cube.stickers[11], cube.stickers[14], cube.stickers[17]
        );
        println!(
            "B left:  [{}, {}, {}]",
            cube.stickers[27], cube.stickers[30], cube.stickers[33]
        );

        cube.apply_r_move();

        println!("After R move:");
        println!(
            "U right: [{}, {}, {}]",
            cube.stickers[2], cube.stickers[5], cube.stickers[8]
        );
        println!(
            "F right: [{}, {}, {}]",
            cube.stickers[20], cube.stickers[23], cube.stickers[26]
        );
        println!(
            "D right: [{}, {}, {}]",
            cube.stickers[11], cube.stickers[14], cube.stickers[17]
        );
        println!(
            "B left:  [{}, {}, {}]",
            cube.stickers[27], cube.stickers[30], cube.stickers[33]
        );

        // Expected cycle: U←F←D←B←U
        println!("Expected cycle U←F←D←B←U:");

        // When going from D to B, should it reverse?
        println!(
            "D should get B: [40,41,42] or [42,41,40] → actual: [{},{},{}]",
            cube.stickers[11], cube.stickers[14], cube.stickers[17]
        );

        // When going from B to U, should it reverse?
        println!(
            "B should get U: [10,11,12] or [12,11,10] → actual: [{},{},{}]",
            cube.stickers[27], cube.stickers[30], cube.stickers[33]
        );

        let d_normal = [cube.stickers[11], cube.stickers[14], cube.stickers[17]] == [40, 41, 42];
        let d_reversed = [cube.stickers[11], cube.stickers[14], cube.stickers[17]] == [42, 41, 40];
        let b_normal = [cube.stickers[27], cube.stickers[30], cube.stickers[33]] == [10, 11, 12];
        let b_reversed = [cube.stickers[27], cube.stickers[30], cube.stickers[33]] == [12, 11, 10];

        println!("D gets B (normal): {}", d_normal);
        println!("D gets B: {}", d_reversed);
        println!("B gets U (normal): {}", b_normal);
        println!("B gets U: {}", b_reversed);
    }

    #[test]
    fn test_all_face_rotations_comprehensive() {
        println!("\n=== COMPREHENSIVE ALL FACE ROTATION TESTS ===");
        println!("Testing all faces in all directions (CW, CCW, 180°)");

        test_all_faces_clockwise();
        test_all_faces_counterclockwise();
        test_all_faces_double();
        test_all_edge_cycles();
    }

    fn create_test_pattern_for_face(cube: &mut OptimizedCube, face_start: usize, base_value: u8) {
        // Create a unique pattern for each face position
        for i in 0..9 {
            if i == 4 {
                // Keep center as original color
                continue;
            }
            cube.stickers[face_start + i] = base_value + i as u8;
        }
    }

    fn print_face_pattern(cube: &OptimizedCube, face_start: usize, face_name: &str) {
        println!("{} face:", face_name);
        println!(
            "[{} {} {}]",
            cube.stickers[face_start],
            cube.stickers[face_start + 1],
            cube.stickers[face_start + 2]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[face_start + 3],
            cube.stickers[face_start + 4],
            cube.stickers[face_start + 5]
        );
        println!(
            "[{} {} {}]",
            cube.stickers[face_start + 6],
            cube.stickers[face_start + 7],
            cube.stickers[face_start + 8]
        );
    }

    fn check_clockwise_rotation(before: &[u8; 9], after: &[u8; 9], face_name: &str) -> bool {
        // For clockwise rotation: 0→2→8→6→0 and 1→5→7→3→1
        let corners_correct = after[2] == before[0]
            && after[8] == before[2]
            && after[6] == before[8]
            && after[0] == before[6];
        let edges_correct = after[5] == before[1]
            && after[7] == before[5]
            && after[3] == before[7]
            && after[1] == before[3];
        let center_same = after[4] == before[4];

        println!("{} clockwise check:", face_name);
        println!("  Corners (0→2→8→6→0): {}", corners_correct);
        println!("  Edges (1→5→7→3→1): {}", edges_correct);
        println!("  Center unchanged: {}", center_same);

        corners_correct && edges_correct && center_same
    }

    fn test_all_faces_clockwise() {
        println!("\n--- ALL FACES CLOCKWISE ROTATION TEST ---");

        let faces = [
            (0, "U", "apply_u_move"),
            (9, "D", "apply_d_move"),
            (18, "F", "apply_f_move"),
            (27, "B", "apply_b_move"),
            (36, "R", "apply_r_move"),
            (45, "L", "apply_l_move"),
        ];

        for (face_start, face_name, _) in faces.iter() {
            let mut cube = OptimizedCube::solved();
            create_test_pattern_for_face(&mut cube, *face_start, 10);

            // Store pattern before move
            let mut before = [0u8; 9];
            for i in 0..9 {
                before[i] = cube.stickers[face_start + i];
            }

            println!("\nTesting {} face clockwise rotation:", face_name);
            print_face_pattern(&cube, *face_start, &format!("{} before", face_name));

            // Apply the move
            match face_name {
                &"U" => cube.apply_u_move(),
                &"D" => cube.apply_d_move(),
                &"F" => cube.apply_f_move(),
                &"B" => cube.apply_b_move(),
                &"R" => cube.apply_r_move(),
                &"L" => cube.apply_l_move(),
                _ => {}
            }

            let mut after = [0u8; 9];
            for i in 0..9 {
                after[i] = cube.stickers[face_start + i];
            }

            print_face_pattern(&cube, *face_start, &format!("{} after", face_name));
            let is_clockwise = check_clockwise_rotation(&before, &after, face_name);
            println!(
                "  {} CLOCKWISE ROTATION: {}",
                face_name,
                if is_clockwise { "✅ PASS" } else { "❌ FAIL" }
            );
        }
    }

    fn test_all_faces_counterclockwise() {
        println!("\n--- ALL FACES COUNTERCLOCKWISE ROTATION TEST ---");

        let faces = [
            (0, "U", "U'"),
            (9, "D", "D'"),
            (18, "F", "F'"),
            (27, "B", "B'"),
            (36, "R", "R'"),
            (45, "L", "L'"),
        ];

        for (face_start, face_name, move_name) in faces.iter() {
            let mut cube = OptimizedCube::solved();
            create_test_pattern_for_face(&mut cube, *face_start, 20);

            let mut before = [0u8; 9];
            for i in 0..9 {
                before[i] = cube.stickers[face_start + i];
            }

            println!(
                "\nTesting {} face counterclockwise rotation ({}):",
                face_name, move_name
            );
            print_face_pattern(&cube, *face_start, &format!("{} before", face_name));

            // Apply prime move (3 regular moves = 1 counterclockwise)
            match face_name {
                &"U" => {
                    cube.apply_u_move();
                    cube.apply_u_move();
                    cube.apply_u_move();
                }
                &"D" => {
                    cube.apply_d_move();
                    cube.apply_d_move();
                    cube.apply_d_move();
                }
                &"F" => {
                    cube.apply_f_move();
                    cube.apply_f_move();
                    cube.apply_f_move();
                }
                &"B" => {
                    cube.apply_b_move();
                    cube.apply_b_move();
                    cube.apply_b_move();
                }
                &"R" => {
                    cube.apply_r_move();
                    cube.apply_r_move();
                    cube.apply_r_move();
                }
                &"L" => {
                    cube.apply_l_move();
                    cube.apply_l_move();
                    cube.apply_l_move();
                }
                _ => {}
            }

            let mut after = [0u8; 9];
            for i in 0..9 {
                after[i] = cube.stickers[face_start + i];
            }

            print_face_pattern(&cube, *face_start, &format!("{} after", face_name));

            // For counterclockwise: 0→6→8→2→0 and 1→3→7→5→1
            let corners_correct = after[6] == before[0]
                && after[8] == before[6]
                && after[2] == before[8]
                && after[0] == before[2];
            let edges_correct = after[3] == before[1]
                && after[7] == before[3]
                && after[5] == before[7]
                && after[1] == before[5];
            let center_same = after[4] == before[4];

            println!("  Counterclockwise check:");
            println!("    Corners (0→6→8→2→0): {}", corners_correct);
            println!("    Edges (1→3→7→5→1): {}", edges_correct);
            println!("    Center unchanged: {}", center_same);

            let is_counterclockwise = corners_correct && edges_correct && center_same;
            println!(
                "  {} COUNTERCLOCKWISE ROTATION: {}",
                face_name,
                if is_counterclockwise {
                    "✅ PASS"
                } else {
                    "❌ FAIL"
                }
            );
        }
    }

    fn test_all_faces_double() {
        println!("\n--- ALL FACES DOUBLE ROTATION TEST ---");

        let faces = [
            (0, "U", "U2"),
            (9, "D", "D2"),
            (18, "F", "F2"),
            (27, "B", "B2"),
            (36, "R", "R2"),
            (45, "L", "L2"),
        ];

        for (face_start, face_name, move_name) in faces.iter() {
            let mut cube = OptimizedCube::solved();
            create_test_pattern_for_face(&mut cube, *face_start, 30);

            let mut before = [0u8; 9];
            for i in 0..9 {
                before[i] = cube.stickers[face_start + i];
            }

            println!(
                "\nTesting {} face double rotation ({}):",
                face_name, move_name
            );
            print_face_pattern(&cube, *face_start, &format!("{} before", face_name));

            // Apply double move (2 regular moves)
            match face_name {
                &"U" => {
                    cube.apply_u_move();
                    cube.apply_u_move();
                }
                &"D" => {
                    cube.apply_d_move();
                    cube.apply_d_move();
                }
                &"F" => {
                    cube.apply_f_move();
                    cube.apply_f_move();
                }
                &"B" => {
                    cube.apply_b_move();
                    cube.apply_b_move();
                }
                &"R" => {
                    cube.apply_r_move();
                    cube.apply_r_move();
                }
                &"L" => {
                    cube.apply_l_move();
                    cube.apply_l_move();
                }
                _ => {}
            }

            let mut after = [0u8; 9];
            for i in 0..9 {
                after[i] = cube.stickers[face_start + i];
            }

            print_face_pattern(&cube, *face_start, &format!("{} after", face_name));

            // For 180° rotation: 0↔8, 1↔7, 2↔6, 3↔5, center unchanged
            let rotation_correct = after[8] == before[0]
                && after[0] == before[8]
                && after[7] == before[1]
                && after[1] == before[7]
                && after[6] == before[2]
                && after[2] == before[6]
                && after[5] == before[3]
                && after[3] == before[5]
                && after[4] == before[4];

            println!("  180° rotation check: {}", rotation_correct);
            println!(
                "  {} DOUBLE ROTATION: {}",
                face_name,
                if rotation_correct {
                    "✅ PASS"
                } else {
                    "❌ FAIL"
                }
            );
        }
    }

    fn test_all_edge_cycles() {
        println!("\n--- ALL EDGE CYCLE TESTS ---");

        // Test each move's edge cycling with distinct patterns
        test_u_edge_cycle();
        test_d_edge_cycle();
        test_f_edge_cycle();
        test_b_edge_cycle();
        test_r_edge_cycle();
        test_l_edge_cycle();
    }

    fn test_u_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nU move edge cycle test:");

        // Set distinct patterns on top edges
        cube.stickers[18] = 100;
        cube.stickers[19] = 101;
        cube.stickers[20] = 102; // F top
        cube.stickers[36] = 110;
        cube.stickers[37] = 111;
        cube.stickers[38] = 112; // R top
        cube.stickers[27] = 120;
        cube.stickers[28] = 121;
        cube.stickers[29] = 122; // B top
        cube.stickers[45] = 130;
        cube.stickers[46] = 131;
        cube.stickers[47] = 132; // L top

        cube.apply_u_move();

        let f_correct =
            [cube.stickers[18], cube.stickers[19], cube.stickers[20]] == [110, 111, 112];
        let r_correct =
            [cube.stickers[36], cube.stickers[37], cube.stickers[38]] == [120, 121, 122];
        let b_correct =
            [cube.stickers[27], cube.stickers[28], cube.stickers[29]] == [130, 131, 132];
        let l_correct =
            [cube.stickers[45], cube.stickers[46], cube.stickers[47]] == [100, 101, 102];

        println!("  F←R: {}", f_correct);
        println!("  R←B: {}", r_correct);
        println!("  B←L: {}", b_correct);
        println!("  L←F: {}", l_correct);
        println!(
            "  U EDGE CYCLE: {}",
            if f_correct && r_correct && b_correct && l_correct {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    fn test_d_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nD move edge cycle test:");

        // Set patterns on bottom edges
        cube.stickers[24] = 100;
        cube.stickers[25] = 101;
        cube.stickers[26] = 102; // F bottom
        cube.stickers[51] = 110;
        cube.stickers[52] = 111;
        cube.stickers[53] = 112; // L bottom
        cube.stickers[33] = 120;
        cube.stickers[34] = 121;
        cube.stickers[35] = 122; // B bottom
        cube.stickers[42] = 130;
        cube.stickers[43] = 131;
        cube.stickers[44] = 132; // R bottom

        cube.apply_d_move();

        let f_gets_l = [cube.stickers[24], cube.stickers[25], cube.stickers[26]] == [110, 111, 112];
        let l_gets_b = [cube.stickers[51], cube.stickers[52], cube.stickers[53]] == [120, 121, 122];
        let b_gets_r = [cube.stickers[33], cube.stickers[34], cube.stickers[35]] == [130, 131, 132];
        let r_gets_f = [cube.stickers[42], cube.stickers[43], cube.stickers[44]] == [100, 101, 102];

        println!("  F←L: {}", f_gets_l);
        println!("  L←B: {}", l_gets_b);
        println!("  B←R: {}", b_gets_r);
        println!("  R←F: {}", r_gets_f);
        println!(
            "  D EDGE CYCLE: {}",
            if f_gets_l && l_gets_b && b_gets_r && r_gets_f {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    fn test_f_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nF move edge cycle test:");

        cube.stickers[6] = 100;
        cube.stickers[7] = 101;
        cube.stickers[8] = 102; // U bottom
        cube.stickers[36] = 110;
        cube.stickers[39] = 111;
        cube.stickers[42] = 112; // R left
        cube.stickers[9] = 120;
        cube.stickers[10] = 121;
        cube.stickers[11] = 122; // D top
        cube.stickers[47] = 130;
        cube.stickers[50] = 131;
        cube.stickers[53] = 132; // L right

        cube.apply_f_move();

        let u_gets_l = [cube.stickers[6], cube.stickers[7], cube.stickers[8]] == [130, 131, 132];
        let r_gets_u = [cube.stickers[36], cube.stickers[39], cube.stickers[42]] == [100, 101, 102];
        let d_gets_r = [cube.stickers[9], cube.stickers[10], cube.stickers[11]] == [110, 111, 112];
        let l_gets_d = [cube.stickers[47], cube.stickers[50], cube.stickers[53]] == [120, 121, 122];

        println!("  U←L: {}", u_gets_l);
        println!("  R←U: {}", r_gets_u);
        println!("  D←R: {}", d_gets_r);
        println!("  L←D: {}", l_gets_d);
        println!(
            "  F EDGE CYCLE: {}",
            if u_gets_l && r_gets_u && d_gets_r && l_gets_d {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    fn test_b_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nB move edge cycle test:");

        cube.stickers[0] = 100;
        cube.stickers[1] = 101;
        cube.stickers[2] = 102; // U top
        cube.stickers[45] = 110;
        cube.stickers[48] = 111;
        cube.stickers[51] = 112; // L left
        cube.stickers[15] = 120;
        cube.stickers[16] = 121;
        cube.stickers[17] = 122; // D bottom
        cube.stickers[38] = 130;
        cube.stickers[41] = 131;
        cube.stickers[44] = 132; // R right

        cube.apply_b_move();

        let u_gets_r = [cube.stickers[0], cube.stickers[1], cube.stickers[2]] == [130, 131, 132];
        let l_gets_u = [cube.stickers[45], cube.stickers[48], cube.stickers[51]] == [100, 101, 102];
        let d_gets_l = [cube.stickers[15], cube.stickers[16], cube.stickers[17]] == [110, 111, 112];
        let r_gets_d = [cube.stickers[38], cube.stickers[41], cube.stickers[44]] == [120, 121, 122];

        println!("  U←R: {}", u_gets_r);
        println!("  L←U: {}", l_gets_u);
        println!("  D←L: {}", d_gets_l);
        println!("  R←D: {}", r_gets_d);
        println!(
            "  B EDGE CYCLE: {}",
            if u_gets_r && l_gets_u && d_gets_l && r_gets_d {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    fn test_r_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nR move edge cycle test:");

        cube.stickers[2] = 100;
        cube.stickers[5] = 101;
        cube.stickers[8] = 102; // U right
        cube.stickers[20] = 110;
        cube.stickers[23] = 111;
        cube.stickers[26] = 112; // F right
        cube.stickers[11] = 120;
        cube.stickers[14] = 121;
        cube.stickers[17] = 122; // D right
        cube.stickers[27] = 130;
        cube.stickers[30] = 131;
        cube.stickers[33] = 132; // B left

        cube.apply_r_move();

        let u_gets_f = [cube.stickers[2], cube.stickers[5], cube.stickers[8]] == [110, 111, 112];
        let f_gets_d = [cube.stickers[20], cube.stickers[23], cube.stickers[26]] == [120, 121, 122];
        let d_gets_b = [cube.stickers[11], cube.stickers[14], cube.stickers[17]] == [130, 131, 132];
        let b_gets_u = [cube.stickers[27], cube.stickers[30], cube.stickers[33]] == [100, 101, 102];

        // Check for reversal
        let d_gets_b_rev =
            [cube.stickers[11], cube.stickers[14], cube.stickers[17]] == [132, 131, 130];
        let b_gets_u_rev =
            [cube.stickers[27], cube.stickers[30], cube.stickers[33]] == [102, 101, 100];

        println!("  U←F: {}", u_gets_f);
        println!("  F←D: {}", f_gets_d);
        println!("  D←B (normal): {}", d_gets_b);
        println!("  D←B: {}", d_gets_b_rev);
        println!("  B←U (normal): {}", b_gets_u);
        println!("  B←U: {}", b_gets_u_rev);

        let cycle_correct =
            u_gets_f && f_gets_d && (d_gets_b || d_gets_b_rev) && (b_gets_u || b_gets_u_rev);
        println!(
            "  R EDGE CYCLE: {}",
            if cycle_correct {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    fn test_l_edge_cycle() {
        let mut cube = OptimizedCube::solved();
        println!("\nL move edge cycle test:");

        cube.stickers[0] = 100;
        cube.stickers[3] = 101;
        cube.stickers[6] = 102; // U left
        cube.stickers[29] = 110;
        cube.stickers[32] = 111;
        cube.stickers[35] = 112; // B right
        cube.stickers[9] = 120;
        cube.stickers[12] = 121;
        cube.stickers[15] = 122; // D left
        cube.stickers[18] = 130;
        cube.stickers[21] = 131;
        cube.stickers[24] = 132; // F left

        cube.apply_l_move();

        let u_gets_b = [cube.stickers[0], cube.stickers[3], cube.stickers[6]] == [110, 111, 112];
        let b_gets_d = [cube.stickers[29], cube.stickers[32], cube.stickers[35]] == [120, 121, 122];
        let d_gets_f = [cube.stickers[9], cube.stickers[12], cube.stickers[15]] == [130, 131, 132];
        let f_gets_u = [cube.stickers[18], cube.stickers[21], cube.stickers[24]] == [100, 101, 102];

        // Check for reversal
        let u_gets_b_rev =
            [cube.stickers[0], cube.stickers[3], cube.stickers[6]] == [112, 111, 110];
        let b_gets_d_rev =
            [cube.stickers[29], cube.stickers[32], cube.stickers[35]] == [122, 121, 120];

        println!("  U←B (normal): {}", u_gets_b);
        println!("  U←B: {}", u_gets_b_rev);
        println!("  B←D: {}", b_gets_d);
        println!("  B←D: {}", b_gets_d_rev);
        println!("  D←F: {}", d_gets_f);
        println!("  F←U: {}", f_gets_u);

        let cycle_correct =
            (u_gets_b || u_gets_b_rev) && (b_gets_d || b_gets_d_rev) && d_gets_f && f_gets_u;
        println!(
            "  L EDGE CYCLE: {}",
            if cycle_correct {
                "✅ PASS"
            } else {
                "❌ FAIL"
            }
        );
    }

    #[test]
    fn test_edge_mapping_issues() {
        println!("\n=== DETAILED EDGE MAPPING TESTS ===");
        println!("Testing specific edge positions for D, L, F, B moves");

        test_d_edge_mapping_detailed();
        test_l_edge_mapping_detailed();
        test_f_edge_mapping_detailed();
        test_b_edge_mapping_detailed();
    }

    fn test_d_edge_mapping_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- D MOVE DETAILED EDGE MAPPING ---");

        // Set specific values for each edge position to track exactly what happens
        // F bottom edge (24,25,26)
        cube.stickers[24] = 201;
        cube.stickers[25] = 202;
        cube.stickers[26] = 203;

        // L bottom edge (51,52,53)
        cube.stickers[51] = 211;
        cube.stickers[52] = 212;
        cube.stickers[53] = 213;

        // B bottom edge (33,34,35)
        cube.stickers[33] = 221;
        cube.stickers[34] = 222;
        cube.stickers[35] = 223;

        // R bottom edge (42,43,44)
        cube.stickers[42] = 231;
        cube.stickers[43] = 232;
        cube.stickers[44] = 233;

        println!("Before D move:");
        println!(
            "F bottom [24,25,26]: [{},{},{}]",
            cube.stickers[24], cube.stickers[25], cube.stickers[26]
        );
        println!(
            "L bottom [51,52,53]: [{},{},{}]",
            cube.stickers[51], cube.stickers[52], cube.stickers[53]
        );
        println!(
            "B bottom [33,34,35]: [{},{},{}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );
        println!(
            "R bottom [42,43,44]: [{},{},{}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        cube.apply_d_move();

        println!("After D move:");
        println!(
            "F bottom [24,25,26]: [{},{},{}]",
            cube.stickers[24], cube.stickers[25], cube.stickers[26]
        );
        println!(
            "L bottom [51,52,53]: [{},{},{}]",
            cube.stickers[51], cube.stickers[52], cube.stickers[53]
        );
        println!(
            "B bottom [33,34,35]: [{},{},{}]",
            cube.stickers[33], cube.stickers[34], cube.stickers[35]
        );
        println!(
            "R bottom [42,43,44]: [{},{},{}]",
            cube.stickers[42], cube.stickers[43], cube.stickers[44]
        );

        println!("Expected cycle: F←L←B←R←F");
        println!("F should get L: [211,212,213]");
        println!("L should get B: [221,222,223] or [223,222,221]");
        println!("B should get R: [231,232,233] or [233,232,231]");
        println!("R should get F: [201,202,203]");
    }

    fn test_l_edge_mapping_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- L MOVE DETAILED EDGE MAPPING ---");

        // U left column (0,3,6)
        cube.stickers[0] = 101;
        cube.stickers[3] = 102;
        cube.stickers[6] = 103;

        // B right column (29,32,35)
        cube.stickers[29] = 111;
        cube.stickers[32] = 112;
        cube.stickers[35] = 113;

        // D left column (9,12,15)
        cube.stickers[9] = 121;
        cube.stickers[12] = 122;
        cube.stickers[15] = 123;

        // F left column (18,21,24)
        cube.stickers[18] = 131;
        cube.stickers[21] = 132;
        cube.stickers[24] = 133;

        println!("Before L move:");
        println!(
            "U left [0,3,6]:   [{},{},{}]",
            cube.stickers[0], cube.stickers[3], cube.stickers[6]
        );
        println!(
            "B right [29,32,35]: [{},{},{}]",
            cube.stickers[29], cube.stickers[32], cube.stickers[35]
        );
        println!(
            "D left [9,12,15]:  [{},{},{}]",
            cube.stickers[9], cube.stickers[12], cube.stickers[15]
        );
        println!(
            "F left [18,21,24]: [{},{},{}]",
            cube.stickers[18], cube.stickers[21], cube.stickers[24]
        );

        cube.apply_l_move();

        println!("After L move:");
        println!(
            "U left [0,3,6]:   [{},{},{}]",
            cube.stickers[0], cube.stickers[3], cube.stickers[6]
        );
        println!(
            "B right [29,32,35]: [{},{},{}]",
            cube.stickers[29], cube.stickers[32], cube.stickers[35]
        );
        println!(
            "D left [9,12,15]:  [{},{},{}]",
            cube.stickers[9], cube.stickers[12], cube.stickers[15]
        );
        println!(
            "F left [18,21,24]: [{},{},{}]",
            cube.stickers[18], cube.stickers[21], cube.stickers[24]
        );

        println!("Check which edges moved where and if they're reversed");
    }

    fn test_f_edge_mapping_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- F MOVE DETAILED EDGE MAPPING ---");

        // U bottom row (6,7,8)
        cube.stickers[6] = 161;
        cube.stickers[7] = 162;
        cube.stickers[8] = 163;

        // R left column (36,39,42)
        cube.stickers[36] = 171;
        cube.stickers[39] = 172;
        cube.stickers[42] = 173;

        // D top row (9,10,11)
        cube.stickers[9] = 181;
        cube.stickers[10] = 182;
        cube.stickers[11] = 183;

        // L right column (47,50,53)
        cube.stickers[47] = 191;
        cube.stickers[50] = 192;
        cube.stickers[53] = 193;

        println!("Before F move:");
        println!(
            "U bottom [6,7,8]:   [{},{},{}]",
            cube.stickers[6], cube.stickers[7], cube.stickers[8]
        );
        println!(
            "R left [36,39,42]:  [{},{},{}]",
            cube.stickers[36], cube.stickers[39], cube.stickers[42]
        );
        println!(
            "D top [9,10,11]:    [{},{},{}]",
            cube.stickers[9], cube.stickers[10], cube.stickers[11]
        );
        println!(
            "L right [47,50,53]: [{},{},{}]",
            cube.stickers[47], cube.stickers[50], cube.stickers[53]
        );

        cube.apply_f_move();

        println!("After F move:");
        println!(
            "U bottom [6,7,8]:   [{},{},{}]",
            cube.stickers[6], cube.stickers[7], cube.stickers[8]
        );
        println!(
            "R left [36,39,42]:  [{},{},{}]",
            cube.stickers[36], cube.stickers[39], cube.stickers[42]
        );
        println!(
            "D top [9,10,11]:    [{},{},{}]",
            cube.stickers[9], cube.stickers[10], cube.stickers[11]
        );
        println!(
            "L right [47,50,53]: [{},{},{}]",
            cube.stickers[47], cube.stickers[50], cube.stickers[53]
        );

        println!("Check orientation and which edges moved where");
    }

    fn test_b_edge_mapping_detailed() {
        let mut cube = OptimizedCube::solved();
        println!("\n--- B MOVE DETAILED EDGE MAPPING ---");

        // U top row (0,1,2)
        cube.stickers[0] = 141;
        cube.stickers[1] = 142;
        cube.stickers[2] = 143;

        // L left column (45,48,51)
        cube.stickers[45] = 151;
        cube.stickers[48] = 152;
        cube.stickers[51] = 153;

        // D bottom row (15,16,17)
        cube.stickers[15] = 161;
        cube.stickers[16] = 162;
        cube.stickers[17] = 163;

        // R right column (38,41,44)
        cube.stickers[38] = 171;
        cube.stickers[41] = 172;
        cube.stickers[44] = 173;

        println!("Before B move:");
        println!(
            "U top [0,1,2]:      [{},{},{}]",
            cube.stickers[0], cube.stickers[1], cube.stickers[2]
        );
        println!(
            "L left [45,48,51]:  [{},{},{}]",
            cube.stickers[45], cube.stickers[48], cube.stickers[51]
        );
        println!(
            "D bottom [15,16,17]: [{},{},{}]",
            cube.stickers[15], cube.stickers[16], cube.stickers[17]
        );
        println!(
            "R right [38,41,44]: [{},{},{}]",
            cube.stickers[38], cube.stickers[41], cube.stickers[44]
        );

        cube.apply_b_move();

        println!("After B move:");
        println!(
            "U top [0,1,2]:      [{},{},{}]",
            cube.stickers[0], cube.stickers[1], cube.stickers[2]
        );
        println!(
            "L left [45,48,51]:  [{},{},{}]",
            cube.stickers[45], cube.stickers[48], cube.stickers[51]
        );
        println!(
            "D bottom [15,16,17]: [{},{},{}]",
            cube.stickers[15], cube.stickers[16], cube.stickers[17]
        );
        println!(
            "R right [38,41,44]: [{},{},{}]",
            cube.stickers[38], cube.stickers[41], cube.stickers[44]
        );

        println!("Check which edges moved where and orientation");
    }

    #[test]
    fn test_improved_scramble_generation() {
        let scramble = OptimizedCube::generate_random_scramble(20);
        assert_eq!(scramble.len(), 20);

        // Verify all moves are valid
        for &move_code in &scramble {
            assert!(move_code <= 17, "Invalid move code: {}", move_code);
        }

        // Verify scramble follows WCA rules
        assert!(
            OptimizedCube::validate_scramble(&scramble),
            "Generated scramble violates WCA rules"
        );
    }

    #[test]
    fn test_scramble_validation() {
        // Valid scramble
        let valid_scramble = vec![0, 4, 2, 1, 5, 3]; // U R F D L B
        assert!(OptimizedCube::validate_scramble(&valid_scramble));

        // Invalid: consecutive moves on same face
        let invalid_same_face = vec![0, 6]; // U U'
        assert!(!OptimizedCube::validate_scramble(&invalid_same_face));

        // Invalid: three moves on same axis
        let invalid_axis = vec![0, 1, 0]; // U D U (all UD axis)
        assert!(!OptimizedCube::validate_scramble(&invalid_axis));

        // Invalid move code
        let invalid_code = vec![18]; // Invalid move code
        assert!(!OptimizedCube::validate_scramble(&invalid_code));
    }

    #[test]
    fn test_competition_scramble_length() {
        let scramble = OptimizedCube::generate_competition_scramble();
        assert_eq!(scramble.len(), 20);
        assert!(OptimizedCube::validate_scramble(&scramble));
    }

    #[test]
    fn test_practice_scramble_length() {
        let scramble = OptimizedCube::generate_practice_scramble();
        assert_eq!(scramble.len(), 15);
        assert!(OptimizedCube::validate_scramble(&scramble));
    }

    #[test]
    fn test_long_scramble_length() {
        let scramble = OptimizedCube::generate_long_scramble();
        assert_eq!(scramble.len(), 25);
        assert!(OptimizedCube::validate_scramble(&scramble));
    }

    #[test]
    fn test_moves_to_string() {
        let moves = vec![0, 6, 12, 4, 10, 16]; // U U' U2 R R' R2
        let result = OptimizedCube::moves_to_string(&moves);
        assert_eq!(result, "U U' U2 R R' R2");

        // Test with all move types
        let all_moves = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        let result = OptimizedCube::moves_to_string(&all_moves);
        assert_eq!(result, "U D F B R L U' D' F' B' R' L' U2 D2 F2 B2 R2 L2");
    }

    #[test]
    fn test_wca_axis_rules() {
        // Test that three consecutive moves on same axis are prevented
        let _cube = OptimizedCube::new();

        // Generate many scrambles and check none violate axis rules
        for _ in 0..100 {
            let scramble = OptimizedCube::generate_random_scramble(20);

            for i in 2..scramble.len() {
                let face1 = scramble[i - 2] % 6;
                let face2 = scramble[i - 1] % 6;
                let face3 = scramble[i] % 6;

                let axis1 = match face1 {
                    0 | 1 => 0, // U/D
                    2 | 3 => 1, // F/B
                    4 | 5 => 2, // R/L
                    _ => 255,
                };
                let axis2 = match face2 {
                    0 | 1 => 0, // U/D
                    2 | 3 => 1, // F/B
                    4 | 5 => 2, // R/L
                    _ => 255,
                };
                let axis3 = match face3 {
                    0 | 1 => 0, // U/D
                    2 | 3 => 1, // F/B
                    4 | 5 => 2, // R/L
                    _ => 255,
                };

                // Should never have three consecutive moves on same axis
                assert!(!(axis1 == axis2 && axis2 == axis3),
                    "Found three consecutive moves on same axis: faces {}, {}, {} (axes {}, {}, {})",
                    face1, face2, face3, axis1, axis2, axis3);
            }
        }
    }

    #[test]
    fn test_no_consecutive_same_face() {
        // Generate many scrambles and verify no consecutive moves on same face
        for _ in 0..100 {
            let scramble = OptimizedCube::generate_random_scramble(20);

            for i in 1..scramble.len() {
                let face1 = scramble[i - 1] % 6;
                let face2 = scramble[i] % 6;

                assert_ne!(
                    face1, face2,
                    "Found consecutive moves on same face: {} and {}",
                    face1, face2
                );
            }
        }
    }
}
