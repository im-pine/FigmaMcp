"use client";

import { useState } from "react";
import { QuantityStepper } from "@/shared/ui/QuantityStepper";

export function StepperDemo() {
  const [qty, setQty] = useState(1);
  return <QuantityStepper value={qty} onChange={setQty} />;
}
