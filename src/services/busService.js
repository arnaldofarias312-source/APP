// src/services/busService.js
import { supabase } from '../lib/supabase';

export const busService = {
  async getRoutes() {
    const { data, error } = await supabase
      .from('lineas')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async getBusesNearby(lat, lng, radiusKm = 2.5) {
    try {
      const { data: ubicaciones, error } = await supabase
        .from('ubicaciones')
        .select(`
          *,
          jornadas!inner (
            id,
            conductor_id,
            activa,
            conductores (
              id,
              nombre,
              apellido,
              autobus_identificador,
              lineas_id,
              lineas (
                id,
                nombre,
                color_hex
              )
            )
          )
        `)
        .order('capturado_en', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error en getBusesNearby:', error);
        return [];
      }

      if (!ubicaciones || ubicaciones.length === 0) {
        return [];
      }

      const busMap = new Map();
      
      ubicaciones.forEach(ubic => {
        const jornada = ubic.jornadas;
        if (!jornada || !jornada.activa) return;
        
        const key = jornada.conductor_id;
        if (!busMap.has(key) || ubic.capturado_en > busMap.get(key).capturado_en) {
          const conductorData = jornada.conductores || {};
          const lineasData = conductorData.lineas || {};
          
          busMap.set(key, {
            id: ubic.id,
            jornada_id: jornada.id,
            lat: ubic.lat,
            lng: ubic.lng,
            precision_metros: ubic.precision_metros,
            capturado_en: ubic.capturado_en,
            velocidad: ubic.velocidad,
            conductor: {
              id: conductorData.id,
              nombre: conductorData.nombre || '',
              apellido: conductorData.apellido || '',
              autobus_identificador: conductorData.autobus_identificador || '',
              lineas_id: conductorData.lineas_id,
            },
            linea: {
              id: lineasData.id,
              nombre: lineasData.nombre || '',
              color_hex: lineasData.color_hex || '#1B3FA6',
            },
          });
        }
      });

      const buses = Array.from(busMap.values());

      return buses.filter(bus => {
        const distance = this.calculateDistance(
          lat, lng,
          bus.lat, bus.lng
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error en getBusesNearby:', error);
      return [];
    }
  },

  async getBusesByRoute(lineaId) {
    try {
      const { data: conductores, error } = await supabase
        .from('conductores')
        .select(`
          id,
          nombre,
          apellido,
          autobus_identificador,
          lineas_id,
          lineas (
            id,
            nombre,
            color_hex
          ),
          jornadas (
            id,
            activa,
            ubicaciones (
              id,
              lat,
              lng,
              precision_metros,
              capturado_en,
              velocidad
            )
          )
        `)
        .eq('lineas_id', lineaId);

      if (error) {
        console.error('Error en getBusesByRoute:', error);
        return [];
      }

      if (!conductores || conductores.length === 0) {
        return [];
      }

      const buses = [];

      conductores.forEach(conductor => {
        const jornadaActiva = conductor.jornadas?.find(j => j.activa === true);
        if (!jornadaActiva) return;

        const ubicaciones = jornadaActiva.ubicaciones || [];
        if (ubicaciones.length === 0) return;

        const ultimaUbic = ubicaciones.reduce((a, b) => 
          a.capturado_en > b.capturado_en ? a : b
        );

        buses.push({
          id: ultimaUbic.id,
          jornada_id: jornadaActiva.id,
          lat: ultimaUbic.lat,
          lng: ultimaUbic.lng,
          precision_metros: ultimaUbic.precision_metros,
          capturado_en: ultimaUbic.capturado_en,
          velocidad: ultimaUbic.velocidad,
          conductor: {
            id: conductor.id,
            nombre: conductor.nombre || '',
            apellido: conductor.apellido || '',
            autobus_identificador: conductor.autobus_identificador || '',
            lineas_id: conductor.lineas_id,
          },
          linea: {
            id: conductor.lineas?.id,
            nombre: conductor.lineas?.nombre || '',
            color_hex: conductor.lineas?.color_hex || '#1B3FA6',
          },
        });
      });

      return buses;
    } catch (error) {
      console.error('Error en getBusesByRoute:', error);
      return [];
    }
  },

  async getRouteDetails(lineaId) {
    const { data, error } = await supabase
      .from('lineas')
      .select('*')
      .eq('id', lineaId)
      .single();

    if (error) throw error;
    return data;
  },

  // getRoutePath eliminado - no se usa

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },
};