// gn-apex/src/app/(dashboard)/dashboard/project/[projectId]/settings/tabs/CopilotStudioCard.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./_sections";
import CopilotStudio from "@/components/copilot-studio/CopilotStudio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CopilotStudioCard({ project }: { project: any }) {
  const [open, setOpen] = useState(false);

  // Lock page scroll while the full-screen Studio is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <Section
        title="Website widget"
        description="Design how the chat widget looks and behaves on your live website: colours, launcher, window, persona and more."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
            Open the Studio to preview changes live on desktop and mobile, start from a template, and publish when you&apos;re happy.
          </p>
          <Button type="button" onClick={() => setOpen(true)} className="h-10 shrink-0 gap-2 rounded-xl text-xs font-semibold">
            <Palette size={14} />
            Open Copilot Studio
          </Button>
        </div>
      </Section>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] bg-background">
            <CopilotStudio project={project} onClose={() => setOpen(false)} />
          </div>,
          document.body,
        )}
    </>
  );
}
