import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import dataMex from "./data-mexico";
import { scaleQuantile } from "d3-scale";

export const AvanceMapa = ({ data }: any) => {
  const colorScale = scaleQuantile()
    .domain(data.map((d:any) => d.count))
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618",
    ]);
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        center: [-102, 24],
        scale: 1200,
      }}>
      <Geographies geography={dataMex}>
        {({ geographies } : any) =>
          geographies.map((geo:any) => {
            const cur = data.find((s:any) => s.entidad === geo.properties.clave);
            return <Geography 
                    key={geo.rsmKey} 
                    geography={geo} 
                    fill={cur ? colorScale(cur.count) : "#EEE"}
                    />;
          })
        }
      </Geographies>
    </ComposableMap>
  );
};
