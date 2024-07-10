// @ts-nocheck
import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import dataMex from "./data-mexico";
import { scalePow } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";

const generateColorRange = (baseColor: string) => {
  const lighterColor = interpolateRgb(baseColor, "#ffffff")(0.99);
  const darkerColor = interpolateRgb(baseColor, "#000000")(0.01);

  // Usar una escala de potencia en lugar de una escala lineal
  return scalePow<string>()
    .exponent(0.3) // Ajusta este valor para controlar la curvatura de la escala
    .domain([0, 50, 100])
    .range([lighterColor, baseColor, darkerColor])
    .clamp(true); // Asegura que los valores fuera del dominio se ajusten al rango
};

export const AvanceMapa = ({
  data,
  baseColor = "#fff",
}: {
  data: any[];
  baseColor?: string;
}) => {
  const [tooltipContent, setTooltipContent] = useState("");

  const colorScale = useMemo(
    () => generateColorRange(baseColor, 10),
    [baseColor],
  );

  return (
    <>
      <ComposableMap
        className="w-full max-h-[600px] h-[60vh] overflow-hidden"
        projection="geoMercator"
        projectionConfig={{
          center: [-102, 24],
          scale: 1450,
        }}>
        <Geographies geography={dataMex}>
          {({ geographies }: any) =>
            geographies.map((geo: any) => {
              const porcentajeAvance = data.find(
                (s: any) => s.entidad == geo.properties.clave,
              );
              const percentage = porcentajeAvance ? porcentajeAvance.count : 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={porcentajeAvance ? colorScale(percentage) : "#2A272A"}
                  stroke="#2A272A"
                  strokeWidth={1.5}
                  style={{
                    default: {
                      outline: "none",
                    },
                    hover: {
                      fill: porcentajeAvance
                        ? interpolateRgb(colorScale(percentage), "#000000")(0.3)
                        : interpolateRgb("#2A272A", "#000000")(0.3),
                      stroke: "#2A272A",
                      strokeWidth: 2.5,
                      outline: "none",
                      transition: "all 250ms",
                    },
                  }}
                  onMouseEnter={() => {
                    setTooltipContent(
                      `${
                        porcentajeAvance
                          ? porcentajeAvance.nombreEntidad
                          : "N/A"
                      }: ${percentage}%`,
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
