import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

// 1. Tipagem para as propriedades customizadas que vêm de cada comarca no JSON
export interface ComarcaProperties {
  comarca_tjsp?: string;
  COMARCA_TJSP?: string;
  raj_sigla?: string;
  RAJ_SIGLA?: string;
  id_raj?: string;
  raj_nome?: string;
  cj_nome?: string;
  juiz_diretor_nome?: string;
  juiz_diretor_email?: string;
}

// 2. Tipagem para uma feição (Feature) individual do seu GeoJSON
export type ComarcaFeature = {
  type: "Feature";
  geometry: Polygon | MultiPolygon;
  properties: ComarcaProperties;
};

// 3. Tipagem completa para o arquivo JSON inteiro (Coleção de Feições)
export type ComarcasGeoJSON = FeatureCollection<Polygon | MultiPolygon, ComarcaProperties>;