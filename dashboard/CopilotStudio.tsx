// gn-apex/src/components/copilot-studio/CopilotStudio.tsx
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";

// Copy this package's `src/` and `studio/` folders (keep them as siblings) to:
//   gn-apex/src/lib/copilot-widget/{src,studio}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CopilotStudio({ project, onClose }: { project: any; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      // Dynamic import: the widget touches `HTMLElement`/`document`, so it must never run during SSR.
      const { mountStudio } = await import("@/lib/copilot-widget/studio/studio");
      if (cancelled || !ref.current) return;

      cleanup = mountStudio(ref.current, {
        projectId: project.id,
        projectName: project.name,
        apiUrl: apiClient.defaults.baseURL, // only used for the "Live AI replies" toggle
        siteUrl: project.subdomain ? `https://${project.subdomain}.gnapex.com` : undefined,
        onClose,

        // LOAD: the client's exact saved settings (authed), with the same fallbacks the public endpoint applies.
        loadConfig: async () => {
          const { data } = await apiClient.get(`/ai-agent/project/${project.id}/config`);
          const c = data?.config ?? {};
          return {
            ...c,
            theme: { ...c.theme, primaryColor: c.theme?.primaryColor || project.designConfig?.primaryColor || "#06b6d4" },
            persona: {
              ...c.persona,
              name: c.persona?.name || `${project.name} Assistant`,
              avatarUrl: c.persona?.avatarUrl || project.profile?.logoUrl || "",
              greeting: c.persona?.greeting || `Hello! How can I assist you with ${project.name} today?`,
            },
            behavior: {
              ...c.behavior,
              suggestedQuestions: c.behavior?.suggestedQuestions?.length
                ? c.behavior.suggestedQuestions
                : ["What services do you offer?", "How can I get in touch?", "Where are you located?"],
            },
          };
        },

        // SAVE: goes through your apiClient (auth, refresh, base URL all handled).
        saveUi: async (ui) => {
          await apiClient.patch(`/ai-agent/project/${project.id}/config`, { ui });
          qc.invalidateQueries({ queryKey: ["project-ai-config", project.id] });
        },
      });
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  return <div ref={ref} className="h-full w-full" />;
}
