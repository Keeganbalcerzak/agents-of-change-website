# EECS 370 — Complete Open-Book Exam Cheat Sheet

A from-scratch, highly visual study reference for **EECS 370: Introduction to
Computer Organization** (University of Michigan). It is written to teach the
entire course to someone who has never attended a lecture — every topic includes
a plain-English explanation, a step-by-step procedure, the key formula, a worked
example, and TikZ diagrams.

## Contents
- **`eecs370-cheatsheet.tex`** — LaTeX source (TikZ diagrams, no external assets).
- **`eecs370-cheatsheet.pdf`** — compiled 16-page PDF.

## Topics covered
1. Big-picture compute path & memory hierarchy
2. Number representation & two's-complement arithmetic
3. ISA fundamentals (RISC/CISC, load/store, word- vs byte-addressing, endianness)
4. **The LC2K ISA** — exact 4-format bit layouts, all 8 instructions, RTL semantics, the `beq` offset & `jalr` gotchas
5. LC2K assembly, the two-pass assembler, linker (symbol/relocation tables) & loader
6. The **ARM / LEGv8** ISA — registers, core instructions, condition flags
7. C → assembly, the **calling convention**, stack frames, prologue/epilogue
8. Digital logic — Boolean algebra, MUX/decoder/adder, flip-flops, FSMs
9. Single-cycle & multi-cycle datapaths (with control signals)
10. **Pipelining** — 5 stages, hazards, forwarding, load-use stall, branch handling
11. Performance — the Iron Law, CPI, **Amdahl's Law**
12. **Caches** — address breakdown, associativity, the 3 C's, write policies, **AMAT**
13. **Virtual memory** — paging, address translation, page tables, multi-level, **TLB**
14. Rapid-fire per-topic exam checklists

## Building
Requires a TeX distribution with TikZ, `tcolorbox`, and `titlesec`
(e.g. `texlive-latex-extra`, `texlive-pictures`).

```bash
pdflatex eecs370-cheatsheet.tex
pdflatex eecs370-cheatsheet.tex   # second pass for the table of contents
```

> The LC2K bit layouts and instruction semantics were verified against the
> course's published spec, but exact opcodes, bit ranges, and term-specific
> policies can change — re-verify against the current EECS 370 spec before your exam.
