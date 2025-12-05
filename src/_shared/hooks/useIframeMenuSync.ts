"use client";

import { useEffect, useRef } from "react";

import useMenuKeyStore from "../store/useMenuKeyStore";

export default function useIframeMenuSync() {
  const { menuKey, setMenuKey } = useMenuKeyStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const latestMenuKeyRef = useRef(menuKey);
  const initialSrcRef = useRef(menuKey);
  const fromIframeRef = useRef(false);

  useEffect(() => {
    latestMenuKeyRef.current = menuKey;
  }, [menuKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (fromIframeRef.current) {
      fromIframeRef.current = false;
      return;
    }

    try {
      const current = iframe.contentWindow
        ? iframe.contentWindow.location.pathname +
          iframe.contentWindow.location.search +
          iframe.contentWindow.location.hash
        : "";
      if (current !== menuKey) {
        iframe.src = menuKey;
      }
    } catch {
      iframe.src = menuKey;
    }
  }, [menuKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanup: () => void = () => {};

    const bindToIframeWindow = () => {
      const win = iframe.contentWindow;
      if (!win) return;

      const getPath = () => {
        try {
          return (
            win.location.pathname + win.location.search + win.location.hash
          );
        } catch {
          return "";
        }
      };

      const syncFromIframe = () => {
        const path = getPath();
        if (path && path !== latestMenuKeyRef.current) {
          fromIframeRef.current = true;
          setMenuKey(path);
        }
      };

      const onPopState = () => syncFromIframe();
      const onHashChange = () => syncFromIframe();
      const onPageShow = () => syncFromIframe();
      const onLoad = () => syncFromIframe();

      win.addEventListener("popstate", onPopState);
      win.addEventListener("hashchange", onHashChange);
      win.addEventListener("pageshow", onPageShow);
      win.addEventListener("load", onLoad);

      syncFromIframe();

      cleanup = () => {
        try {
          win.removeEventListener("popstate", onPopState);
          win.removeEventListener("hashchange", onHashChange);
          win.removeEventListener("pageshow", onPageShow);
          win.removeEventListener("load", onLoad);
        } catch {}
      };
    };

    bindToIframeWindow();

    const handleLoad = () => {
      cleanup();
      bindToIframeWindow();
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      cleanup();
    };
  }, []);

  return { iframeRef, initialSrc: initialSrcRef.current } as const;
}
