import React from "react";
import { SketchIcon } from "sketchicon";

const ROUGHNESS = 2;
const STROKE_WIDTH = 2;

export default function Icono({ icon, size = 20, ...props }) {
  return (
    <SketchIcon
      icon={icon}
      size={size}
      roughness={ROUGHNESS}
      strokeWidth={STROKE_WIDTH}
      color="currentColor"
      aria-hidden="true"
      {...props}
    />
  );
}