"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type JobsMap from "@/components/jobs-map";

const Map = dynamic(() => import("@/components/jobs-map"), {
  ssr: false,
  loading: () => <div className="map-loading"><span className="map-loading-dot" />Preparing the Bay Area map</div>,
});

export default function MapLoader(props: ComponentProps<typeof JobsMap>) {
  return <Map {...props} />;
}
