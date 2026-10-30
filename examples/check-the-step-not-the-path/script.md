# Check the Step, Not the Path — script (EN only, approved 2026-10-30)

Article: https://www.javieraguilar.ai/en/blog/check-the-step-not-the-path

| Scene | Component | EN line | Visual | Source sentence |
|---|---|---|---|---|
| hook | intro | Grading the final state let 33 false proofs through. | Hook card | "Grading the final state let 33 false proofs through." (description) |
| paper | KeyQuote | A recent paper says: grade agents on their whole path, / not just where they end up. | Quote, "whole path" emphasised | "A recent paper argues that agents should be graded on their whole sequence of tool calls, not just where they end up." |
| proof | KeyQuote | But in a proof, you can't know in advance / which step moves you forward. | Quote, "in advance" emphasised | "In a compliance flow you do. In a mathematical proof you don't." |
| setup | FlowDiagram | So I gave agents algebra to rewrite, with rules that only apply under conditions. | Derivation nodes appear | "Some rules have side conditions" |
| setup | FlowDiagram | Cancel x minus 1, knowing only that x is positive, / and the answer is right but the proof is false. | Broken edge "cancel x−1 (x>0 only)" into "x+1 ✓ target" | Figure 1: "The answer is right and the proof is false." |
| final | Counter | The final state passed all 33 false proofs. | 33 / 33 | "The final-state check passes all 33 false proofs." |
| reference | BarCompare | Grading against a reference path failed 116 of 120 valid ones. / With or without proof steps in the reference, / it grades style, not correctness. | Bars 0, 115, 116 | Figure 2 (116 of 120); "it grades the agent's style rather than its correctness" |
| known | StatGrid | Where the path is known, / specifying it caught the 2 runs / the final state missed. | 2 · 2/2 · 0/2 (one tile per line) | "In 180 onboarding runs the ordering obligation failed nothing valid, and it caught the 2 runs that skipped sanctions screening, which the final state missed." |
| close | KeyQuote | Check each step's conditions. / Specify the path only where you know it. | Quote | "Specify the conditions each step has to satisfy"; "Where the path is known in advance, specifying it is cheap." / "Where it isn't, treat a reference path as a style guide" |
| outro | outro | More at javieraguilar.ai | Outro card | — |

Word count (EN): 137. Estimated length: ~50 s.
