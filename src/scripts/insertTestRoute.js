import { supabase } from '../lib/supabase';

/**
 * Script para insertar la ruta de prueba GUAYA-MUCO
 * Ejecutar con: npx expo run:android (o desde un componente de prueba)
 */
export const insertTestRoute = async () => {
  try {
    // Datos de la ruta
    const routeData = {
      name: 'GUAYA - MUCO',
      description: 'Ruta que conecta Guaya con Muco',
      color: '#FF66CC',
    };

    // 1. Insertar la ruta
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .insert(routeData)
      .select()
      .single();

    if (routeError) throw routeError;
    console.log('✅ Ruta creada:', route);

    // 2. Extraer puntos del GeoJSON
    const geojsonPoints = [
      [-63.264148, 10.626675],
      [-63.264073, 10.626727],
      [-63.264007, 10.626774],
      [-63.263939, 10.626822],
      [-63.263884, 10.626864],
      [-63.263815, 10.626916],
      [-63.263752, 10.626965],
      [-63.263677, 10.627022],
      [-63.263473, 10.627179],
      [-63.263261, 10.627341],
      [-63.262862, 10.627654],
      [-63.262329, 10.628054],
      [-63.262233, 10.628118],
      [-63.261843, 10.628344],
      [-63.261149, 10.628679],
      [-63.260612, 10.628897],
      [-63.260007, 10.629153],
      [-63.2592, 10.629368],
      [-63.258679, 10.629485],
      [-63.258258, 10.629561],
      [-63.25761, 10.629666],
      [-63.257517, 10.629692],
      [-63.257447, 10.629735],
      [-63.257394, 10.629797],
      [-63.257339, 10.629923],
      [-63.257276, 10.63005],
      [-63.257149, 10.630191],
      [-63.256767, 10.630483],
      [-63.256378, 10.630723],
      [-63.255916, 10.630874],
      [-63.255663, 10.630905],
      [-63.255409, 10.630907],
      [-63.255126, 10.630889],
      [-63.254876, 10.630915],
      [-63.254682, 10.630997],
      [-63.254597, 10.631092],
      [-63.254543, 10.631197],
      [-63.25451, 10.631356],
      [-63.254951, 10.63526],
      [-63.255087, 10.636646],
      [-63.255155, 10.637249],
      [-63.255206, 10.63771],
      [-63.25524, 10.638007],
      [-63.255276, 10.638297],
      [-63.25531, 10.638606],
      [-63.255335, 10.638842],
      [-63.255379, 10.639207],
      [-63.255504, 10.640169],
      [-63.255516, 10.640304],
      [-63.255533, 10.640401],
      [-63.255591, 10.640619],
      [-63.255779, 10.640742],
      [-63.255868, 10.640818],
      [-63.255931, 10.640907],
      [-63.255937, 10.64107],
      [-63.255816, 10.641378],
      [-63.255667, 10.641713],
      [-63.255547, 10.642067],
      [-63.255487, 10.64241],
      [-63.255475, 10.642602],
      [-63.255491, 10.643269],
      [-63.255497, 10.643329],
      [-63.255575, 10.643689],
      [-63.255683, 10.643975],
      [-63.255794, 10.644195],
      [-63.255893, 10.644466],
      [-63.255982, 10.644959],
      [-63.256023, 10.645202],
      [-63.256049, 10.645323],
      [-63.256065, 10.645451],
      [-63.25609, 10.645659],
      [-63.256123, 10.645885],
      [-63.256158, 10.646104],
      [-63.256189, 10.646334]
    ];

    // 3. Insertar los puntos de la ruta
    const routePoints = geojsonPoints.map((coord, index) => ({
      route_id: route.id,
      lat: coord[1], // GeoJSON usa [lng, lat]
      lng: coord[0],
      order: index,
    }));

    const { error: pointsError } = await supabase
      .from('route_points')
      .insert(routePoints);

    if (pointsError) throw pointsError;
    console.log(`✅ ${routePoints.length} puntos de ruta insertados`);

    // 4. Crear conductores de prueba
    const drivers = [
      { name: 'Juan Pérez', phone: '+58 412-1234567' },
      { name: 'María González', phone: '+58 416-7654321' },
      { name: 'Carlos Rodríguez', phone: '+58 414-9876543' },
    ];

    const { data: insertedDrivers, error: driversError } = await supabase
      .from('drivers')
      .insert(drivers)
      .select();

    if (driversError) throw driversError;
    console.log(`✅ ${insertedDrivers.length} conductores creados`);

    // 5. Crear buses de prueba en la ruta
    const buses = insertedDrivers.map((driver, index) => ({
      plate: `AB${String(100 + index).padStart(3, '0')}X`,
      driver_id: driver.id,
      route_id: route.id,
      capacity: 40,
    }));

    const { data: insertedBuses, error: busesError } = await supabase
      .from('buses')
      .insert(buses)
      .select();

    if (busesError) throw busesError;
    console.log(`✅ ${insertedBuses.length} buses creados`);

    // 6. Asignar ubicaciones iniciales a los buses (distribuidos en la ruta)
    const busLocations = insertedBuses.map((bus, index) => {
      // Distribuir buses en diferentes puntos de la ruta
      const pointIndex = Math.floor((index / insertedBuses.length) * routePoints.length);
      const point = routePoints[Math.min(pointIndex, routePoints.length - 1)];
      
      // Añadir pequeña variación aleatoria
      const latVariation = (Math.random() - 0.5) * 0.0005;
      const lngVariation = (Math.random() - 0.5) * 0.0005;

      return {
        bus_id: bus.id,
        current_lat: point.lat + latVariation,
        current_lng: point.lng + lngVariation,
        route_id: route.id,
        is_active: true,
      };
    });

    const { error: locationsError } = await supabase
      .from('bus_locations')
      .insert(busLocations);

    if (locationsError) throw locationsError;
    console.log(`✅ ${busLocations.length} ubicaciones de buses asignadas`);

    console.log('🎉 ¡Ruta de prueba GUAYA-MUCO insertada exitosamente!');
    console.log(`📊 Resumen:
      - Ruta: ${route.name} (ID: ${route.id})
      - Puntos: ${routePoints.length}
      - Conductores: ${insertedDrivers.length}
      - Buses: ${insertedBuses.length}
      - Ubicaciones: ${busLocations.length}
    `);

    return {
      route,
      routePoints,
      drivers: insertedDrivers,
      buses: insertedBuses,
      locations: busLocations,
    };

  } catch (error) {
    console.error('❌ Error al insertar ruta de prueba:', error);
    throw error;
  }
};

// Función para limpiar datos de prueba
export const cleanTestData = async () => {
  try {
    // Eliminar ubicaciones de buses
    await supabase
      .from('bus_locations')
      .delete()
      .neq('bus_id', 0);

    // Eliminar buses
    await supabase
      .from('buses')
      .delete()
      .neq('id', 0);

    // Eliminar conductores
    await supabase
      .from('drivers')
      .delete()
      .neq('id', 0);

    // Eliminar puntos de ruta
    await supabase
      .from('route_points')
      .delete()
      .neq('id', 0);

    // Eliminar rutas
    await supabase
      .from('routes')
      .delete()
      .neq('id', 0);

    console.log('🧹 Datos de prueba eliminados');
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
  }
};