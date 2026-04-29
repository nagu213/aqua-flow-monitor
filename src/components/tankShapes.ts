export type TankShape =
  | "classic"
  | "cylindrical-vertical"
  | "cylindrical-horizontal"
  | "spherical"
  | "dome-top"
  | "loft-low"
  | "conical-bottom"
  | "capsule"
  | "hexagonal"
  | "industrial-silo";

export interface TankTemplate {
  id: TankShape;
  name: string;
  description: string;
}

export const TANK_TEMPLATES: TankTemplate[] = [
  { id: "classic", name: "Classic Cuboid", description: "Standard rectangular overhead tank" },
  { id: "cylindrical-vertical", name: "Vertical Cylinder", description: "Sintex-style upright cylinder" },
  { id: "cylindrical-horizontal", name: "Horizontal Cylinder", description: "Lying-down cylindrical tank" },
  { id: "spherical", name: "Spherical", description: "Pressure-rated round ball tank" },
  { id: "dome-top", name: "Dome Top", description: "Cylinder with hemispherical roof" },
  { id: "loft-low", name: "Low Loft", description: "Wide low-profile loft tank" },
  { id: "conical-bottom", name: "Conical Bottom", description: "Industrial cone-bottom tank" },
  { id: "capsule", name: "Capsule", description: "Pill-shaped pharma-style tank" },
  { id: "hexagonal", name: "Hexagonal", description: "Six-sided modern designer tank" },
  { id: "industrial-silo", name: "Industrial Silo", description: "Tall narrow silo with skirt" },
];
