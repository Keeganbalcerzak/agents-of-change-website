# EECS 370 Project 3 — LC-2K Pipelined Simulator

A completed pipelined simulator for the LC-2K ISA, implementing the 5-stage
pipeline described in the [project 3 spec](https://eecs370.github.io/project_3_spec/).

## Files

| File | Description |
| --- | --- |
| `simulator.c` | The completed pipelined simulator. |
| `Makefile` | Build rules (provided). |
| `p3spec.as` | Sample assembly program (provided). |
| `p3spec.out.correct` | Expected simulator output for `p3spec` (provided). |

## What was implemented

The starter code provided the structs, `printState()`, and the machine-code
reader. The five pipeline stages plus state initialization were filled in:

- **Initialization** — `pc`, `cycles`, and all registers set to 0; every
  pipeline register's `instr` field set to the noop instruction
  (`0x1c00000`).
- **IF** — fetches `instrMem[pc]` and records `pc + 1`.
- **ID** — the only stage that reads the register file. Detects the
  **load-use hazard** (a `lw` in EX whose destination is read by the
  instruction in ID) and stalls one cycle by freezing IF/ID + `pc` and
  injecting a noop bubble.
- **EX** — performs the ALU operation with **data forwarding** to the EX
  stage from EX/MEM (highest priority), MEM/WB, then WB/END. A `lw` result is
  not forwardable from EX/MEM (it isn't read from memory yet), which is why
  the load-use case requires the stall above.
- **MEM** — accesses data memory for `lw`/`sw`, and resolves branches with
  **predict-not-taken**: on a taken `beq` it redirects `pc` and squashes the
  three wrongly-fetched instructions (IF/ID, ID/EX, EX/MEM) into noops.
- **WB** — writes back to the register file and forwards the result into the
  WB/END register.

The machine stops when a `halt` reaches the MEM/WB register, ensuring earlier
instructions complete and that a halt cannot be branched around.

`printState()` and the other provided helpers were left unmodified, as
required by the spec.

## Build & run

```sh
make simulator
./simulator program.mc > output
```

## Verification

Building with the provided Makefile (`gcc -std=c99 -Wall -Werror -g3`)
produces no warnings. Running on the assembled `p3spec` program reproduces
`p3spec.out.correct` exactly:

```sh
printf '00810002\n01800000\n00003039\n' > p3spec.mc
./simulator p3spec.mc | diff - p3spec.out.correct   # no differences
```

The forwarding, load-use stall, and branch-squash paths were additionally
validated with a hand-assembled program exercising back-to-back dependencies
and a taken branch.
