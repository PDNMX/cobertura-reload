// @ts-nocheck
import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import dataMex from "./data-mexico";
import { scalePow } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import { Info, MapPin, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

const ColorLegend = ({ colorScale, width, height, x, y }) => {
  const gradientId = "colorGradient";
  const numStops = 20; // Número de paradas en el gradiente

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {Array.from({ length: numStops }, (_, i) => i / (numStops - 1)).map(
            (t) => (
              <stop
                key={t}
                offset={`${t * 100}%`}
                stopColor={colorScale(t * 100)}
              />
            )
          )}
        </linearGradient>
      </defs>
      <rect
        stroke="#888888"
        strokeWidth={0.5}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
      />
      <text fill="#888" x="0" y={height + 15} fontSize="12">
        0%
      </text>
      <text
        fill="#888"
        x={width}
        y={height + 15}
        fontSize="12"
        textAnchor="end"
      >
        100%
      </text>
    </g>
  );
};

const TOTAL_ENTIDADES = 33; // 32 entidades federativas + Federación

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
    [baseColor]
  );

  const entidadesConectadas = useMemo(
    () => data.filter((d) => d.count > 0).length,
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Mapa de avance</CardTitle>
            <CardDescription>
              En la integración de sujetos obligados por entidad a la PDN
            </CardDescription>
          </div>
          <div
            className="shrink-0 rounded-xl border-2 overflow-hidden min-w-[150px]"
            style={{ borderColor: `${baseColor}50` }}
          >
            {/* Header del indicador */}
            <div
              className="flex items-center gap-1.5 px-3 py-2"
              style={{ backgroundColor: `${baseColor}18` }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: baseColor }} />
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: baseColor }}>
                Entidades conectadas
              </p>
            </div>

            {/* Número principal */}
            <div className="px-3 pt-2 pb-1">
              <div className="flex items-end gap-1 leading-none">
                <span className="text-4xl font-black tabular-nums" style={{ color: baseColor }}>
                  {entidadesConectadas}
                </span>
                <span className="text-base font-medium text-muted-foreground mb-1">
                  / {TOTAL_ENTIDADES}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                32 entidades federativas y la Federación
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="px-3 pb-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((entidadesConectadas / TOTAL_ENTIDADES) * 100)}%`,
                    backgroundColor: baseColor,
                  }}
                />
              </div>
            </div>

            {/* Porcentaje */}
            <div
              className="flex items-center justify-end gap-1 px-3 py-1.5"
              style={{ backgroundColor: `${baseColor}10` }}
            >
              <CheckCircle2 className="h-3 w-3" style={{ color: baseColor }} />
              <span className="text-sm font-bold tabular-nums" style={{ color: baseColor }}>
                {Math.round((entidadesConectadas / TOTAL_ENTIDADES) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ComposableMap
          className="w-full max-h-[420px] h-[45vh] overflow-hidden"
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
                const percentage = porcentajeAvance
                  ? porcentajeAvance.count
                  : 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      (percentage && porcentajeAvance) || Number(percentage)
                        ? colorScale(percentage)
                        : "#fff"
                    }
                    stroke="#888888"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none",
                      },
                      hover: {
                        fill:
                          (percentage && porcentajeAvance) || Number(percentage)
                            ? interpolateRgb(
                                colorScale(percentage),
                                "#000000"
                              )(0.3)
                            : interpolateRgb("#fff", "#000000")(0.3),
                        strokeWidth: 1,
                        outline: "none",
                        transition: "all 250ms",
                      },
                    }}
                    onMouseEnter={() => {
                      setTooltipContent(
                        `${porcentajeAvance.nombreEntidad}: ${
                          Number(percentage) ? percentage + "%" : "0%"
                        }`
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
          <ColorLegend
            colorScale={colorScale}
            width={150}
            height={15}
            x={620}
            y={40}
          />
        </ComposableMap>
        <Tooltip id="my-tooltip" content={tooltipContent} />

        <div className="mt-3 flex items-start gap-1.5 rounded-md border border-muted bg-muted/30 px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Los datos reflejan las interconexiones actualmente reportadas por
            las SESEAS en cada sistema de la PDN. Una entidad se considera
            conectada cuando al menos uno de sus entes públicos tiene registro
            activo en el sistema. Esta información no corresponde a solicitudes
            de interconexión pendientes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
