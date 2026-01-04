import React from "react";

const MapEmbed = ({ vehicles }) => {
  const defaultCenter = { lat: 10.776944, lng: 106.700981 };
  const center =
    vehicles && vehicles.length > 0
      ? vehicles.reduce(
          (acc, v) => ({
            lat: acc.lat + v.location.lat,
            lng: acc.lng + v.location.lng,
          }),
          { lat: 0, lng: 0 }
        )
      : null;

  let lat = defaultCenter.lat;
  let lng = defaultCenter.lng;

  if (center) {
    lat = center.lat / vehicles.length;
    lng = center.lng / vehicles.length;
  }

  const delta = 0.05;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;

  return <iframe title="map" className="map-iframe" src={src}></iframe>;
};

export default MapEmbed;
