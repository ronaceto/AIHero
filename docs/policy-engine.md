# StudySidekickAI V1 Policy Engine Spec

## Decision pipeline
1. **Authenticate and authorize** user/class membership.
2. **Normalize input** (trim, locale detect, redact obvious PII for classification).
3. **Pre-check classification** for policy risks.
4. **Teacher/class rule evaluation**.
5. **Model generation** with guarded system prompt.
6. **Post-check validation** of model output.
7. **Response shaping** (allowed/blocked/modified) + student-safe explanation.
8. **Audit persistence** (`policy_flags`, `audit_events`) and teacher dashboard signal.

## Pseudocode
```pseudo
function handleStudentMessage(ctx):
  assertAuthenticated(ctx.user)
  assertClassMembership(ctx.user.id, ctx.classId)

  rules = getActiveRuleSet(ctx.classId)
  normalized = normalizeInput(ctx.message)

  pre = classifyRequest(normalized, rules)
  if pre.blocked:
    refusal = buildRefusal(pre.reasonCode, ctx.toolMode, ctx.gradeLevel)
    saveBlockedInteraction(ctx, pre, refusal)
    return blockedResponse(refusal, pre.reasonCode)

  systemPrompt = buildSystemPrompt(
    toolMode=ctx.toolMode,
    gradeLevel=ctx.gradeLevel,
    rules=rules,
    responsibleAiReminders=true
  )

  modelResp = callModel(systemPrompt, ctx.history + normalized)
  post = validateModelOutput(modelResp, rules)

  if post.blocked:
    refusal = buildRefusal(post.reasonCode, ctx.toolMode, ctx.gradeLevel)
    saveBlockedInteraction(ctx, post, refusal)
    return blockedResponse(refusal, post.reasonCode)

  safeOutput = maybeRewrite(modelResp, post.requiredEdits)
  saveAllowedInteraction(ctx, safeOutput, post.flags)

  return allowedResponse(
    text=safeOutput,
    reminder="Verify with your class notes and teacher resources.",
    flags=post.flags
  )
```

## Refusal taxonomy (V1)
- `ACADEMIC_INTEGRITY_FULL_ASSIGNMENT`
  - User asks AI to complete graded work fully.
  - Response: refuse completion; offer outline/questions/hints.
- `ACADEMIC_INTEGRITY_EXAM_CHEATING`
  - Requests to cheat on tests/quizzes.
  - Response: refuse and redirect to study prep.
- `RESTRICTED_TOPIC`
  - Topic banned by teacher or school policy.
  - Response: decline and suggest permitted alternatives.
- `PII_REQUEST`
  - User shares/asks for sensitive personal information handling.
  - Response: redact guidance and privacy reminder.
- `HARMFUL_CONTENT`
  - Violence/self-harm/illegal instructions.
  - Response: safety refusal and appropriate support messaging.
- `COPYRIGHT_PLAGIARISM_RISK`
  - Requests exact copying or plagiarism.
  - Response: provide paraphrasing/study strategy only.
- `UNSUPPORTED_MEDICAL_OR_LEGAL_ADVICE`
  - High-risk professional advice requests.
  - Response: safe limitation + trusted-source recommendation.
- `MODEL_OUTPUT_POLICY_VIOLATION`
  - Post-check caught unsafe/over-complete response.
  - Response: fallback refusal and regenerate in safe mode.

## Teacher rule precedence
1. Global platform safety baseline (non-overridable).
2. District/school policies.
3. Class-level teacher rules.
4. Tool-mode defaults.

## Logging requirements
For every blocked or modified outcome, store:
- `reason_code`
- `rule_set_version`
- `tool_mode`
- `student_id`, `class_id`
- `message_id` (if generated)
- minimal redacted excerpt for audit

## Minimal refusal message templates
- **Integrity refusal**: “I can’t do the assignment for you, but I can help you learn it step-by-step.”
- **Topic restriction**: “That topic is restricted for this class. Try one of these approved alternatives: …”
- **PII refusal**: “Please remove personal/private details. I can still help with the learning task.”
