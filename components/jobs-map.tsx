"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/lib/jobs";

type Props = {
  jobs: Job[];
  activeCity: string | null;
  selectedJob: string | null;
  onCitySelect: (city: string) => void;
  onJobSelect: (id: string) => void;
};

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    window.addEventListener("resize", refresh);
    refresh();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, [map]);

  return null;
}

export default function JobsMap({ jobs, activeCity, selectedJob, onCitySelect, onJobSelect }: Props) {
  const groups = useMemo(() => {
    const grouped = new Map<string, Job[]>();
    jobs.forEach((job) => grouped.set(job.city, [...(grouped.get(job.city) ?? []), job]));
    return [...grouped.entries()];
  }, [jobs]);

  return (
    <MapContainer
      center={[37.61, -122.28]}
      zoom={9}
      minZoom={8}
      maxZoom={13}
      scrollWheelZoom
      zoomControl={false}
      className="jobs-map"
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {groups.map(([city, cityJobs]) => {
        const first = cityJobs[0];
        return (
          <CircleMarker
            key={city}
            center={[first.latitude, first.longitude]}
            radius={activeCity === city ? 19 : 16}
            pathOptions={{
              color: "#fffdf8",
              weight: 4,
              fillColor: activeCity === city ? "#e77445" : "#34594d",
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onCitySelect(city) }}
          >
            <Popup minWidth={230} maxWidth={300}>
              <div className="map-popup">
                <strong>{city}</strong>
                <span>{cityJobs.length} open engineering {cityJobs.length === 1 ? "role" : "roles"}</span>
                {cityJobs.slice(0, 5).map((job) => (
                  <button
                    className={`popup-job ${selectedJob === job.id ? "is-selected" : ""}`}
                    key={job.id}
                    onClick={() => onJobSelect(job.id)}
                    type="button"
                  >
                    <span>{job.title}</span>
                    <small>{job.company}</small>
                  </button>
                ))}
                {cityJobs.length > 5 && <small className="popup-more">+ {cityJobs.length - 5} more roles in the list</small>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
