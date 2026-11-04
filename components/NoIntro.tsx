"use client";

import { useEffect } from "react";
import { useIntro } from "./Providers";

/** For pages without the boot intro: marks it finished straight away, so the nav shows up. */
export function NoIntro() {
  const { finishIntro } = useIntro();
  useEffect(() => finishIntro(), [finishIntro]);
  return null;
}
