// src/services/routeDataService.js
import { guayaMucoGeoJSON } from '../data/rutas/guaya-muco.js';

// Mapeo de IDs de líneas a sus datos GeoJSON
const routeGeoJSON = {
  'linea-el-muco': guayaMucoGeoJSON,
  // 'linea-22agosto': ruta22Agosto,
  // 'linea-canchunchu': rutaCanchunchu,
  // Agregar más líneas aquí cuando tengas sus GeoJSON
};

/**
 * Servicio para obtener datos de rutas desde archivos GeoJSON
 */
export const routeDataService = {
  /**
   * Obtiene los puntos de una ruta desde su GeoJSON
   * @param {string} lineaId - ID de la línea
   * @returns {Array} Array de puntos {lat, lng}
   */
  getRoutePoints(lineaId) {
    const geoJSON = routeGeoJSON[lineaId];
    
    if (!geoJSON) {
      console.warn(`⚠️ No se encontró GeoJSON para la línea: ${lineaId}`);
      return [];
    }

    try {
      const features = geoJSON.features || [];
      if (features.length === 0) {
        console.warn(`⚠️ El GeoJSON de ${lineaId} no tiene features`);
        return [];
      }

      const coordinates = features[0].geometry?.coordinates || [];
      
      if (coordinates.length === 0) {
        console.warn(`⚠️ El GeoJSON de ${lineaId} no tiene coordenadas`);
        return [];
      }
      
      const points = coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));

      console.log(`✅ ${points.length} puntos de ruta cargados para línea ${lineaId}`);
      return points;
    } catch (error) {
      console.error(`❌ Error al procesar GeoJSON para ${lineaId}:`, error);
      return [];
    }
  },

  /**
   * Verifica si una línea tiene ruta definida
   */
  hasRoute(lineaId) {
    return !!routeGeoJSON[lineaId];
  }
};

// Exportación por defecto para compatibilidad
export default routeDataService;