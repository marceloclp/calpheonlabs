import type { LuaConst, LuaPrototype } from "./parser";

enum LuaOp {
    MOVE = 0,
    LOADK = 1,
    LOADBOOL = 2,
    LOADNIL = 3,
    GETUPVAL = 4,
    GETGLOBAL = 5,
    GETTABLE = 6,
    SETGLOBAL = 7,
    SETUPVAL = 8,
    SETTABLE = 9,
    NEWTABLE = 10,
    SELF = 11,
    ADD = 12,
    SUB = 13,
    MUL = 14,
    DIV = 15,
    MOD = 16,
    POW = 17,
    UNM = 18,
    NOT = 19,
    LEN = 20,
    CONCAT = 21,
    JMP = 22,
    EQ = 23,
    LT = 24,
    LE = 25,
    TEST = 26,
    TESTSET = 27,
    CALL = 28,
    TAILCALL = 29,
    RETURN = 30,
    FORLOOP = 31,
    FORPREP = 32,
    TFORLOOP = 33,
    SETLIST = 34,
    CLOSE = 35,
    CLOSURE = 36,
    VARARG = 37,
}

/** A value that could not be resolved without executing client code. */
export class LuaReference {
    readonly kind = "reference";

    constructor(readonly path: string) { }
}

/** A reconstructed Lua table. */
export class LuaTable {
    readonly kind = "table";
    readonly entries = new Map<string | number, LuaValue>();

    constructor(readonly id: number) { }
}

/** A value reconstructed by the assignment analyzer. */
export type LuaValue = LuaConst | LuaTable | LuaReference;

type Register = LuaValue | undefined;

/**
 * A Lua 5.1 instruction is one packed 32-bit unsigned integer interpreted as an
 * `iABC`, `iABx`, or `iAsBx` layout according to its opcode.
 */
class LuaInstruction {
    /** The original packed 32-bit instruction, for example `0x81804041`. */
    readonly value: number;
    /** The operation to perform, such as `LOADK`, `GETTABLE`, or `CALL`. */
    readonly opcode: number;
    /** The eight-bit A operand. */
    readonly a: number;
    /** The nine-bit B operand. */
    readonly b: number;
    /** The nine-bit C operand. */
    readonly c: number;
    /** The B and C regions interpreted as one unsigned 18-bit operand. */
    readonly bx: number;
    /** The Bx region interpreted as a biased signed branch operand. */
    readonly sbx: number;

    constructor(value: number) {
        this.value = value;
        this.opcode = value & 0x3f;
        this.a = (value >>> 6) & 0xff;
        this.c = (value >>> 14) & 0x1ff;
        this.b = (value >>> 23) & 0x1ff;
        this.bx = (value >>> 14) & 0x3ffff;
        this.sbx = this.bx - 131_071;
    }

    execute(program: LuaProgram) {
        switch (this.opcode) {
            case LuaOp.MOVE:
                return this.MOVE(program);
            case LuaOp.LOADK:
                return this.LOADK(program);
            case LuaOp.LOADBOOL:
                return this.LOADBOOL(program);
            case LuaOp.LOADNIL:
                return this.LOADNIL(program);
            case LuaOp.GETGLOBAL:
                return this.GETGLOBAL(program);
            case LuaOp.GETTABLE:
                return this.GETTABLE(program);
            case LuaOp.SETGLOBAL:
                return this.SETGLOBAL(program);
            case LuaOp.SETTABLE:
                return this.SETTABLE(program);
            case LuaOp.NEWTABLE:
                return this.NEWTABLE(program);
            case LuaOp.MUL:
                return this.MUL(program);
            case LuaOp.JMP:
                return this.JMP(program);
            case LuaOp.EQ:
                return this.EQ(program);
            case LuaOp.CALL:
                return this.CALL(program);
            case LuaOp.RETURN:
                return this.RETURN(program);
            case LuaOp.SETLIST:
                return this.SETLIST(program);
            case LuaOp.CLOSURE:
                return this.CLOSURE(program);
            default:
                program.fail(this, "opcode is not supported");
        }
    }

    private MOVE(program: LuaProgram) {
        program.registers[this.a] = program.requireRegister(this.b, this);
        program.pc++;
    }

    private LOADK(program: LuaProgram) {
        if (this.bx >= program.prototype.constants.length) {
            program.fail(this, `constant K${this.bx} is out of bounds`);
        }
        program.registers[this.a] = program.prototype.constants[this.bx]!;
        program.pc++;
    }

    private LOADBOOL(program: LuaProgram) {
        program.registers[this.a] = this.b !== 0;
        program.pc += this.c === 0 ? 1 : 2;
    }

    private LOADNIL(program: LuaProgram) {
        for (let register = this.a; register <= this.b; register++) {
            program.registers[register] = null;
        }
        program.pc++;
    }

    private GETGLOBAL(program: LuaProgram) {
        const name = program.prototype.constants[this.bx];
        if (typeof name !== "string") {
            program.fail(this, "global name is not a string constant");
        }
        program.registers[this.a] =
            program.globals.get(name) ?? new LuaReference(name);
        program.pc++;
    }

    private GETTABLE(program: LuaProgram) {
        const base = program.requireRegister(this.b, this);
        const key = program.tableKey(program.rk(this.c, this), this);
        program.registers[this.a] = program.resolveField(base, key);
        program.pc++;
    }

    private SETGLOBAL(program: LuaProgram) {
        const name = program.prototype.constants[this.bx];
        if (typeof name !== "string") {
            program.fail(this, "global name is not a string constant");
        }
        program.globals.set(name, program.requireRegister(this.a, this));
        program.pc++;
    }

    private SETTABLE(program: LuaProgram) {
        const table = program.requireTable(this.a, this, "SETTABLE");
        const key = program.tableKey(program.rk(this.b, this), this);
        table.entries.set(key, program.rk(this.c, this));
        program.pc++;
    }

    private NEWTABLE(program: LuaProgram) {
        program.registers[this.a] = new LuaTable(program.nextTableId++);
        program.pc++;
    }

    private MUL(program: LuaProgram) {
        const left = program.rk(this.b, this);
        const right = program.rk(this.c, this);
        program.registers[this.a] =
            typeof left === "number" && typeof right === "number"
                ? left * right
                : new LuaReference(
                    `(${program.valueText(left)} * ${program.valueText(right)})`,
                );
        program.pc++;
    }

    private JMP(program: LuaProgram) {
        if (this.sbx < 0) {
            program.fail(this, "backward jumps are not supported");
        }
        const destination = program.pc + 1 + this.sbx;
        if (destination > program.prototype.code.length) {
            program.fail(this, "jump destination is out of bounds");
        }
        program.pc = destination;
    }

    private EQ(program: LuaProgram) {
        if (this.a !== 0 && this.a !== 1) {
            program.fail(this, "EQ A must be zero or one");
        }
        const left = program.rk(this.b, this);
        const right = program.rk(this.c, this);
        const equality = program.knownEqual(left, right);
        if (equality === undefined) {
            program.materializeUnknownEquality(this, left, right);
            return;
        }
        program.pc += equality !== (this.a !== 0) ? 2 : 1;
    }

    private CALL(program: LuaProgram) {
        if (this.b === 0 || this.c === 0) {
            program.fail(
                this,
                "variable-arity or variable-result calls are not supported",
            );
        }
        if (this.c > 2) {
            program.fail(this, "multiple call results are not supported");
        }
        const callee = program.requireRegister(this.a, this);
        const arguments_: LuaValue[] = [];
        for (let index = 1; index < this.b; index++) {
            arguments_.push(program.requireRegister(this.a + index, this));
        }
        program.registers[this.a] =
            this.c === 2
                ? new LuaReference(
                    `${program.valueText(callee)}(${arguments_
                        .map((value) => program.valueText(value))
                        .join(", ")})`,
                )
                : undefined;
        program.pc++;
    }

    private RETURN(program: LuaProgram) {
        program.pc = program.prototype.code.length;
    }

    private SETLIST(program: LuaProgram) {
        if (this.b === 0) {
            program.fail(this, "dynamic SETLIST length is not supported");
        }
        const table = program.requireTable(this.a, this, "SETLIST");
        let block = this.c;
        let nextPc = program.pc + 1;
        if (block === 0) {
            const extra = program.prototype.code[nextPc];
            if (extra === undefined) {
                program.fail(this, "SETLIST block word is missing");
            }
            block = extra;
            nextPc++;
        }
        if (block === 0) {
            program.fail(this, "SETLIST block must be positive");
        }
        const base = (block - 1) * 50;
        for (let index = 1; index <= this.b; index++) {
            table.entries.set(
                base + index,
                program.requireRegister(this.a + index, this),
            );
        }
        program.pc = nextPc;
    }

    private CLOSURE(program: LuaProgram) {
        if (this.bx >= program.prototype.prototypes.length) {
            program.fail(this, "prototype index is out of bounds");
        }
        program.registers[this.a] = new LuaReference(`<function:${this.bx}>`);
        program.pc++;
    }
}

/** Mutable execution state for the supported Lua 5.1 instruction subset. */
class LuaProgram {
    readonly globals = new Map<string, LuaValue>();
    readonly registers: Register[] = [];
    /** Program instruction counter, used for control flow and diagnostics. */
    pc = 0;
    nextTableId = 1;

    constructor(readonly prototype: LuaPrototype) { }

    execute() {
        while (this.pc < this.prototype.code.length) {
            new LuaInstruction(this.prototype.code[this.pc]!).execute(this);
        }
        return this.globals;
    }

    requireRegister(index: number, instruction: LuaInstruction): LuaValue {
        const value = this.registers[index];
        if (value === undefined) {
            this.fail(instruction, `register R${index} is unresolved`);
        }
        return value;
    }

    requireTable(
        index: number,
        instruction: LuaInstruction,
        opcode: "SETTABLE" | "SETLIST",
    ) {
        const value = this.requireRegister(index, instruction);
        if (!(value instanceof LuaTable)) {
            this.fail(instruction, `${opcode} target is not a known table`);
        }
        return value;
    }

    rk(operand: number, instruction: LuaInstruction): LuaValue {
        if (operand < 256) return this.requireRegister(operand, instruction);
        const index = operand & 0xff;
        if (index >= this.prototype.constants.length) {
            this.fail(instruction, `constant K${index} is out of bounds`);
        }
        return this.prototype.constants[index]!;
    }

    tableKey(value: Register, instruction: LuaInstruction): string | number {
        if (typeof value === "string" || typeof value === "number") {
            return value;
        }
        if (value instanceof LuaReference) return `[${value.path}]`;
        this.fail(
            instruction,
            "table key is not a string, number, or symbolic reference",
        );
    }

    valueText(value: LuaValue): string {
        if (value === null) return "nil";
        if (typeof value === "string") return JSON.stringify(value);
        if (typeof value === "number" || typeof value === "boolean") {
            return String(value);
        }
        if (value instanceof LuaReference) return value.path;
        return `<table:${value.id}>`;
    }

    resolveField(base: LuaValue, key: string | number): LuaValue {
        if (base instanceof LuaTable) {
            return (
                base.entries.get(key) ??
                new LuaReference(`<table:${base.id}>.${String(key)}`)
            );
        }
        const path =
            base instanceof LuaReference ? base.path : this.valueText(base);
        return new LuaReference(`${path}.${String(key)}`);
    }

    knownEqual(left: LuaValue, right: LuaValue): boolean | undefined {
        const leftObject = typeof left === "object" && left !== null;
        const rightObject = typeof right === "object" && right !== null;
        if (!leftObject && !rightObject) return left === right;
        if (leftObject && rightObject) {
            if (left === right) return true;
            if (left instanceof LuaTable && right instanceof LuaTable) {
                return left.id === right.id;
            }
            return undefined;
        }
        if (left instanceof LuaTable || right instanceof LuaTable) return false;
        return undefined;
    }

    /** Recognizes Lua's EQ/JMP/LOADBOOL/LOADBOOL Boolean materialization. */
    materializeUnknownEquality(
        instruction: LuaInstruction,
        left: LuaValue,
        right: LuaValue,
    ) {
        const jumpValue = this.prototype.code[this.pc + 1];
        const falseValue = this.prototype.code[this.pc + 2];
        const trueValue = this.prototype.code[this.pc + 3];
        if (
            jumpValue === undefined ||
            falseValue === undefined ||
            trueValue === undefined
        ) {
            this.fail(
                instruction,
                "unresolved equality controls a truncated branch",
            );
        }

        const jump = new LuaInstruction(jumpValue);
        const falseLoad = new LuaInstruction(falseValue);
        const trueLoad = new LuaInstruction(trueValue);
        if (
            jump.opcode !== LuaOp.JMP ||
            jump.sbx !== 1 ||
            falseLoad.opcode !== LuaOp.LOADBOOL ||
            falseLoad.b !== 0 ||
            falseLoad.c !== 1 ||
            trueLoad.opcode !== LuaOp.LOADBOOL ||
            trueLoad.a !== falseLoad.a ||
            trueLoad.b !== 1 ||
            trueLoad.c !== 0
        ) {
            this.fail(
                instruction,
                "unresolved equality controls unsupported flow",
            );
        }

        const operator = instruction.a === 0 ? "~=" : "==";
        this.registers[falseLoad.a] = new LuaReference(
            `(${this.valueText(left)} ${operator} ${this.valueText(right)})`,
        );
        this.pc += 4;
    }

    fail(instruction: LuaInstruction, reason: string): never {
        const { a, b, c, opcode } = instruction;
        const name = LuaOp[opcode] ?? `OP_${opcode}`;
        const source = this.prototype.source || "<unknown source>";
        const line = this.prototype.lineInfo[this.pc] ?? 0;
        throw new Error(
            `Lua assignment analysis failed at ${source}:${line}, pc ${this.pc}, ` +
            `${name} (${opcode}, A=${a}, B=${b}, C=${c}): ${reason}`,
        );
    }
}

export type LuaAssignments = ReadonlyMap<string, LuaValue>;

/**
 * Reconstructs literal global and table assignments from one Lua prototype.
 *
 * External calls are represented symbolically and their side effects are not
 * executed. Nested prototypes are decoded but are not invoked by this static
 * analysis.
 */
export function inspectLuaAssignments(
    prototype: LuaPrototype,
): LuaAssignments {
    return new LuaProgram(prototype).execute();
}
