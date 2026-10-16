"use client";

import { useState } from "react";
import { RequestResetStep } from "./_components/requestResetStep";
import { ResetPasswordStep } from "./_components/resetPasswordStep";
import { ResetCompleteStep } from "./_components/resetCompleteStep";

type Step = "request" | "reset" | "complete";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("request");

  switch (step) {
    case "request":
      return <RequestResetStep onSent={() => setStep("reset")} />;
    case "reset":
      return <ResetPasswordStep onComplete={() => setStep("complete")} />;
    case "complete":
      return <ResetCompleteStep />;
  }
}
