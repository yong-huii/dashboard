import { useEffect, useState } from "react";

/**
 * 다중 신호 기반 기기 정보 (100% 정확도는 브라우저 한계로 불가 / 근사)
 */
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchCapable: boolean;
  isLandscape: boolean;
  formFactor:
    | "mobile"
    | "tablet"
    | "desktop"
    | "desktop-touch"
    | "laptop"
    | "unknown";
  ua: string;
  platform: string | undefined;
  maxTouchPoints: number;
  isAndroid: boolean;
  isIOS: boolean;
  isWindows: boolean;
  isMac: boolean;
  clientHints?: {
    platform?: string;
    mobile?: boolean;
    brands?: any;
  };
}

const getInitialInfo = (): DeviceInfo => ({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchCapable: false,
  isLandscape: false,
  formFactor: "unknown",
  ua: "",
  platform: undefined,
  maxTouchPoints: 0,
  isAndroid: false,
  isIOS: false,
  isWindows: false,
  isMac: false,
});

export const useDeviceInfo = () => {
  const [info, setInfo] = useState<DeviceInfo>(getInitialInfo);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav: any = navigator;
    const ua: string = nav.userAgent || "";
    const platform = nav.platform;
    const ch = nav.userAgentData; // Chromium Client Hints
    const maxTouch: number = nav.maxTouchPoints || 0;
    const hasTouch = "ontouchstart" in window || maxTouch > 0;
    const pointerCoarse = matchMedia("(pointer: coarse)").matches;

    const isAndroid = /Android/i.test(ua);
    const isIPhone = /iPhone/i.test(ua);
    const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && maxTouch > 1);
    const isIOS = isIPhone || isIPad;
    const isWindows = /Windows NT/i.test(ua);
    const isMac = /Macintosh/i.test(ua) && !isIPad;

    const mobileByUA = /(iPhone|Android.+Mobile|Phone)/i.test(ua);
    const mobileByCH = !!ch?.mobile;
    const isMobile = mobileByUA || mobileByCH;

    const isAndroidTablet =
      isAndroid && !/Mobile/i.test(ua) && window.innerWidth >= 600;
    const tabletUA = /Tablet|Tab\b/i.test(ua);
    const isTablet = !isMobile && (isIPad || isAndroidTablet || tabletUA);
    const isDesktop = !isMobile && !isTablet;

    let isLaptopHeuristic = false;
    if (isDesktop) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width >= 1000 && width <= 1920 && height <= 1300) {
        if (hasTouch || pointerCoarse || maxTouch > 0) isLaptopHeuristic = true;
      }
    }

    let formFactor: DeviceInfo["formFactor"] = "unknown";
    if (isMobile) formFactor = "mobile";
    else if (isTablet) formFactor = "tablet";
    else if (isDesktop && hasTouch) formFactor = "desktop-touch";
    else if (isLaptopHeuristic) formFactor = "laptop";
    else if (isDesktop) formFactor = "desktop";

    const isLandscape = window.innerWidth > window.innerHeight;

    setInfo({
      isMobile,
      isTablet,
      isDesktop,
      isTouchCapable: hasTouch,
      isLandscape,
      formFactor,
      ua,
      platform,
      maxTouchPoints: maxTouch,
      isAndroid,
      isIOS,
      isWindows,
      isMac,
      clientHints: ch
        ? { platform: ch.platform, mobile: ch.mobile, brands: ch.brands }
        : undefined,
    });

    const onResize = () => {
      setInfo(prev => ({
        ...prev,
        isLandscape: window.innerWidth > window.innerHeight,
      }));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return info;
};

// 기존 API 호환용 래퍼
export const useIsMobile = () => useDeviceInfo().isMobile;
export const useIsPad = () => useDeviceInfo().isTablet;
