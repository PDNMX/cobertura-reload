// @ts-nocheck
import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import dataMex from "./data-mexico";
import { scaleLinear } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";

const generateColorRange = (baseColor: string) => {
  const lighterColor = interpolateRgb(baseColor, "#ffffff")(0.9);
  const darkerColor = interpolateRgb(baseColor, "#000000")(0.1);
  return scaleLinear<string>()
    .domain([0, 100])
    .range([lighterColor, darkerColor]);
};

export const AvanceMapa = ({
  data,
  baseColor = "#fff",
}: {
  data: any[];
  baseColor?: string;
}) => {
  const [tooltipContent, setTooltipContent] = useState("");
  
  const colorScale = useMemo(() => generateColorRange(baseColor, 10), [baseColor]);

  return (
    <>
      <ComposableMap
        className="w-full max-h-[600px] h-[60vh] overflow-hidden"
        projection="geoMercator"
        projectionConfig={{
          center: [-102, 24],
          scale: 1450,
        }}
      >
        <Geographies geography={dataMex}>
          {({ geographies }: any) =>
            geographies.map((geo: any) => {
              const porcentajeAvance = data.find(
                (s: any) => s.entidad == geo.properties.clave
              );
              const percentage = porcentajeAvance ? porcentajeAvance.count : 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={porcentajeAvance ? colorScale(percentage) : "#d7d7d7"}
                  stroke="#535658"
                  style={{
                    hover: {
                      stroke: "#d7d7d7",
                    },
                  }}
                  onMouseEnter={() => {
                    setTooltipContent(
                      `${porcentajeAvance ? porcentajeAvance.nombreEntidad : 'N/A'}: ${percentage}%`
                    );
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  data-tooltip-id="my-tooltip"
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip id="my-tooltip" content={tooltipContent} />
    </>
  );
};
