import { SubmissionVerdict } from "@/prisma-client";
import type { CodeExecutor, JudgeResult, JudgeTestCase } from "./types";
import type { SupportedLanguage } from "./languages";

const FAILURE_MESSAGE_LIMIT = 4_000;
const HIDDEN_RUNTIME_ERROR_MESSAGE =
  "Runtime error on a hidden test. Check edge cases and input handling.";

function truncateFailureMessage(message: string) {
  const normalized = message.trim();
  return normalized.length > FAILURE_MESSAGE_LIMIT
    ? `${normalized.slice(0, FAILURE_MESSAGE_LIMIT)}...`
    : normalized;
}

function runtimeFailureMessage(result: Awaited<ReturnType<CodeExecutor>>, isSample?: boolean) {
  if (!isSample) {
    return HIDDEN_RUNTIME_ERROR_MESSAGE;
  }

  const detail = result.stderr.trim();
  if (detail) {
    return truncateFailureMessage(detail);
  }

  if (typeof result.exitCode === "number") {
    return `Program exited with code ${result.exitCode}.`;
  }

  if (result.signal) {
    return `Program exited with signal ${result.signal}.`;
  }

  return "Program failed at runtime.";
}

export function normalizeOutput(output: string) {
  return output
    .replace(/[ \t]+$/gm, "")
    .replace(/\r\n/g, "\n")
    .trimEnd();
}

export async function judgeSubmission({
  code,
  executor,
  language,
  testCases,
  timeLimitMs,
}: {
  code: string;
  executor: CodeExecutor;
  language: SupportedLanguage;
  testCases: JudgeTestCase[];
  timeLimitMs: number;
}): Promise<JudgeResult> {
  let passedCount = 0;
  let runtimeMs = 0;
  let verdict: SubmissionVerdict = SubmissionVerdict.ACCEPTED;
  let failureMessage: string | null = null;

  for (const testCase of testCases) {
    const result = await executor({ language, code, stdin: testCase.input, timeLimitMs });

    if (typeof result.runtimeMs === "number") {
      runtimeMs += result.runtimeMs;
    }

    if (result.compileError) {
      return {
        verdict: SubmissionVerdict.COMPILE_ERROR,
        passedCount,
        totalCount: testCases.length,
        runtimeMs,
        failureMessage: truncateFailureMessage(result.compileError),
      };
    }

    if (result.timedOut || result.signal === "SIGKILL" || result.signal === "SIGTERM") {
      verdict = SubmissionVerdict.TLE;
      continue;
    }

    if (result.exitCode !== 0) {
      if (verdict !== SubmissionVerdict.TLE) {
        verdict = SubmissionVerdict.RUNTIME_ERROR;
      }
      failureMessage ??= runtimeFailureMessage(result, testCase.isSample);
      continue;
    }

    if (normalizeOutput(result.stdout) !== normalizeOutput(testCase.expectedOutput)) {
      if (verdict === SubmissionVerdict.ACCEPTED) {
        verdict = SubmissionVerdict.WRONG_ANSWER;
      }
      continue;
    }

    passedCount += 1;
  }

  return {
    verdict,
    passedCount,
    totalCount: testCases.length,
    runtimeMs,
    failureMessage,
  };
}
