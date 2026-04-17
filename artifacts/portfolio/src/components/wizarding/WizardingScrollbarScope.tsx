import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import "./wizarding.css";

type WizardingScrollbarScopeProps = PropsWithChildren<{
  className?: string;
  as?: "div" | "main" | "section";
}>;

export function WizardingScrollbarScope({
  children,
  className,
  as = "div",
}: WizardingScrollbarScopeProps) {
  const Component = as;

  return <Component className={cn("wizarding-scrollbar-scope", className)}>{children}</Component>;
}
