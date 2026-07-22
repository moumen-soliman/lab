"use client";

import WheelList from "./inertial-wheel-list";

// Every quarter hour of the day; the wheel starts on 9:00 AM (index 36).
export const TIMES: string[] = [];
for (let m = 0; m < 24 * 60; m += 15) {
  const h = Math.floor(m / 60);
  TIMES.push(`${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`);
}

export default function WheelListExample() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {/* Default: the 3D drum. Selection derives from the scroll position and
          commits when the snap settles. */}
      <WheelList
        items={TIMES}
        label="Pick a start time"
        initialIndex={36}
        onStateChange={(state) => console.log(state.settled ? `selected ${state.value}` : "coasting")}
      />

      {/* drum={false}: a flat wheel — keeps the scale + fade, drops the rotateX. */}
      <WheelList items={TIMES} label="Pick a start time" initialIndex={36} drum={false} />
    </div>
  );
}
