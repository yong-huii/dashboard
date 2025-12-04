"use client";

import useIframeMenuSync from "@/_shared/hooks/useIframeMenuSync";

export default function Main() {
  const { iframeRef, initialSrc } = useIframeMenuSync();

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        src={initialSrc}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Progress"
      />
    </div>
  );
}
