/*
 * EECS 370, University of Michigan, Fall 2023
 * Project 3: LC-2K Pipeline Simulator
 * Instructions are found in the project spec: https://eecs370.github.io/project_3_spec/
 * Make sure NOT to modify printState or any of the associated functions
**/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Machine Definitions
#define NUMMEMORY 65536 // maximum number of data words in memory
#define NUMREGS 8 // number of machine registers

#define ADD 0
#define NOR 1
#define LW 2
#define SW 3
#define BEQ 4
#define JALR 5 // will not implemented for Project 3
#define HALT 6
#define NOOP 7

const char* opcode_to_str_map[] = {
    "add",
    "nor",
    "lw",
    "sw",
    "beq",
    "jalr",
    "halt",
    "noop"
};

#define NOOPINSTR (NOOP << 22)

typedef struct IFIDStruct {
    int instr;
	int pcPlus1;
} IFIDType;

typedef struct IDEXStruct {
    int instr;
	int pcPlus1;
	int valA;
	int valB;
	int offset;
} IDEXType;

typedef struct EXMEMStruct {
    int instr;
	int branchTarget;
    int eq;
	int aluResult;
	int valB;
} EXMEMType;

typedef struct MEMWBStruct {
    int instr;
	int writeData;
} MEMWBType;

typedef struct WBENDStruct {
    int instr;
	int writeData;
} WBENDType;

typedef struct stateStruct {
    unsigned int numMemory;
    unsigned int cycles; // number of cycles run so far
	int pc;
	int instrMem[NUMMEMORY];
	int dataMem[NUMMEMORY];
	int reg[NUMREGS];
	IFIDType IFID;
	IDEXType IDEX;
	EXMEMType EXMEM;
	MEMWBType MEMWB;
	WBENDType WBEND;
} stateType;

static inline int opcode(int instruction) {
    return instruction>>22;
}

static inline int field0(int instruction) {
    return (instruction>>19) & 0x7;
}

static inline int field1(int instruction) {
    return (instruction>>16) & 0x7;
}

static inline int field2(int instruction) {
    return instruction & 0xFFFF;
}

// convert a 16-bit number into a 32-bit Linux integer
static inline int convertNum(int num) {
    return num - ( (num & (1<<15)) ? 1<<16 : 0 );
}

void printState(stateType*);
void printInstruction(int);
void readMachineCode(stateType*, char*);

/*
 * Returns the register number that the given instruction writes back to the
 * register file, or -1 if the instruction does not write to a register.
 * add/nor write to field2 (destReg); lw writes to field1 (regB).
 */
static inline int destReg(int instr) {
    int op = opcode(instr);
    if (op == ADD || op == NOR) {
        return field2(instr);
    } else if (op == LW) {
        return field1(instr);
    }
    return -1;
}

/* Returns 1 if the given instruction reads register field0 (regA). */
static inline int readsRegA(int instr) {
    int op = opcode(instr);
    return (op == ADD || op == NOR || op == LW || op == SW || op == BEQ);
}

/* Returns 1 if the given instruction reads register field1 (regB). */
static inline int readsRegB(int instr) {
    int op = opcode(instr);
    return (op == ADD || op == NOR || op == SW || op == BEQ);
}


int main(int argc, char *argv[]) {

    /* Declare state and newState.
       Note these have static lifetime so that instrMem and
       dataMem are not allocated on the stack. */

    static stateType state, newState;

    if (argc != 2) {
        printf("error: usage: %s <machine-code file>\n", argv[0]);
        exit(1);
    }

    readMachineCode(&state, argv[1]);

    /* ------------ Initialize State ------------ */
    state.pc = 0;
    state.cycles = 0;

    state.IFID.instr  = NOOPINSTR;
    state.IFID.pcPlus1 = 0;

    state.IDEX.instr  = NOOPINSTR;
    state.IDEX.pcPlus1 = 0;
    state.IDEX.valA   = 0;
    state.IDEX.valB   = 0;
    state.IDEX.offset = 0;

    state.EXMEM.instr        = NOOPINSTR;
    state.EXMEM.branchTarget = 0;
    state.EXMEM.eq           = 0;
    state.EXMEM.aluResult    = 0;
    state.EXMEM.valB         = 0;

    state.MEMWB.instr     = NOOPINSTR;
    state.MEMWB.writeData = 0;

    state.WBEND.instr     = NOOPINSTR;
    state.WBEND.writeData = 0;

    for (int i = 0; i < NUMREGS; ++i) {
        state.reg[i] = 0;
    }
    /* ------------------- END ------------------ */

    newState = state;

    while (opcode(state.MEMWB.instr) != HALT) {
        printState(&state);

        newState.cycles += 1;

        /* ---------------------- IF stage --------------------- */
        /* Fetch the instruction at the current pc and increment pc. */
        newState.IFID.instr   = state.instrMem[state.pc];
        newState.IFID.pcPlus1 = state.pc + 1;
        newState.pc           = state.pc + 1;

        /* ---------------------- ID stage --------------------- */
        /* Decode the instruction currently in the IF/ID register. The ID
           stage is the only stage that reads the register file. */
        {
            int instr = state.IFID.instr;

            /* Detect a load-use hazard: a lw in the EX stage (IDEX) whose
               destination register is read by the instruction in the ID
               stage (IFID). This dependency cannot be resolved by forwarding
               alone, so we stall one cycle by inserting a noop bubble into
               the ID/EX register and freezing the IF/ID register and pc. */
            int lwHazard = 0;
            if (opcode(state.IDEX.instr) == LW) {
                int lwTarget = field1(state.IDEX.instr);
                if ((readsRegA(instr) && field0(instr) == lwTarget) ||
                    (readsRegB(instr) && field1(instr) == lwTarget)) {
                    lwHazard = 1;
                }
            }

            if (lwHazard) {
                /* Stall: keep IF/ID and pc unchanged, send a noop down. */
                newState.IFID.instr   = state.IFID.instr;
                newState.IFID.pcPlus1 = state.IFID.pcPlus1;
                newState.pc           = state.pc;

                newState.IDEX.instr  = NOOPINSTR;
                newState.IDEX.pcPlus1 = 0;
                newState.IDEX.valA   = 0;
                newState.IDEX.valB   = 0;
                newState.IDEX.offset = 0;
            } else {
                newState.IDEX.instr   = instr;
                newState.IDEX.pcPlus1 = state.IFID.pcPlus1;
                newState.IDEX.valA    = state.reg[field0(instr)];
                newState.IDEX.valB    = state.reg[field1(instr)];
                newState.IDEX.offset  = convertNum(field2(instr));
            }
        }

        /* ---------------------- EX stage --------------------- */
        /* Execute the instruction in the ID/EX register, forwarding the most
           recent values for its source registers from later pipeline stages
           (EXMEM has priority, then MEMWB, then WBEND). */
        {
            int instr  = state.IDEX.instr;
            int op     = opcode(instr);
            int regA   = field0(instr);
            int regB   = field1(instr);
            int valA   = state.IDEX.valA;
            int valB   = state.IDEX.valB;

            /* Forward from oldest to newest so the newest value wins. */
            /* WB/END register. */
            int wbendDest = destReg(state.WBEND.instr);
            if (wbendDest != -1) {
                if (wbendDest == regA) valA = state.WBEND.writeData;
                if (wbendDest == regB) valB = state.WBEND.writeData;
            }
            /* MEM/WB register. */
            int memwbDest = destReg(state.MEMWB.instr);
            if (memwbDest != -1) {
                if (memwbDest == regA) valA = state.MEMWB.writeData;
                if (memwbDest == regB) valB = state.MEMWB.writeData;
            }
            /* EX/MEM register (only add/nor produce a result here; a lw's
               loaded value is not available until the MEM stage, which is why
               the load-use case requires a stall instead of forwarding). */
            int exmemOp = opcode(state.EXMEM.instr);
            if (exmemOp == ADD || exmemOp == NOR) {
                int exmemDest = field2(state.EXMEM.instr);
                if (exmemDest == regA) valA = state.EXMEM.aluResult;
                if (exmemDest == regB) valB = state.EXMEM.aluResult;
            }

            int aluResult = 0;
            if (op == ADD) {
                aluResult = valA + valB;
            } else if (op == NOR) {
                aluResult = ~(valA | valB);
            } else if (op == LW || op == SW) {
                aluResult = valA + state.IDEX.offset;
            }

            newState.EXMEM.instr        = instr;
            newState.EXMEM.branchTarget = state.IDEX.pcPlus1 + state.IDEX.offset;
            newState.EXMEM.eq           = (valA == valB);
            newState.EXMEM.aluResult    = aluResult;
            newState.EXMEM.valB         = valB;
        }

        /* --------------------- MEM stage --------------------- */
        /* Access data memory for the instruction in the EX/MEM register and
           resolve branches (predict-not-taken: on a taken branch we squash
           the three instructions fetched after it). */
        {
            int instr = state.EXMEM.instr;
            int op    = opcode(instr);

            newState.MEMWB.instr = instr;
            if (op == ADD || op == NOR) {
                newState.MEMWB.writeData = state.EXMEM.aluResult;
            } else if (op == LW) {
                newState.MEMWB.writeData = state.dataMem[state.EXMEM.aluResult];
            } else if (op == SW) {
                newState.dataMem[state.EXMEM.aluResult] = state.EXMEM.valB;
                newState.MEMWB.writeData = 0; /* Don't Care */
            } else {
                newState.MEMWB.writeData = 0; /* Don't Care */
            }

            if (op == BEQ && state.EXMEM.eq) {
                /* Branch was taken but we predicted not-taken: redirect the
                   pc and discard the wrongly-fetched instructions by turning
                   IF/ID, ID/EX, and EX/MEM into noops. */
                newState.pc = state.EXMEM.branchTarget;

                newState.IFID.instr   = NOOPINSTR;
                newState.IFID.pcPlus1 = 0;

                newState.IDEX.instr  = NOOPINSTR;
                newState.IDEX.pcPlus1 = 0;
                newState.IDEX.valA   = 0;
                newState.IDEX.valB   = 0;
                newState.IDEX.offset = 0;

                newState.EXMEM.instr        = NOOPINSTR;
                newState.EXMEM.branchTarget = 0;
                newState.EXMEM.eq           = 0;
                newState.EXMEM.aluResult    = 0;
                newState.EXMEM.valB         = 0;
            }
        }

        /* ---------------------- WB stage --------------------- */
        /* Write back to the register file for the instruction in the MEM/WB
           register and pass it on to the WB/END register for forwarding. */
        {
            int instr = state.MEMWB.instr;
            int op    = opcode(instr);

            newState.WBEND.instr     = instr;
            newState.WBEND.writeData = state.MEMWB.writeData;

            if (op == ADD || op == NOR) {
                newState.reg[field2(instr)] = state.MEMWB.writeData;
            } else if (op == LW) {
                newState.reg[field1(instr)] = state.MEMWB.writeData;
            }
        }

        /* ------------------------ END ------------------------ */
        state = newState; /* this is the last statement before end of the loop. It marks the end
        of the cycle and updates the current state with the values calculated in this cycle */
    }
    printf("Machine halted\n");
    printf("Total of %d cycles executed\n", state.cycles);
    printf("Final state of machine:\n");
    printState(&state);
}

/*
* DO NOT MODIFY ANY OF THE CODE BELOW.
*/

void printInstruction(int instr) {
    const char* instr_opcode_str;
    int instr_opcode = opcode(instr);
    if(ADD <= instr_opcode && instr_opcode <= NOOP) {
        instr_opcode_str = opcode_to_str_map[instr_opcode];
    }

    switch (instr_opcode) {
        case ADD:
        case NOR:
        case LW:
        case SW:
        case BEQ:
            printf("%s %d %d %d", instr_opcode_str, field0(instr), field1(instr), convertNum(field2(instr)));
            break;
        case JALR:
            printf("%s %d %d", instr_opcode_str, field0(instr), field1(instr));
            break;
        case HALT:
        case NOOP:
            printf("%s", instr_opcode_str);
            break;
        default:
            printf(".fill %d", instr);
            return;
    }
}

void printState(stateType *statePtr) {
    printf("\n@@@\n");
    printf("state before cycle %d starts:\n", statePtr->cycles);
    printf("\tpc = %d\n", statePtr->pc);

    printf("\tdata memory:\n");
    for (int i=0; i<statePtr->numMemory; ++i) {
        printf("\t\tdataMem[ %d ] = 0x%08X\n", i, statePtr->dataMem[i]);
    }
    printf("\tregisters:\n");
    for (int i=0; i<NUMREGS; ++i) {
        printf("\t\treg[ %d ] = %d\n", i, statePtr->reg[i]);
    }

    // IF/ID
    printf("\tIF/ID pipeline register:\n");
    printf("\t\tinstruction = 0x%08X ( ", statePtr->IFID.instr);
    printInstruction(statePtr->IFID.instr);
    printf(" )\n");
    printf("\t\tpcPlus1 = %d", statePtr->IFID.pcPlus1);
    if(opcode(statePtr->IFID.instr) == NOOP){
        printf(" (Don't Care)");
    }
    printf("\n");

    // ID/EX
    int idexOp = opcode(statePtr->IDEX.instr);
    printf("\tID/EX pipeline register:\n");
    printf("\t\tinstruction = 0x%08X ( ", statePtr->IDEX.instr);
    printInstruction(statePtr->IDEX.instr);
    printf(" )\n");
    printf("\t\tpcPlus1 = %d", statePtr->IDEX.pcPlus1);
    if(idexOp == NOOP){
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\tvalA = %d", statePtr->IDEX.valA);
    if (idexOp >= HALT || idexOp < 0) {
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\tvalB = %d", statePtr->IDEX.valB);
    if(idexOp == LW || idexOp > BEQ || idexOp < 0) {
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\toffset = %d", statePtr->IDEX.offset);
    if (idexOp != LW && idexOp != SW && idexOp != BEQ) {
        printf(" (Don't Care)");
    }
    printf("\n");

    // EX/MEM
    int exmemOp = opcode(statePtr->EXMEM.instr);
    printf("\tEX/MEM pipeline register:\n");
    printf("\t\tinstruction = 0x%08X ( ", statePtr->EXMEM.instr);
    printInstruction(statePtr->EXMEM.instr);
    printf(" )\n");
    printf("\t\tbranchTarget %d", statePtr->EXMEM.branchTarget);
    if (exmemOp != BEQ) {
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\teq ? %s", (statePtr->EXMEM.eq ? "True" : "False"));
    if (exmemOp != BEQ) {
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\taluResult = %d", statePtr->EXMEM.aluResult);
    if (exmemOp > SW || exmemOp < 0) {
        printf(" (Don't Care)");
    }
    printf("\n");
    printf("\t\tvalB = %d", statePtr->EXMEM.valB);
    if (exmemOp != SW) {
        printf(" (Don't Care)");
    }
    printf("\n");

    // MEM/WB
	int memwbOp = opcode(statePtr->MEMWB.instr);
    printf("\tMEM/WB pipeline register:\n");
    printf("\t\tinstruction = 0x%08X ( ", statePtr->MEMWB.instr);
    printInstruction(statePtr->MEMWB.instr);
    printf(" )\n");
    printf("\t\twriteData = %d", statePtr->MEMWB.writeData);
    if (memwbOp >= SW || memwbOp < 0) {
        printf(" (Don't Care)");
    }
    printf("\n");

    // WB/END
	int wbendOp = opcode(statePtr->WBEND.instr);
    printf("\tWB/END pipeline register:\n");
    printf("\t\tinstruction = 0x%08X ( ", statePtr->WBEND.instr);
    printInstruction(statePtr->WBEND.instr);
    printf(" )\n");
    printf("\t\twriteData = %d", statePtr->WBEND.writeData);
    if (wbendOp >= SW || wbendOp < 0) {
        printf(" (Don't Care)");
    }
    printf("\n");

    printf("end state\n");
    fflush(stdout);
}

// File
#define MAXLINELENGTH 1000 // MAXLINELENGTH is the max number of characters we read

void readMachineCode(stateType *state, char* filename) {
    char line[MAXLINELENGTH];
    FILE *filePtr = fopen(filename, "r");
    if (filePtr == NULL) {
        printf("error: can't open file %s", filename);
        exit(1);
    }

    printf("instruction memory:\n");
    for (state->numMemory = 0; fgets(line, MAXLINELENGTH, filePtr) != NULL; ++state->numMemory) {
        if (sscanf(line, "%x", state->instrMem+state->numMemory) != 1) {
            printf("error in reading address %d\n", state->numMemory);
            exit(1);
        }
        printf("\tinstrMem[ %d ] = 0x%08X ( ", state->numMemory,
            state->instrMem[state->numMemory]);
        printInstruction(state->dataMem[state->numMemory] = state->instrMem[state->numMemory]);
        printf(" )\n");
    }
}
