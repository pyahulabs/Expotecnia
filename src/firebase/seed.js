// Datos de demostración (contexto paraguayo) para que la app se vea completa.
// Los ids son fijos: volver a cargar el seed restablece estos documentos sin duplicarlos.

import { CLIMA_PREGUNTAS, COLECCIONES, CRITERIOS_DESEMPENO, EMPRESAS } from '@/config/constants'
import { addDays, toISODate } from '@/lib/format'
import { clearCollections, dataMode, setMany } from './hooks'
import { baseWasSeeded, markBaseSeeded, markSeeded, wasSeeded } from './localStore'

// Generador pseudoaleatorio con semilla: siempre produce los mismos datos.
const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const dia = (offset) => toISODate(addDays(new Date(), offset))
const MIN = 60_000
const HORA = 60 * MIN

const EMPLEADOS = [
  ['emp-01', 'María José Benítez', 'Gerente General', 'Dirección', '2015-03-02', 'Activo'],
  ['emp-02', 'Carlos Giménez', 'Jefe de Finanzas', 'Finanzas', '2017-06-12', 'Activo'],
  ['emp-03', 'Lourdes Villalba', 'Analista Contable', 'Finanzas', '2021-02-01', 'Activo'],
  ['emp-04', 'Derlis Ayala', 'Jefe de Tecnología', 'Tecnología', '2018-09-17', 'Activo'],
  ['emp-05', 'Fabiola Rojas', 'Desarrolladora Full Stack', 'Tecnología', '2022-04-04', 'Activo'],
  ['emp-06', 'Óscar Cabañas', 'Analista de Soporte', 'Tecnología', '2023-08-21', 'Vacaciones'],
  ['emp-07', 'Nathalia Duarte', 'Jefa de Talento Humano', 'Talento Humano', '2016-11-07', 'Activo'],
  ['emp-08', 'Rodrigo Acosta', 'Analista de Selección', 'Talento Humano', '2024-03-11', 'Activo'],
  ['emp-09', 'Gloria Ortiz', 'Jefa de Calidad', 'Calidad', '2019-01-14', 'Activo'],
  ['emp-10', 'Hugo Franco', 'Inspector de Calidad', 'Calidad', '2022-10-03', 'Activo'],
  ['emp-11', 'Liz Paredes', 'Jefa de Operaciones', 'Operaciones', '2016-05-23', 'Activo'],
  ['emp-12', 'Arnaldo Vera', 'Supervisor de Planta', 'Operaciones', '2020-07-06', 'Activo'],
  ['emp-13', 'Cynthia Martínez', 'Operaria de Producción', 'Operaciones', '2025-02-17', 'Licencia'],
  ['emp-14', 'Miguel Ángel Sosa', 'Encargado de Logística', 'Operaciones', '2021-09-13', 'Activo'],
  ['emp-15', 'Andrea Galeano', 'Jefa Comercial', 'Comercial', '2018-02-19', 'Activo'],
  ['emp-16', 'Juan Pablo Riveros', 'Ejecutivo de Cuentas', 'Comercial', '2026-06-01', 'Activo'],
]

const PRESUPUESTOS = [
  ['Operaciones', 2_850_000_000, 2_614_000_000],
  ['Comercial', 1_420_000_000, 1_538_000_000],
  ['Tecnología', 980_000_000, 742_000_000],
  ['Talento Humano', 640_000_000, 498_000_000],
  ['Finanzas', 520_000_000, 401_000_000],
  ['Calidad', 410_000_000, 436_500_000],
  ['Dirección', 380_000_000, 296_000_000],
]

// Costos operativos de los últimos 12 meses (en millones de Gs.)
const COSTOS_MILLONES = [498, 512, 505, 531, 548, 540, 566, 579, 571, 598, 612, 604]

const FODA = {
  yvoty: {
    fortaleza: [
      'Marca reconocida en el mercado nacional, con 25 años de trayectoria',
      'Planta industrial propia en Luque con certificación de Buenas Prácticas de Manufactura',
      'Red de distribución que llega a los 17 departamentos del país',
      'Equipo técnico estable y con baja rotación',
    ],
    oportunidad: [
      'Crecimiento de la demanda de yerba mate en Brasil y Argentina',
      'Líneas de crédito blandas para pymes exportadoras',
      'Auge del comercio electrónico y de las apps de delivery',
      'Tendencia de consumo hacia alimentos saludables y sin gluten',
    ],
    debilidad: [
      'Procesos administrativos todavía en planillas de Excel',
      'Dependencia de pocos proveedores de materia prima',
      'Escasa presencia en redes sociales',
      'Costos logísticos elevados para llegar al Chaco',
    ],
    amenaza: [
      'Variación del tipo de cambio guaraní/dólar',
      'Contrabando de productos similares en zonas de frontera',
      'Sequías que afectan la cosecha de materia prima',
      'Ingreso de competidores regionales con precios bajos',
    ],
  },
  tecnopar: {
    fortaleza: [
      'Equipo joven con dominio de tecnologías web modernas',
      'Metodologías ágiles consolidadas en todos los proyectos',
      'Clientes recurrentes en el sector cooperativo',
    ],
    oportunidad: [
      'Digitalización acelerada de las pymes paraguayas',
      'Incentivos fiscales para la exportación de servicios de software',
      'Demanda regional de talento remoto',
    ],
    debilidad: [
      'Alta dependencia de dos clientes principales',
      'No cuenta con un área comercial formal',
      'Documentación interna escasa',
    ],
    amenaza: [
      'Fuga de talento hacia empresas del exterior',
      'Competencia de plataformas SaaS internacionales',
      'Cambios regulatorios en protección de datos personales',
    ],
  },
  nanduti: {
    fortaleza: [
      'Flota propia de 40 camiones con rastreo satelital',
      'Ubicación estratégica en la triple frontera',
      'Choferes con amplia experiencia en rutas internacionales',
    ],
    oportunidad: [
      'Corredor bioceánico en construcción',
      'Aumento sostenido del comercio fronterizo',
      'Convenios con operadores de la hidrovía Paraguay-Paraná',
    ],
    debilidad: [
      'Flota con una antigüedad promedio de 12 años',
      'Mantenimiento correctivo en lugar de preventivo',
      'Sistema de facturación sin integración con operaciones',
    ],
    amenaza: [
      'Suba del precio del combustible',
      'Cierres temporales de puentes y pasos fronterizos',
      'Bajante del río que encarece los fletes',
    ],
  },
}

const NO_CONFORMIDADES = [
  ['041', 'Temperatura de cámara fría fuera de rango', 'El registrador marcó 9 °C durante el turno noche; el límite es 5 °C.', 'abierto', 'Crítica', 'Arnaldo Vera', 'Operaciones', -2],
  ['040', 'Lote de yerba mate con etiquetado incorrecto', 'El lote L-0425 salió con fecha de vencimiento mal impresa.', 'abierto', 'Alta', 'Hugo Franco', 'Calidad', -4],
  ['038', 'Balanzas de envasado sin calibración vigente', 'Dos balanzas de la línea 1 tienen la calibración vencida hace 15 días.', 'abierto', 'Media', 'Arnaldo Vera', 'Operaciones', -7],
  ['035', 'Capacitación en BPM vencida en el turno noche', 'Cuatro operarios no renovaron la capacitación anual obligatoria.', 'abierto', 'Baja', 'Nathalia Duarte', 'Talento Humano', -12],
  ['039', 'Proveedor entregó harina sin certificado de análisis', 'La partida ingresó a depósito sin la documentación de calidad.', 'analisis', 'Alta', 'Gloria Ortiz', 'Calidad', -6],
  ['037', 'Reclamo de cliente por envases dañados en góndola', 'Supermercado de San Lorenzo reportó 18 paquetes con el sellado abierto.', 'analisis', 'Media', 'Andrea Galeano', 'Comercial', -9],
  ['036', 'Copia de seguridad del servidor sin verificar', 'No hay registro de pruebas de restauración en los últimos 3 meses.', 'analisis', 'Alta', 'Derlis Ayala', 'Tecnología', -11],
  ['034', 'Desvío de peso neto en la línea de envasado 2', 'El muestreo detectó paquetes de 500 g con hasta 12 g menos.', 'analisis', 'Crítica', 'Liz Paredes', 'Operaciones', -14],
  ['033', 'Procedimiento de limpieza desactualizado', 'El instructivo POE-07 no incluía el nuevo desinfectante.', 'resuelto', 'Baja', 'Hugo Franco', 'Calidad', -20],
  ['032', 'Facturas emitidas con RUC erróneo', 'Tres facturas a crédito se emitieron con el RUC de otro cliente.', 'resuelto', 'Media', 'Lourdes Villalba', 'Finanzas', -23],
  ['031', 'Derrame en zona de carga sin señalización', 'Se detectó aceite hidráulico en el muelle 3 sin conos ni aviso.', 'resuelto', 'Alta', 'Miguel Ángel Sosa', 'Operaciones', -27],
  ['030', 'Demora en la respuesta a tickets de soporte interno', 'El tiempo promedio de primera respuesta superó las 48 horas.', 'resuelto', 'Baja', 'Óscar Cabañas', 'Tecnología', -31],
  ['029', 'Registro de control de plagas incompleto', 'Faltaban las firmas de verificación de dos semanas.', 'resuelto', 'Media', 'Gloria Ortiz', 'Calidad', -35],
]

const TAREAS = [
  ['Configurar las reglas de seguridad de Firestore', 'Pasar de modo de prueba a reglas por rol antes de producción.', 'pendiente', 'Crítica', 'Derlis Ayala', 4, 'Backend'],
  ['Migrar el padrón de clientes desde Excel', 'Limpiar duplicados y normalizar RUC antes de importar.', 'pendiente', 'Alta', 'Fabiola Rojas', 6, 'Datos'],
  ['Preparar el stand para Expotecnia', 'Banner, monitor, QR de acceso y guion de la demo.', 'pendiente', 'Media', 'Andrea Galeano', 9, 'Evento'],
  ['Redactar el manual de usuario', 'Una página por módulo con capturas de pantalla.', 'pendiente', 'Media', 'Rodrigo Acosta', 12, 'Documentación'],
  ['Integrar el módulo de Talento Humano', 'Tabla de empleados, evaluación de desempeño y encuesta de clima.', 'progreso', 'Alta', 'Fabiola Rojas', 3, 'Frontend'],
  ['Simulador de escenarios del dashboard', 'Sliders de presupuesto y costos con proyección en vivo.', 'progreso', 'Alta', 'Derlis Ayala', 5, 'Analítica'],
  ['Tablero Kanban de no conformidades', 'Arrastrar y soltar entre Abierto, En análisis y Resuelto.', 'progreso', 'Media', 'Óscar Cabañas', 2, 'Frontend'],
  ['Diagrama de Gantt con ruta crítica', 'Dependencias con flechas y línea de hoy.', 'revision', 'Alta', 'Fabiola Rojas', 1, 'Frontend'],
  ['Validar el presupuesto por departamento', 'Revisar montos y alertas de exceso con Finanzas.', 'revision', 'Media', 'Carlos Giménez', 2, 'Finanzas'],
  ['Relevar los procesos de cada área', 'Entrevistas con los jefes de área y diagrama de procesos.', 'hecho', 'Media', 'María José Benítez', -30, 'Análisis'],
  ['Definir el sistema de diseño', 'Tokens de color, tipografía y componentes base.', 'hecho', 'Alta', 'Fabiola Rojas', -18, 'Diseño'],
  ['Modelar las colecciones en Firestore', 'Una colección por entidad, ids y campos documentados.', 'hecho', 'Alta', 'Derlis Ayala', -15, 'Backend'],
  ['Maquetar el layout y la navegación', 'Sidebar colapsable, header y modo oscuro.', 'hecho', 'Media', 'Óscar Cabañas', -10, 'Frontend'],
]

// [id, nombre, inicio, fin, avance, dependencias, responsable] — días relativos a hoy
const FASES = [
  ['fase-01', 'Relevamiento y análisis', -45, -32, 100, [], 'María José Benítez'],
  ['fase-02', 'Diseño de la arquitectura', -31, -22, 100, ['fase-01'], 'Derlis Ayala'],
  ['fase-03', 'Diseño de interfaz (UI/UX)', -31, -18, 100, ['fase-01'], 'Fabiola Rojas'],
  ['fase-04', 'Desarrollo del núcleo', -21, -8, 100, ['fase-02'], 'Derlis Ayala'],
  ['fase-05', 'Módulos de gestión', -7, 12, 55, ['fase-04', 'fase-03'], 'Fabiola Rojas'],
  ['fase-06', 'Dashboard y simulador', -7, 6, 70, ['fase-04'], 'Óscar Cabañas'],
  ['fase-07', 'Migración de datos', 2, 14, 10, ['fase-04'], 'Lourdes Villalba'],
  ['fase-08', 'Pruebas integrales', 13, 24, 0, ['fase-05', 'fase-06'], 'Gloria Ortiz'],
  ['fase-09', 'Capacitación de usuarios', 18, 26, 0, ['fase-07'], 'Nathalia Duarte'],
  ['fase-10', 'Puesta en producción', 25, 30, 0, ['fase-08'], 'Derlis Ayala'],
  ['fase-11', 'Soporte y mejora continua', 31, 45, 0, ['fase-10', 'fase-09'], 'Óscar Cabañas'],
]

const ACTIVIDAD = [
  ['Calidad', 'registró la no conformidad NC-041: Temperatura de cámara fría fuera de rango', 'crear', 'Arnaldo Vera', 12 * MIN],
  ['Proyectos', 'movió «Diagrama de Gantt con ruta crítica» a En revisión', 'mover', 'Fabiola Rojas', 38 * MIN],
  ['Finanzas', 'actualizó el ejecutado de Comercial a Gs. 1.538.000.000', 'editar', 'Carlos Giménez', 2 * HORA],
  ['Talento Humano', 'evaluó el desempeño de Hugo Franco (4,4 de 5)', 'crear', 'Nathalia Duarte', 3 * HORA],
  ['Planeación', 'agregó una oportunidad a la matriz FODA de Yvoty Alimentos S.A.', 'crear', 'María José Benítez', 5 * HORA],
  ['Calidad', 'resolvió la no conformidad NC-033: Procedimiento de limpieza desactualizado', 'mover', 'Hugo Franco', 9 * HORA],
  ['Talento Humano', 'dio de alta a Juan Pablo Riveros en Comercial', 'crear', 'Rodrigo Acosta', 26 * HORA],
  ['Proyectos', 'completó la fase «Desarrollo del núcleo»', 'mover', 'Derlis Ayala', 8 * 24 * HORA],
]

// Usuarios del sistema: [id, nombre, cargo, rol, estado]
const USUARIOS = [
  ['usr-01', 'María José Benítez', 'Gerente General', 'Administrador', 'Activo'],
  ['usr-02', 'Derlis Ayala', 'Jefe de Tecnología', 'Administrador', 'Activo'],
  ['usr-03', 'Carlos Giménez', 'Jefe de Finanzas', 'Editor', 'Activo'],
  ['usr-04', 'Nathalia Duarte', 'Jefa de Talento Humano', 'Editor', 'Activo'],
  ['usr-05', 'Gloria Ortiz', 'Jefa de Calidad', 'Editor', 'Activo'],
  ['usr-06', 'Andrea Galeano', 'Jefa Comercial', 'Lector', 'Activo'],
  ['usr-07', 'Óscar Cabañas', 'Analista de Soporte', 'Lector', 'Inactivo'],
]

const slugEmail = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')

/** Empresas de ejemplo (Planeación) y usuarios (Usuarios): la base para poder ingresar y trabajar. */
export function buildBaseData() {
  const now = Date.now()
  const items = []
  EMPRESAS.forEach((empresa, i) => {
    const { id, ...data } = empresa
    items.push({ name: COLECCIONES.empresas, id, data: { ...data, createdAt: now - (EMPRESAS.length - i) * MIN } })
  })
  USUARIOS.forEach(([id, nombre, cargo, rol, estado], i) => {
    const partes = nombre.split(' ')
    items.push({
      name: COLECCIONES.usuarios,
      id,
      data: { nombre, cargo, rol, estado, email: `${slugEmail(partes[0])}.${slugEmail(partes[partes.length - 1])}@yvoty.com.py`, createdAt: now - (USUARIOS.length - i) * HORA },
    })
  })
  return items
}

/** Arma la lista completa de documentos: [{ name, id, data }] */
export function buildDemoData() {
  const now = Date.now()
  const random = mulberry32(2026)
  const items = [...buildBaseData()]
  const push = (name, id, data) => items.push({ name, id, data })
  const slug = (text) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')

  // Empleados
  EMPLEADOS.forEach(([id, nombre, cargo, departamento, fechaIngreso, estado], i) => {
    const [first, ...rest] = nombre.split(' ')
    push(COLECCIONES.empleados, id, {
      nombre,
      cargo,
      departamento,
      email: `${slug(first)}.${slug(rest[rest.length - 1])}@yvoty.com.py`,
      telefono: `09${[81, 71, 61, 91, 82, 72, 83, 94][i % 8]} ${200 + ((i * 137) % 700)} ${100 + ((i * 251) % 800)}`,
      fechaIngreso,
      estado,
      createdAt: now - (EMPLEADOS.length - i) * HORA,
    })
  })

  // Evaluaciones de desempeño: dos períodos por empleado (el segundo, levemente mejor)
  EMPLEADOS.forEach(([id, nombre], i) => {
    const base = 3.3 + random() * 1.2
    ;[['2025-S2', -0.35, 330], ['2026-S1', -0.1, 150], ['2026-S2', 0.15, 20]].forEach(([periodo, ajuste, diasAtras]) => {
      if (periodo !== '2026-S2' && id === 'emp-16') return // ingresó en junio de 2026
      const criterios = {}
      CRITERIOS_DESEMPENO.forEach((c) => {
        criterios[c.id] = Math.min(5, Math.max(2, Math.round(base + ajuste + (random() - 0.5) * 1.6)))
      })
      const valores = Object.values(criterios)
      push(COLECCIONES.evaluaciones, `eval-${id}-${periodo}`, {
        empleadoId: id,
        empleado: nombre,
        periodo,
        criterios,
        promedio: Number((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2)),
        comentario: '',
        evaluador: 'Nathalia Duarte',
        createdAt: now - diasAtras * 24 * HORA - i * MIN,
      })
    })
  })

  // Encuesta de clima: 32 respuestas anónimas
  const sesgo = { liderazgo: 4.1, comunicacion: 3.6, equipo: 4.4, reconocimiento: 3.3, desarrollo: 3.5, ambiente: 4.2, equilibrio: 3.8, compromiso: 4.3 }
  const deptos = ['Operaciones', 'Operaciones', 'Comercial', 'Tecnología', 'Finanzas', 'Calidad', 'Talento Humano', 'Operaciones']
  for (let i = 0; i < 32; i++) {
    const respuestas = {}
    CLIMA_PREGUNTAS.forEach((p) => {
      respuestas[p.id] = Math.min(5, Math.max(1, Math.round(sesgo[p.id] + (random() - 0.5) * 2.2)))
    })
    push(COLECCIONES.clima, `clima-${String(i + 1).padStart(2, '0')}`, {
      respuestas,
      departamento: deptos[i % deptos.length],
      createdAt: now - (32 - i) * 5 * HORA,
    })
  }

  // Finanzas
  PRESUPUESTOS.forEach(([departamento, presupuesto, ejecutado], i) => {
    push(COLECCIONES.presupuestos, `pres-${slug(departamento)}`, { departamento, presupuesto, ejecutado, periodo: String(new Date().getFullYear()), createdAt: now - (10 - i) * MIN })
  })
  COSTOS_MILLONES.forEach((millones, i) => {
    const fecha = new Date(new Date().getFullYear(), new Date().getMonth() - (COSTOS_MILLONES.length - 1 - i), 1)
    const periodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    push(COLECCIONES.costos, `costo-${periodo}`, { periodo, costo: millones * 1_000_000, createdAt: fecha.getTime() })
  })

  // Planeación: FODA
  Object.entries(FODA).forEach(([empresaId, cuadrantes]) => {
    Object.entries(cuadrantes).forEach(([tipo, textos]) => {
      textos.forEach((texto, i) => {
        push(COLECCIONES.foda, `foda-${empresaId}-${tipo}-${i + 1}`, { empresaId, tipo, texto, createdAt: now - (100 - i) * MIN })
      })
    })
  })

  // Calidad: no conformidades
  const ordenPorEstado = {}
  NO_CONFORMIDADES.forEach(([numero, titulo, descripcion, estado, prioridad, responsable, area, offset]) => {
    ordenPorEstado[estado] = (ordenPorEstado[estado] || 0) + 1
    push(COLECCIONES.noConformidades, `nc-${numero}`, {
      codigo: `NC-${numero}`,
      titulo,
      descripcion,
      estado,
      prioridad,
      responsable,
      area,
      fecha: dia(offset),
      orden: ordenPorEstado[estado] * 1000,
      createdAt: now + offset * 24 * HORA,
    })
  })

  // Proyectos: tareas del Kanban
  const ordenTareas = {}
  TAREAS.forEach(([titulo, descripcion, estado, prioridad, responsable, offset, etiqueta], i) => {
    ordenTareas[estado] = (ordenTareas[estado] || 0) + 1
    push(COLECCIONES.tareas, `tarea-${String(i + 1).padStart(2, '0')}`, {
      titulo,
      descripcion,
      estado,
      prioridad,
      responsable,
      etiqueta,
      fechaLimite: dia(offset),
      orden: ordenTareas[estado] * 1000,
      createdAt: now - (TAREAS.length - i) * HORA,
    })
  })

  // Proyectos: fases del Gantt
  FASES.forEach(([id, nombre, inicio, fin, avance, dependencias, responsable], i) => {
    push(COLECCIONES.fases, id, { nombre, inicio: dia(inicio), fin: dia(fin), avance, dependencias, responsable, orden: (i + 1) * 1000, createdAt: now - (FASES.length - i) * MIN })
  })

  // Actividad reciente
  ACTIVIDAD.forEach(([modulo, mensaje, tipo, usuario, haceMs], i) => {
    push(COLECCIONES.actividad, `act-${i + 1}`, { modulo, mensaje, tipo, usuario, createdAt: now - haceMs })
  })

  return items
}

/** Colecciones que maneja el seed (no incluye test_collection). */
export const COLECCIONES_DEMO = [
  COLECCIONES.empresas,
  COLECCIONES.usuarios,
  COLECCIONES.empleados,
  COLECCIONES.evaluaciones,
  COLECCIONES.clima,
  COLECCIONES.presupuestos,
  COLECCIONES.costos,
  COLECCIONES.foda,
  COLECCIONES.noConformidades,
  COLECCIONES.tareas,
  COLECCIONES.fases,
  COLECCIONES.actividad,
]

/** Carga (o restablece) los datos de demo. Devuelve la cantidad de documentos escritos. */
export async function seedDemoData() {
  const items = buildDemoData()
  await setMany(items)
  markSeeded()
  markBaseSeeded()
  return items.length
}

/** Borra todos los datos de las colecciones del ERP. */
export async function clearDemoData() {
  // Los usuarios y las empresas se conservan: sin usuarios no habría con quién ingresar
  await clearCollections(COLECCIONES_DEMO.filter((c) => c !== COLECCIONES.usuarios && c !== COLECCIONES.empresas))
  markSeeded()
}

/** En modo local, la primera vez se cargan los datos solos para que la demo arranque completa. */
export function autoSeedIfNeeded() {
  if (dataMode !== 'local') return
  if (!wasSeeded()) {
    seedDemoData().catch(() => {})
  } else if (!baseWasSeeded()) {
    // Quien ya tenía datos de una versión anterior recibe solo las empresas y los usuarios nuevos
    setMany(buildBaseData())
      .then(markBaseSeeded)
      .catch(() => {})
  }
}
