let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_2.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * Main function for testing (optional)
 */
export function main() {
    wasm.main();
}

const AlgorithmPatternsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_algorithmpatterns_free(ptr >>> 0, 1));
/**
 * Algorithm patterns for practice
 */
export class AlgorithmPatterns {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AlgorithmPatternsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_algorithmpatterns_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    static get oll() {
        const ret = wasm.algorithmpatterns_oll();
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    static get pll() {
        const ret = wasm.algorithmpatterns_pll();
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    static get f2l() {
        const ret = wasm.algorithmpatterns_f2l();
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}

const CubeColorsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cubecolors_free(ptr >>> 0, 1));

export class CubeColors {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CubeColorsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cubecolors_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    static get WHITE() {
        const ret = wasm.cubecolors_WHITE();
        return ret;
    }
    /**
     * @returns {number}
     */
    static get YELLOW() {
        const ret = wasm.cubecolors_YELLOW();
        return ret;
    }
    /**
     * @returns {number}
     */
    static get GREEN() {
        const ret = wasm.cubecolors_GREEN();
        return ret;
    }
    /**
     * @returns {number}
     */
    static get BLUE() {
        const ret = wasm.cubecolors_BLUE();
        return ret;
    }
    /**
     * @returns {number}
     */
    static get RED() {
        const ret = wasm.cubecolors_RED();
        return ret;
    }
    /**
     * @returns {number}
     */
    static get ORANGE() {
        const ret = wasm.cubecolors_ORANGE();
        return ret;
    }
}

const MoveUtilsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_moveutils_free(ptr >>> 0, 1));

export class MoveUtils {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MoveUtilsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moveutils_free(ptr, 0);
    }
    /**
     * @param {string} move_str
     * @returns {number}
     */
    static move_to_code(move_str) {
        const ptr0 = passStringToWasm0(move_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.moveutils_move_to_code(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {number} code
     * @returns {string}
     */
    static code_to_move(code) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.moveutils_code_to_move(code);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} scramble
     * @returns {Uint8Array}
     */
    static parse_scramble_to_codes(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.moveutils_parse_scramble_to_codes(ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @param {Uint8Array} codes
     * @returns {string}
     */
    static codes_to_scramble(codes) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passArray8ToWasm0(codes, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.moveutils_codes_to_scramble(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} scramble
     * @returns {boolean}
     */
    static validate_scramble_string(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.moveutils_validate_scramble_string(ptr0, len0);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    static generate_competition_scramble_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.moveutils_generate_competition_scramble_string();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    static generate_practice_scramble_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.moveutils_generate_practice_scramble_string();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    static generate_long_scramble_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.moveutils_generate_long_scramble_string();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} length
     * @returns {string}
     */
    static generate_random_scramble_string(length) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.moveutils_generate_random_scramble_string(length);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PerfTestFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_perftest_free(ptr >>> 0, 1));

export class PerfTest {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PerfTestFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_perftest_free(ptr, 0);
    }
    /**
     * @param {number} iterations
     * @returns {number}
     */
    static benchmark_moves(iterations) {
        const ret = wasm.perftest_benchmark_moves(iterations);
        return ret;
    }
    /**
     * @param {number} iterations
     * @returns {number}
     */
    static benchmark_scramble_generation(iterations) {
        const ret = wasm.perftest_benchmark_scramble_generation(iterations);
        return ret;
    }
    /**
     * @param {number} iterations
     * @returns {number}
     */
    static benchmark_zero_copy_access(iterations) {
        const ret = wasm.perftest_benchmark_zero_copy_access(iterations);
        return ret;
    }
}

const ScrambleUtilsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_scrambleutils_free(ptr >>> 0, 1));
/**
 * Scramble generation utilities for JavaScript
 */
export class ScrambleUtils {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ScrambleUtilsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scrambleutils_free(ptr, 0);
    }
    /**
     * Generate a random scramble of specified length
     * @param {number} length
     * @returns {string}
     */
    static generate_scramble(length) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.scrambleutils_generate_scramble(length);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Generate a competition-standard scramble (20 moves)
     * @returns {string}
     */
    static generate_competition_scramble() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.scrambleutils_generate_competition_scramble();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Generate a practice scramble (15 moves)
     * @returns {string}
     */
    static generate_practice_scramble() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.scrambleutils_generate_practice_scramble();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Generate a long scramble (25 moves)
     * @returns {string}
     */
    static generate_long_scramble() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.scrambleutils_generate_long_scramble();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Validate a scramble string according to WCA rules
     * @param {string} scramble
     * @returns {boolean}
     */
    static validate_scramble(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.moveutils_validate_scramble_string(ptr0, len0);
        return ret !== 0;
    }
    /**
     * Parse a scramble string into individual moves
     * @param {string} scramble
     * @returns {string[]}
     */
    static parse_scramble(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.scrambleutils_parse_scramble(ptr0, len0);
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * Format a scramble string (normalize spacing)
     * @param {string} scramble
     * @returns {string}
     */
    static format_scramble(scramble) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.scrambleutils_format_scramble(ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Generate algorithm practice scramble
     * @param {string} algorithm_type
     * @returns {string}
     */
    static generate_algorithm_practice(algorithm_type) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(algorithm_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.scrambleutils_generate_algorithm_practice(ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}

const WasmOptimizedCubeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmoptimizedcube_free(ptr >>> 0, 1));

export class WasmOptimizedCube {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmOptimizedCube.prototype);
        obj.__wbg_ptr = ptr;
        WasmOptimizedCubeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmOptimizedCubeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmoptimizedcube_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.wasmoptimizedcube_new();
        this.__wbg_ptr = ret >>> 0;
        WasmOptimizedCubeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {WasmOptimizedCube}
     */
    static solved() {
        const ret = wasm.wasmoptimizedcube_new();
        return WasmOptimizedCube.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    ptr() {
        const ret = wasm.wasmoptimizedcube_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    len() {
        const ret = wasm.wasmoptimizedcube_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {string} move_str
     */
    apply_move(move_str) {
        const ptr0 = passStringToWasm0(move_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoptimizedcube_apply_move(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} scramble
     */
    apply_scramble(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoptimizedcube_apply_scramble(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint8Array} moves
     */
    apply_moves(moves) {
        const ptr0 = passArray8ToWasm0(moves, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmoptimizedcube_apply_moves(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    is_solved() {
        const ret = wasm.wasmoptimizedcube_is_solved(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {string} scramble
     * @returns {Uint8Array}
     */
    static parse_scramble(scramble) {
        const ptr0 = passStringToWasm0(scramble, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoptimizedcube_parse_scramble(ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @param {number} length
     * @returns {Uint8Array}
     */
    static generate_random_scramble(length) {
        const ret = wasm.wasmoptimizedcube_generate_random_scramble(length);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    static generate_competition_scramble() {
        const ret = wasm.wasmoptimizedcube_generate_competition_scramble();
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    static generate_practice_scramble() {
        const ret = wasm.wasmoptimizedcube_generate_practice_scramble();
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    static generate_long_scramble() {
        const ret = wasm.wasmoptimizedcube_generate_long_scramble();
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} moves
     * @returns {boolean}
     */
    static validate_scramble(moves) {
        const ptr0 = passArray8ToWasm0(moves, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoptimizedcube_validate_scramble(ptr0, len0);
        return ret !== 0;
    }
    /**
     * @param {Uint8Array} moves
     * @returns {string}
     */
    static moves_to_string(moves) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passArray8ToWasm0(moves, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmoptimizedcube_moves_to_string(ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {Uint8Array}
     */
    get_stickers() {
        const ret = wasm.wasmoptimizedcube_get_stickers(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} stickers
     */
    set_stickers(stickers) {
        const ptr0 = passArray8ToWasm0(stickers, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoptimizedcube_set_stickers(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {number} face
     * @returns {Uint8Array}
     */
    get_face(face) {
        const ret = wasm.wasmoptimizedcube_get_face(this.__wbg_ptr, face);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    reset() {
        wasm.wasmoptimizedcube_reset(this.__wbg_ptr);
    }
    /**
     * @returns {WasmOptimizedCube}
     */
    clone() {
        const ret = wasm.wasmoptimizedcube_clone(this.__wbg_ptr);
        return WasmOptimizedCube.__wrap(ret);
    }
}

export function __wbg_call_672a4d21634d4a24() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

export function __wbg_error_7534b8e9a36f1ab4(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_instanceof_Window_def73ea0955fc569(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_log_96fddaa6da9be907(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

export function __wbg_new_8a6f238a6ece86ea() {
    const ret = new Error();
    return ret;
};

export function __wbg_newnoargs_105ed471475aaf50(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_now_d18023d54d4e5500(arg0) {
    const ret = arg0.now();
    return ret;
};

export function __wbg_performance_c185c0cdc2766575(arg0) {
    const ret = arg0.performance;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_random_3ad904d98382defe() {
    const ret = Math.random();
    return ret;
};

export function __wbg_stack_0ed75d68575b0f3c(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_static_accessor_GLOBAL_88a902d13a557d07() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_SELF_37c5d418e4bf5819() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_WINDOW_5de37043a91a9c40() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_export_2;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

export function __wbindgen_is_undefined(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

