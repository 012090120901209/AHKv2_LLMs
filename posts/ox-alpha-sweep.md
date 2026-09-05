# Ox Alpha: The Syntax Is Perfect, the Standard Library Is Invented

**Ox Alpha** is a cloaked model — no vendor, no pricing, no disclosed architecture. OpenRouter lists it at $0/M in and $0/M out with a 1M context and a 131k completion ceiling, which is the usual arrangement for a stealth entry: the run is free because the provider keeps the prompts. It ran all three suites on August 21: [AHK-Eval](post.html?slug=ahk-eval-benchmark) (36 cold one-shot functions, 181 hidden cases), [AHK-Repair](post.html?slug=ahk-repair-benchmark) (30 broken submissions to fix minimally), and [AHK-Contract](post.html?slug=ahk-contract-benchmark) (24 OOP class contracts). Ninety calls, ninety clean returns, zero API failures. Total spend: **$0.00**.

<div class="bm-wrap"><table class="bm-heat"><thead><tr><th style="text-align:left">Suite</th><th>solved</th><th>cases</th><th>parse fails</th><th>rank</th></tr></thead><tbody><tr><td class="h-name">AHK-Eval</td><td class="h-blue">33/36</td><td class="h-blue">167/181</td><td class="h-emer">0</td><td class="h-blue">10/39</td></tr><tr><td class="h-name">AHK-Repair</td><td class="h-blue">19/30</td><td class="h-amber">105/151</td><td class="h-emer">0</td><td class="h-emer">4/20</td></tr><tr><td class="h-name">AHK-Contract</td><td class="h-amber">19/24</td><td class="h-amber">149/173</td><td class="h-dim">1</td><td class="h-amber">6/10</td></tr></tbody></table></div>

<img src="posts/img/bench/sweep-three-suites.svg" alt="Grouped columns: AHK-Eval, AHK-Repair and AHK-Contract tasks solved for Grok 4.6, Gemini 3.7 Flash, DeepSeek V4 Pro 0813, Ox Alpha and GPT-6 Astra" style="max-width:100%;border:1px solid #303030;border-radius:8px;background:#141414">

The placement is upper-middle and the failure profile is not. **Fifty-nine of sixty** eval and contract submissions parsed clean on the first try. Almost nothing this model got wrong was a reasoning error, a control-flow error, or an algorithm error. It got things wrong because it does not know what is in the AutoHotkey v2 standard library, and confidently writes the method a JavaScript programmer would expect to find.

## A Tier Curve That Doesn't Slope

<div class="bm-wrap"><table class="bm-heat"><thead><tr><th style="text-align:left">Tier</th><th>solved</th></tr></thead><tbody><tr><td class="h-name">easy</td><td class="h-blue">11/12</td></tr><tr><td class="h-name">mid</td><td class="h-emer">12/12</td></tr><tr><td class="h-name">hard</td><td class="h-blue">10/12</td></tr></tbody></table></div>

Most entries on this board slope: easy is free, mid costs a task or two, hard is where the score is decided. Ox Alpha is one of three entries in thirty-nine to drop an easy task while sweeping mid 12/12, and its 10 on hard puts it among the twelve arms that have cleared double digits there.

The easy task it lost is `AE_Acronym` — first letter of each space-separated word, uppercased — which **33 of 39 entries solve**. Its algorithm is correct. Its delimiter is not:

```ahk
for word in StrSplit(s, " `t`r`n")     ; one 4-character delimiter, not four delimiters
```

`StrSplit` takes either a single delimiter string or an *array* of them. Passing four characters as one string asks AHK to split on the literal sequence space-tab-CR-LF, which never occurs, so the phrase comes back as a single element and the acronym is its first letter. 1/5 cases. The fix is two brackets.

By category it swept regex, data and numbers 6/6, and dropped one each in strings, datetime and algorithms. The two hard misses were `AE_NaturalSort` (solved by 7 of 39 — the suite's hardest item) and `AE_AddBusinessDays`, where the business-day arithmetic is entirely correct and the return value is not:

```ahk
result := DateAdd(result, 1, "Days")   ; returns YYYYMMDDHH24MISS
return result                          ; spec wants YYYYMMDD
```

Expected `20260615`, returned `20260615000000`. 0/5 for six trailing zeroes.

## The Invented Standard Library

This is the finding. Three independent tasks across two suites, one reflex:

```ahk
pairs.Sort(AE_NatCmp)              ; AE_NaturalSort        0/5   — no Array.Sort in v2
AC_Resource.Log.Join(",")          ; AC_Resource           0/8   — no Array.Join in v2
stack.Length()                     ; AE_BracketsBalanced   0/5   — Length is a property
```

The third throws `This value of type "Array" has no method named "Length"` — verified against the fork. Eighteen cases, three tasks, two suites, one habit.

AHK v2's `Array` has `Push`, `Pop`, `InsertAt`, `RemoveAt`, `Delete`, `Has`, `Clone`, `Get` and `Length`. It has no `Sort`, no `Join`, no `Map`, no `Filter`. Every one of those absences is a place Ox Alpha reached for the JavaScript equivalent and got a runtime throw instead. `AC_Resource` is the clearest case — a lifecycle-logging class where the constructor, the `Close()` guard, the `__Delete` destructor and the static state map are all correct, and the single line that renders the log to a string takes the whole task to zero.

A pre-run smoke test had already shown the same instinct in miniature: asked for a string-reversing function, it returned `return StrReverse(s)`, which is not an AHK built-in either.

## Three Quotes Is Not an Escaped Quote

The run's only parse failure across ninety calls is `AC_Proxy`, and it is a convention import rather than a mistake:

```ahk
throw MethodError("AC_Proxy has no method """ name """.")   ; (10) Missing space or operator
```

That is the C# and VB doubled-quote escape. AHK v2 does not read `"""` as *quote-escape-quote* — it closes the string on the first quote and reads the remaining pair as an empty string literal, leaving a bare variable with no operator in front of it. Verified directly against the v2.1-alpha.30+Console binary; the backtick form parses and prints correctly:

```ahk
x := "no method `"" name "`"."      ; -> no method "Foo".
```

Everything else in that submission — the `^(Get|Set)(.+)$` dispatch, the case-sensitive suffix handling, the arity check ordered before the store lookup — was correct and never ran. Eight cases for one escape convention.

## Repair: Fourth of Twenty, and Five Calls That Ran Out of Room

19/30 is the strongest of the three results, placing it fourth behind the two Gemini Flash arms and Grok 4.6 on a suite where the median entry fixes twelve. Its minimality of **0.863** is second in the top five: when it fixes something, it disturbs very little of the original. It is also one of only two entries in that top five with **zero parse failures across all thirty items**.

The interesting part is the eleven it missed, because five of them share a mechanical cause. Ox Alpha reports `reasoning_tokens: 0` on every one of the ninety calls, but it plainly reasons — eval calls averaged 25 seconds, repair 89, and one contract call ran **631 seconds**. Whatever it is doing is billed as completion, and on repair it ran out of room:

<div class="bm-wrap"><table class="bm-heat"><thead><tr><th style="text-align:left">Suite</th><th>median tokens</th><th>cap</th><th>calls at cap</th><th>of those, failed</th></tr></thead><tbody><tr><td class="h-name">eval</td><td class="h-emer">1,007</td><td class="h-dim">16,000</td><td class="h-emer">0</td><td class="h-name">—</td></tr><tr><td class="h-name">contract</td><td class="h-blue">1,969</td><td class="h-dim">20,000</td><td class="h-amber">2</td><td class="h-amber">1</td></tr><tr><td class="h-name">repair</td><td class="h-blue">2,987</td><td class="h-dim">16,000</td><td class="h-red">5</td><td class="h-red">5</td></tr></tbody></table></div>

**All five repair calls that hit the ceiling failed.** The most vivid is `Opus_4-8__AE_ExtractDigits`: 509 seconds, the full 16,000 tokens, and a 210-byte answer that leaves the original bug exactly where it found it and bolts a debug line onto the end.

```ahk
if (A_LoopField >= "0" && A_LoopField <= "9")   ; ==> Expected a Number but got a String.
    result .= A_LoopField
...
MsgBox AE_ExtractDigits("a1b22c333")            ; added, not asked for
```

The bug is alpha.30's strict relational typing — `>=` against a non-numeric string throws rather than comparing characters. Sixteen thousand tokens of invisible deliberation did not find it, and the submission came back with a `MsgBox` it did not have before. On the two contract calls that hit the 20,000 cap the split was cleaner: `AC_Scheduler` came back at 6/6, `AC_Resource` at 0/8.

The practical read: the historical board ran most arms at 8,000 output tokens and Ox Alpha at 16,000, and it still saturated on a sixth of the repair suite. Its repair number should be treated as a floor, not a ceiling — a higher cap would likely move it.

## What Free Buys

Ninety calls for nothing, in two hours and seven minutes of wall clock. That is the trade: **$0.00** against Grok 4.6's $1.86 and Gemini 3.7 Flash's $0.27 for the identical ninety calls, and Gemini finished those in about four seconds each while Ox Alpha's median repair call took eighty-nine.

It is not competitive at the top. 33/36 ties Gemini 3.7 Flash on eval but sits two tasks off the 35/36 record, and its contract result is mid-pack. What it is, unusually, is *diagnosable*. Its failures are not spread thinly across reasoning quality — they concentrate into four namable causes, and every one of them is a lookup rather than a capability:

<div class="bm-wrap"><table class="bm-heat"><thead><tr><th style="text-align:left">Cause</th><th>cost</th></tr></thead><tbody><tr><td class="h-name">Invented Array methods (Sort, Join, Length())</td><td class="h-red">18 cases</td></tr><tr><td class="h-name">C#-style <code>"""</code> quote escape</td><td class="h-red">8 cases</td></tr><tr><td class="h-name">Output cap exhaustion on repair</td><td class="h-red">5 items</td></tr><tr><td class="h-name">Return-format drift (DateAdd)</td><td class="h-amber">5 cases</td></tr><tr><td class="h-name">StrSplit delimiter set as one string</td><td class="h-amber">4 cases</td></tr></tbody></table></div>

Those rows overlap by one: `AE_BracketsBalanced` both saturated the cap and threw on `.Length()`, and is attributed above to the proximate cause.

A model that writes structurally sound AHK and then calls `.Join()` on an array is not failing at programming. It is failing at one page of documentation. That is a far better position to be in than the reverse, and it is the reason this entry is worth watching when it comes out from behind the curtain.

*Disclosure: Claude Opus 5 generated this entry via the OpenRouter API and wrote this post. Every number comes from the same pipeline that graded the rest of the board — parse validation against the v2.1-alpha.30+Console fork, headless execution, and hidden test cases the model never saw. The quote-escape and strict-typing claims above were verified directly against that binary. One repair item was initially logged as a parse failure on a transient WSL vsock fault rather than a script error; it was re-validated (exit 0), re-graded in isolation, and the stored record corrected to 0 parse failures. The item fails either way, so the 19/30 score is unaffected.*
