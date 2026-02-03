/**
 * H3 Geospatial Indexing Utilities
 * 
 * Functions to calculate H3 indexes at various resolutions
 */

import { latLngToCell } from "npm:h3-js";

/**
 * Get H3 index for a given latitude, longitude, and resolution
 */
export function getH3Index(
  latitude: number,
  longitude: number,
  resolution: number
): string {
  return latLngToCell(latitude, longitude, resolution);
}

/**
 * Get all H3 indexes for resolutions 1-10
 */
export function getH3Indexes(
  latitude: number,
  longitude: number
): {
  h3_res_1: string;
  h3_res_2: string;
  h3_res_3: string;
  h3_res_4: string;
  h3_res_5: string;
  h3_res_6: string;
  h3_res_7: string;
  h3_res_8: string;
  h3_res_9: string;
  h3_res_10: string;
} {
  return {
    h3_res_1: latLngToCell(latitude, longitude, 1),
    h3_res_2: latLngToCell(latitude, longitude, 2),
    h3_res_3: latLngToCell(latitude, longitude, 3),
    h3_res_4: latLngToCell(latitude, longitude, 4),
    h3_res_5: latLngToCell(latitude, longitude, 5),
    h3_res_6: latLngToCell(latitude, longitude, 6),
    h3_res_7: latLngToCell(latitude, longitude, 7),
    h3_res_8: latLngToCell(latitude, longitude, 8),
    h3_res_9: latLngToCell(latitude, longitude, 9),
    h3_res_10: latLngToCell(latitude, longitude, 10),
  };
}
