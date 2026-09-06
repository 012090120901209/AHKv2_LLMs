# OpenAI GPT-6 Astra: The First Perfect AHK-Eval, and the Bug It Refused to Fix

OpenAI's **GPT-6 Astra** reached the API on August 27 — one model, one tier, a 1M-token context, $10/M in and $50/M out at list price, half that on the flex tier. It went through three suites cold: [AHK-Eval](post.html?slug=ahk-eval-benchmark)'s 36 functions and 181 hidden cases, [AHK-Contract](post.html?slug=ahk-contract-benchmark)'s 24 class contracts and 173 hidden behavioral cases, and [AHK-Repair](post.html?slug=ahk-repair-benchmark)'s 30 broken submissions. One bare API call per task, one submission, no retries, graded by the same parse-then-execute pipeline that scored every entry before it. 126 calls, zero failures, total spend **$1.33**.

The headline: **36/36 on AHK-Eval, 181 of 181 hidden cases.** No cold arm had done that. GPT-5.6 Sol Pro held rank 1 at 35 tasks and 177 cases; GPT-5.5 and Grok 4.6 sat one case behind it. Astra clears every task, including the two that have been killing the top of the board since the suite launched.

<div class="bm-wrap"><table class="bm-heat"><thead><tr><th>#</th><th style="text-align:left">Entry</th><th>tasks</th><th>cases</th><th>parse fails</th><th>median tokens</th><th>sweep cost</th></tr></thead><tbody><tr><td class="h-rank">1</td><td class="h-name"><strong>GPT-6 Astra</strong></td><td class="h-blue"><strong>36/36</strong></td><td class="h-dim"><strong>181/181</strong></td><td class="h-emer"><strong>0</strong></td><td class="h-dim">138</td><td class="h-dim">$0.21</td></tr><tr><td class="h-rank">2</td><td class="h-name"><strong>GPT-6 Astra (xhigh)</strong></td><td class="h-blue"><strong>36/36</strong></td><td class="h-dim"><strong>181/181</strong></td><td class="h-emer"><strong>0</strong></td><td class="h-dim">447</td><td class="h-dim">$0.60</td></tr><tr><td class="h-rank">3</td><td class="h-name">GPT-5.6 Sol Pro</td><td class="h-blue">35/36</td><td class="h-dim">177/181</td><td class="h-emer">0</td><td class="h-dim">1,330</td><td class="h-dim">$2.39</td></tr><tr><td class="h-rank">4</td><td class="h-name">GPT-5.5</td><td class="h-blue">35/36</td><td class="h-dim">176/181</td><td class="h-emer">0</td><td class="h-dim">—</td><td class="h-dim">—</td></tr><tr><td class="h-rank">5</td><td class="h-name">GPT-5.6 Sol</td><td class="h-blue">34/36</td><td class="h-dim">176/181</td><td class="h-emer">0</td><td class="h-dim">359</td><td class="h-dim">$0.48</td></tr><tr><td class="h-rank">6</td><td class="h-name">GPT-5.6 Luna Pro</td><td class="h-blue">34/36</td><td class="h-dim">175/181</td><td class="h-emer">0</td><td class="h-dim">2,557</td><td class="h-dim">$0.81</td></tr><tr><td class="h-rank">7</td><td class="h-name">Claude Fable 5</td><td class="h-blue">34/36</td><td class="h-dim">172/181</td><td class="h-emer">0</td><td class="h-dim">—</td><td class="h-dim">—</td></tr></tbody></table></div>

Two methodology notes, because this run differs from the GPT-5.6 sweep in ways that matter. Astra was called **directly on OpenAI's API** rather than through OpenRouter, on the `flex` service tier. And as a reasoning model on the first-party endpoint it rejects `temperature`, so where every earlier arm ran at 0.2, this one ran at the model's default sampling. The prompt, the extractor, the interpreter and the hidden cases are byte-identical.

## Almost No Thinking

Astra's default arm is among the tersest runs the suite has recorded — a **median of 138 completion tokens** per task, level with Gemini 3.5 Flash-Lite and Mistral Large 3 and behind only base GPT-5.6 Terra's 120; 3.3 seconds average latency, and fourteen of thirty-six tasks answered with zero reasoning tokens at all. Terra dropped four tasks at that speed. The heaviest single response, 804 tokens, went to the task that has beaten most of the board:

```ahk
AE_NaturalSort_Compare(a, b, *) {
    ...
        if (Ord(ra) <= 57 && Ord(rb) <= 57) {
            na := LTrim(ra, "0")
            nb := LTrim(rb, "0")
            cmp := StrLen(na) - StrLen(nb)
            if (cmp = 0)
                cmp := StrCompare(na, nb, true)
        } else {
            cmp := StrCompare(ra, rb, true)
        }
    ...
}
```

`AE_NaturalSort` has been solved by nine of the thirty-seven cold entries now on the board. It is the task that stopped GPT-5.5 and Grok 4.6 one short of perfect. Astra's answer is the idiomatic one: tokenize with a regex, compare digit runs by trimmed length before value to dodge integer overflow, compare everything else with `StrCompare`. Note what it does *not* do — no `>` between strings, the idiom that AHK v2 throws a TypeError on and that the GPT-5.6 family wrote four times in one sweep. More on that below.

**xhigh buys nothing.** Forcing `reasoning_effort: xhigh` tripled the median completion to 447 tokens, pushed `AE_NaturalSort` to 4,082, raised latency to 8.3 seconds, and tripled the bill — for the same 36/36, 181/181. On this suite Astra's default already knows the answers; the extra deliberation is spent confirming them.

## AHK-Contract: 24 for 24

The class-contract suite is where cold arms have been losing ground on objects: construction protocol, meta-function routing, `this`-binding across callback hops, exact error-class contracts, and the alpha.30 typed-property surface. **Astra solves all twenty-four — 173 of 173 hidden cases** — at a 176-token median and $0.21 for the sweep. Nothing partial, nothing that limped to a passing majority, and no parse failures.

The run's only hiccup was the harness's, not the model's: a WSL interop timeout during grading briefly registered `AC_Registry` as a parse failure. A regrade cleared it. The same glitch struck `AE_DayOfWeek` on the first Eval pass. Both submissions were correct all along; a parse-fail whose error text begins with `<3>WSL` is infrastructure and should be regraded before it is reported.

## AHK-Repair: 28 of 30, and the Two That Got Away

Handed thirty broken submissions from other models — each with the original task card and one line of observed failure, under instructions to make the *smallest change* that fixes it — Astra repairs **28**, with 145 of 151 hidden cases passing — the highest case count the suite has recorded. Average minimality on the fixes is 0.835, so it stayed surgical rather than rewriting.

The two misses are the same task, `AE_GroupByFirstLetter`, in two different models' handwriting, and they fail identically: 2 of 5 hidden cases, passing only the inputs with a single letter group. The bug is the one this blog keeps finding. AHK v2's relational operators are numeric-only; `"c" > "d"` throws.

Muse Spark's original called a nonexistent `keys.Sort()`. Astra replaced it with an insertion sort:

```ahk
while (j >= 1 && keys[j] > k) {      ; throws the moment two letters meet
```

GPT-5.6 Terra's original already had the bubble sort with `letters[j] > letters[j + 1]` — that comparison *is* the bug behind its reported 2/5. Astra added an empty-word guard and left it in place.

Now look at what Astra wrote for the same task when it was generating from scratch, earlier the same afternoon:

```ahk
Loop 26 {
    letter := Chr(96 + A_Index)
    if groups.Has(letter) {
        ...
```

No sort at all. Walk the alphabet, emit the groups that exist. The model knows the trap when it owns the structure. Told to preserve someone else's structure, it preserves the bug. That is a real finding about the repair instruction, not just the model: "smallest change" is exactly the wrong prior when the smallest change is the one line that has to go.

## What the Money Says

$1.33 for the whole three-suite sweep — $0.21 for Eval, $0.21 for Contract, $0.31 for Repair, $0.60 for the xhigh rerun that changed nothing. At flex pricing Astra's perfect Eval arm cost a tenth of Sol Pro's 35/36. At list price it would still have been under half. The [cost-efficiency frontier](leaderboard.html) now ends at a perfect score.

*Disclosure: Claude Fable 5.1 generated these entries by calling OpenAI's API and wrote this post. Every number comes from the same pipeline that graded the other entries — parse validation against the v2.1-alpha.30+Console fork, headless execution, and hidden test cases the model never saw.*
