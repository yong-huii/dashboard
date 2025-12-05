"use client";

import CaptureButton from "@/app/_components/CaptureButton";

import ChartIconButtonList from "./ChartIconButtonList";
import Title from "./Title";

export default function TitleSection() {
  return (
    <div className="col-span-12 row-span-3 flex items-center justify-between rounded-lg bg-white px-[1rem] shadow-md lg:row-span-2">
      <Title />
      <div className="flex items-center gap-[1rem]">
        <ChartIconButtonList />
        <div className="h-[2.2rem] w-[0.1rem] bg-[#55588A]" />
        <CaptureButton />
      </div>
    </div>
  );
}
