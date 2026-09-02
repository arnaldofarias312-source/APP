// src/scripts/insertTestData.js
import { supabase } from '../lib/supabase';

export const insertTestData = async () => {
  try {
    console.log('📦 Insertando datos de prueba...');

    // 1. Verificar que existe la línea GUAYA-MUCO
    const { data: linea, error: lineaError } = await supabase
      .from('lineas')
      .select('*')
      .eq('id', 'linea-el-muco')
      .single();

    if (lineaError) {
      console.log('⚠️ Línea GUAYA-MUCO no encontrada. Creando...');
      const { data: newLinea, error: newLineaError } = await supabase
        .from('lineas')
        .insert({
          id: 'linea-el-muco',
          nombre: 'GUAYA-MUCO',
          color_hex: '#FF66CC'
        })
        .select()
        .single();
      
      if (newLineaError) throw newLineaError;
      console.log('✅ Línea creada:', newLinea);
    } else {
      console.log('✅ Línea encontrada:', linea);
    }

    // 2. Verificar conductores
    const { data: conductores, error: condError } = await supabase
      .from('conductores')
      .select('*')
      .eq('lineas_id', 'linea-el-muco');

    if (condError) throw condError;

    if (conductores.length === 0) {
      console.log('⚠️ No hay conductores para GUAYA-MUCO. Creando...');
      const { data: newConductores, error: newCondError } = await supabase
        .from('conductores')
        .insert([
          {
            id: 'cond-test-1',
            nombre: 'Test',
            apellido: 'Conductor 1',
            autobus_identificador: 'TM-01',
            lineas_id: 'linea-el-muco',
            cedula: '12345678'
          },
          {
            id: 'cond-test-2',
            nombre: 'Test',
            apellido: 'Conductor 2',
            autobus_identificador: 'TM-02',
            lineas_id: 'linea-el-muco',
            cedula: '87654321'
          }
        ])
        .select();
      
      if (newCondError) throw newCondError;
      console.log('✅ Conductores creados:', newConductores.length);
    } else {
      console.log('✅ Conductores encontrados:', conductores.length);
    }

    console.log('🎉 Datos de prueba verificados!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};