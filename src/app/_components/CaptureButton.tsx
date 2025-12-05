"use client";

import { useCallback } from "react";
import { Button } from "antd";
import dayjs from "dayjs";
import domtoimage from "dom-to-image";
import { AiOutlineCamera } from "react-icons/ai";

import useChartTypeStore from "@/_shared/store/type-3/chartType";
import useTargetRefStore from "@/_shared/store/type-3/targetRef";

export default function CaptureButton() {
  const today = dayjs().format("YYYYMMDD_HHmmss");

  const { targetRef } = useTargetRefStore();

  const { chartType } = useChartTypeStore();

  const handleCapture = useCallback(() => {
    if (!targetRef?.current) return;

    domtoimage
      .toPng(targetRef.current)
      .then((dataUrl: string) => {
        const link = document.createElement("a");
        link.download = `${chartType}chart_${today}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error: unknown) => {});
  }, [targetRef, chartType, today]);

  return (
    <Button
      onClick={handleCapture}
      icon={
        <AiOutlineCamera style={{ fontSize: "2.2rem", marginTop: "0.25rem" }} />
      }
    />
  );
}
