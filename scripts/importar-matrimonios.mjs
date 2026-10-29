import 'dotenv/config';
import ExcelJS from 'exceljs';
import pg from 'pg';

const { Client } = pg;

function texto(celda) {
  const valor = celda.value;

  if (valor === null || valor === undefined) {
    return '';
  }

  // No importamos fórmulas ni objetos ambiguos como datos.
  if (
    typeof valor === 'object' &&
    !Array.isArray(valor.richText)
  ) {
    throw new Error(
      `La celda ${celda.address} debe contener un valor simple`,
    );
  }

  return celda.text.trim().replace(/\s+/g, ' ');
}

function fechaISO(celda, usa1904) {
  const valor = celda.value;

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw new Error('Fecha inválida');
    }

    return valor.toISOString().slice(0, 10);
  }

  // Fechas almacenadas como número de serie de Excel.
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    if (valor < 1 || valor > 2958465) {
      throw new Error('Número de fecha fuera de rango');
    }

    const base = usa1904
      ? Date.UTC(1904, 0, 1)
      : Date.UTC(1899, 11, 30);

    const fecha = new Date(
      base + Math.floor(valor) * 86400000,
    );

    if (Number.isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }

    return fecha.toISOString().slice(0, 10);
  }

  // Fechas almacenadas como texto: día/mes/año.
  const entrada = texto(celda);
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(
    entrada,
  );

  if (!partes) {
    throw new Error('La fecha debe tener formato DD/MM/AAAA');
  }

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const anio = Number(partes[3]);

  if (anio < 1900 || anio > 9999) {
    throw new Error('Año fuera de rango');
  }

  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fecha.getUTCFullYear() !== anio ||
    fecha.getUTCMonth() !== mes - 1 ||
    fecha.getUTCDate() !== dia
  ) {
    throw new Error('Fecha inexistente');
  }

  return fecha.toISOString().slice(0, 10);
}

function normalizarEncabezado(valor) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

async function importar() {
  const archivo = process.argv[2];

  if (!archivo) {
    throw new Error(
      'Uso: npm run matrimonios:importar -- ./archivo.xlsx',
    );
  }

  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(archivo);

  const hoja = libro.worksheets[0];

  if (!hoja) {
    throw new Error('El archivo no contiene hojas');
  }

  const esperados = [
    'NUMERO',
    'NEXPEDIENTE',
    'CONTRAYENTES',
    'CEREMONIA',
    'AUTORIDADCELEBRANTE',
    'NUMEROACTA',
  ];

  for (let i = 0; i < esperados.length; i++) {
    const actual = normalizarEncabezado(
      texto(hoja.getRow(1).getCell(i + 1)),
    );

    if (actual !== esperados[i]) {
      throw new Error(
        `Encabezado incorrecto en columna ${i + 1}. ` +
          `Se esperaba ${esperados[i]}`,
      );
    }
  }

  const registros = [];
  const errores = [];
  const actasArchivo = new Map();

  // Primero validamos todo el archivo, sin escribir en la BD.
  for (let fila = 2; fila <= hoja.rowCount; fila++) {
    const row = hoja.getRow(fila);

    const vacia = [1, 2, 3, 4, 5, 6].every((columna) => {
      const valor = row.getCell(columna).value;
      return valor === null || valor === undefined || valor === '';
    });

    if (vacia) continue;

    try {
      const registro = {
        fila,
        numeroActa: texto(row.getCell(6)),
        numeroExpediente: texto(row.getCell(2)),
        contrayentes: texto(row.getCell(3)),
        fechaCeremonia: fechaISO(
          row.getCell(4),
          Boolean(libro.properties.date1904),
        ),
        autoridadCelebrante: texto(row.getCell(5)),
      };

      if (!/^\d{1,30}$/.test(registro.numeroActa)) {
        throw new Error(
          'El número de acta debe contener entre 1 y 30 dígitos',
        );
      }

      if (
        !registro.numeroExpediente ||
        registro.numeroExpediente.length > 50
      ) {
        throw new Error('Expediente vacío o mayor de 50 caracteres');
      }

      if (!registro.contrayentes || !registro.autoridadCelebrante) {
        throw new Error('Faltan contrayentes o autoridad celebrante');
      }

      const primeraFila = actasArchivo.get(registro.numeroActa);

      if (primeraFila !== undefined) {
        throw new Error(
          `Acta repetida dentro del Excel; también está en fila ${primeraFila}`,
        );
      }

      actasArchivo.set(registro.numeroActa, fila);
      registros.push(registro);
    } catch (error) {
      errores.push({
        fila,
        motivo: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (errores.length) {
    console.table(errores);
    throw new Error(
      'El Excel tiene errores. No se importó ninguna fila.',
    );
  }

  if (!registros.length) {
    throw new Error('El Excel no contiene registros para importar');
  }

  for (const nombre of [
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ]) {
    if (!process.env[nombre]) {
      throw new Error(`Falta la variable ${nombre}`);
    }
  }

  const cliente = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  await cliente.connect();

  let insertados = 0;
  let omitidos = 0;
  const observados = [];

  try {
    await cliente.query('BEGIN');

    for (const registro of registros) {
      const valores = [
        registro.numeroActa,
        registro.numeroExpediente,
        registro.contrayentes,
        registro.fechaCeremonia,
        registro.autoridadCelebrante,
      ];

      const insercion = await cliente.query(
        `
          INSERT INTO matrimonios (
            numero_acta,
            numero_expediente,
            contrayentes,
            fecha_ceremonia,
            autoridad_celebrante
          )
          VALUES ($1, $2, $3, $4::date, $5)
          ON CONFLICT (numero_acta) DO NOTHING
          RETURNING id
        `,
        valores,
      );

      if (insercion.rowCount === 1) {
        insertados++;
        continue;
      }

      const comparacion = await cliente.query(
        `
          SELECT
            numero_expediente = $2
            AND contrayentes = $3
            AND fecha_ceremonia = $4::date
            AND autoridad_celebrante = $5
            AS iguales
          FROM matrimonios
          WHERE numero_acta = $1
          FOR SHARE
        `,
        valores,
      );

      if (comparacion.rows[0]?.iguales === true) {
        omitidos++;
      } else {
        observados.push({
          fila: registro.fila,
          numero_acta: registro.numeroActa,
          motivo: 'El acta existe con datos diferentes. No se modificó.',
        });
      }
    }

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    await cliente.end();
  }

  console.log({
    leidos: registros.length,
    insertados,
    omitidos,
    observados: observados.length,
  });

  if (observados.length) {
    console.table(observados);
    process.exitCode = 2;
  }
}

importar().catch((error) => {
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});