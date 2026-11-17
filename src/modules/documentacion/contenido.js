// Contenido de la documentación del sistema.
//
// Es la ÚNICA fuente: la página /documentacion lo dibuja y `npm run docs` genera
// docs/DOCUMENTACION.md a partir de este mismo archivo. Para actualizar la
// documentación se edita acá y nada más.
//
// Bloques posibles:
//   { t: 'p', texto }                        párrafo
//   { t: 'h', texto }                        subtítulo
//   { t: 'lista', items: [] }                viñetas
//   { t: 'pasos', items: [] }                lista numerada
//   { t: 'tabla', cols: [], filas: [[]] }    tabla
//   { t: 'nota', tono: 'info' | 'aviso', texto }
//   { t: 'codigo', texto }                   bloque de código / comandos
// En los textos: `código` y **negrita**.

export const VERSION_DOCUMENTACION = '1.1'

export const DOCUMENTACION = [
  {
    id: 'introduccion',
    titulo: 'Qué es Arandu ERP',
    icono: 'Compass',
    resumen: 'Un ERP simplificado, hecho para la feria Expotecnia de Ingeniería en Sistemas.',
    bloques: [
      { t: 'p', texto: '**Arandu ERP** reúne en una sola aplicación web las áreas básicas de una empresa: estrategia, personas, calidad, finanzas y proyectos. Todos los módulos comparten la misma base de datos en tiempo real, así que un cambio hecho en una pantalla aparece al instante en las demás y en los otros dispositivos conectados.' },
      { t: 'p', texto: 'El nombre significa «sabiduría» en guaraní. La empresa de ejemplo con la que se trabaja es **Yvoty Alimentos S.A.**, una industria ficticia de Luque; todos los datos de demostración son inventados.' },
      {
        t: 'tabla',
        cols: ['Módulo', 'Unidad', 'Para qué sirve'],
        filas: [
          ['Dashboard', '3 y 4', 'Ver los indicadores de toda la organización y simular escenarios'],
          ['Planeación', '1', 'Analizar empresas con la matriz FODA'],
          ['Talento Humano', '2', 'Legajos, evaluación de desempeño y clima laboral'],
          ['Calidad', '5', 'Registrar y resolver no conformidades'],
          ['Finanzas', '6', 'Controlar presupuesto contra gasto ejecutado'],
          ['Proyectos', '7', 'Organizar tareas y planificar el cronograma'],
          ['Arquitectura', '8', 'Entender cómo está construido el sistema'],
          ['Usuarios', '—', 'Administrar quién ingresa y con qué rol'],
        ],
      },
      { t: 'nota', tono: 'info', texto: 'No hay autenticación real: el ingreso es simulado para la feria. Cualquier persona que abra la aplicación puede elegir un usuario. Antes de usar el sistema con datos reales hay que sumar Firebase Authentication y reglas de seguridad en Firestore.' },
    ],
  },
  {
    id: 'primeros-pasos',
    titulo: 'Primeros pasos',
    icono: 'Rocket',
    resumen: 'Instalar, ingresar y cargar los datos de demostración.',
    bloques: [
      { t: 'h', texto: 'Instalación' },
      { t: 'p', texto: 'Se necesita **Node.js 20.19 o superior** (recomendado 22) y npm. Desde la carpeta del proyecto:' },
      { t: 'codigo', texto: 'npm install\nnpm run dev' },
      { t: 'p', texto: 'La aplicación queda en `http://localhost:5173`. El servidor también se muestra con la dirección de la red local (`Network`), útil para abrirla desde un celular conectado al mismo wifi.' },
      { t: 'nota', tono: 'aviso', texto: 'No se puede abrir `index.html` con doble clic: el navegador muestra la página en blanco porque el código necesita el servidor de desarrollo. Para tener un único archivo que sí se abre con doble clic, ejecutá `npm run build:demo` y abrí `dist-demo/arandu-erp.html`.' },
      { t: 'h', texto: 'Ingresar' },
      {
        t: 'pasos',
        items: [
          'En la pantalla de bienvenida elegí tu usuario de la lista y se abre el dashboard.',
          'Si todavía no tenés usuario, tocá **Nuevo usuario**, completá nombre y correo y entrás directamente.',
          'También podés **Entrar como invitado** (rol Lector, sin cuenta).',
        ],
      },
      { t: 'p', texto: 'La primera persona que se registra en un sistema vacío queda como **Administrador**; las siguientes, como **Editor**.' },
      { t: 'h', texto: 'Cargar los datos de demostración' },
      { t: 'p', texto: 'El botón **Cargar datos de demo** (en el dashboard y en el menú del avatar) escribe más de 200 documentos realistas en todos los módulos. Se puede tocar las veces que haga falta: los datos tienen identificadores fijos, así que se restablecen sin duplicarse. Sin Firebase configurado, la primera vez se cargan solos.' },
      { t: 'lista', items: ['**Probar conexión** escribe un documento en `test_collection` y confirma que la base responde.', '**Vaciar datos de los módulos** borra los registros de los módulos pero conserva los usuarios y las empresas, para no quedarte sin cuenta con la que ingresar.'] },
    ],
  },
  {
    id: 'dashboard',
    titulo: 'Dashboard',
    icono: 'LayoutDashboard',
    resumen: 'Unidades 3 y 4 · Indicadores, gráficos y simulador de escenarios.',
    bloques: [
      { t: 'p', texto: 'Es la página de inicio y la vitrina de la feria. Toda la información se calcula en vivo a partir de los otros módulos.' },
      { t: 'h', texto: 'Indicadores' },
      {
        t: 'tabla',
        cols: ['Indicador', 'Cómo se calcula', 'La flecha indica'],
        filas: [
          ['Empleados', 'Cantidad de legajos', 'Variación frente a hace 7 meses'],
          ['Desempeño promedio', 'Promedio de las evaluaciones del último período', 'Variación frente al período anterior'],
          ['Tickets abiertos', 'No conformidades en estado Abierto o En análisis', 'Nuevos casos de las últimas 2 semanas contra las 2 anteriores'],
          ['Presupuesto ejecutado', 'Total ejecutado ÷ total presupuestado', 'Puntos de diferencia contra el ritmo esperado del año'],
          ['Avance de proyectos', 'Avance de las fases ponderado por su duración', 'Puntos de diferencia contra lo planificado a hoy'],
        ],
      },
      { t: 'p', texto: 'El color de la flecha depende de si subir es bueno: más empleados o más avance se muestran en verde; más tickets abiertos o más gasto, en rojo.' },
      { t: 'h', texto: 'Gráficos' },
      { t: 'lista', items: ['**Presupuesto vs. ejecutado** por departamento (barras).', '**Evolución de costos**: 12 meses reales, una tendencia lineal a 6 meses y la línea del presupuesto mensual.', '**Tickets por estado** (dona).', '**Clima organizacional** por dimensión (radar), con el índice global.'] },
      { t: 'p', texto: 'Al pasar el mouse (o tocar en el celular) cada gráfico muestra el detalle.' },
      { t: 'h', texto: 'Simulador de escenarios' },
      { t: 'pasos', items: ['Mové **Aumento de presupuesto** (0 a 40 %) o **Reducción de costos** (0 a 30 %), o elegí un escenario predefinido: Eficiencia, Equilibrio o Expansión.', 'Los gráficos de presupuesto y de costos muestran el valor actual y el proyectado juntos.', 'La tabla del panel compara presupuesto total, ejecutado, % de ejecución, saldo y áreas excedidas, antes y después.', 'Con el botón de la esquina se vuelve al escenario base.'] },
      { t: 'nota', tono: 'info', texto: 'El simulador solo proyecta: nunca modifica los datos guardados.' },
      { t: 'h', texto: 'Actividad reciente' },
      { t: 'p', texto: 'Muestra los últimos eventos de todos los módulos (altas, cambios, movimientos de tarjetas) con el usuario que los hizo. Se actualiza sola, sin recargar.' },
    ],
  },
  {
    id: 'planeacion',
    titulo: 'Planeación estratégica',
    icono: 'Target',
    resumen: 'Unidad 1 · Matriz FODA de cada empresa.',
    bloques: [
      { t: 'p', texto: 'La matriz FODA ordena el análisis de una empresa en cuatro cuadrantes: **Fortalezas** y **Debilidades** (factores internos) y **Oportunidades** y **Amenazas** (factores externos).' },
      { t: 'h', texto: 'Trabajar con una empresa' },
      {
        t: 'pasos',
        items: [
          'Elegí la empresa en el selector de la parte superior.',
          'Para agregar un ítem, escribilo en el campo del cuadrante y presioná Enter.',
          'Para editarlo, hacé clic en el texto: Enter guarda y Esc cancela.',
          'Para borrarlo, usá el ícono de papelera que aparece al pasar el mouse (en el celular está siempre visible).',
        ],
      },
      { t: 'p', texto: 'Cada cuadrante muestra un contador y la barra superior resume cuánto pesa cada uno en el análisis.' },
      { t: 'h', texto: 'Agregar, editar y eliminar empresas' },
      {
        t: 'lista',
        items: [
          '**Nueva empresa**: nombre (obligatorio), rubro, ciudad y descripción. Se crea con la matriz vacía y queda seleccionada.',
          '**Editar**: ícono de lápiz junto al nombre de la empresa.',
          '**Eliminar**: desde la ventana de edición. Se pide confirmación porque también se borran todos los ítems de su matriz.',
        ],
      },
      { t: 'p', texto: 'No puede haber dos empresas con el mismo nombre.' },
    ],
  },
  {
    id: 'talento-humano',
    titulo: 'Talento Humano',
    icono: 'Users',
    resumen: 'Unidad 2 · Empleados, desempeño y clima organizacional.',
    bloques: [
      { t: 'h', texto: 'Empleados' },
      { t: 'lista', items: ['Búsqueda por nombre, cargo o correo (ignora acentos) y filtro por departamento.', '**Nuevo empleado** abre el formulario de alta; el lápiz de cada fila edita y la papelera elimina (con confirmación).', 'La columna Desempeño muestra la última evaluación de cada persona.'] },
      { t: 'h', texto: 'Evaluación de desempeño' },
      { t: 'pasos', items: ['Tocá **Evaluar** (o la estrella de una fila) y elegí al empleado.', 'Calificá de 1 a 5 estrellas los cinco criterios: Productividad, Calidad del trabajo, Trabajo en equipo, Puntualidad e Iniciativa.', 'El promedio se calcula al instante y se guarda con el período vigente (semestre).'] },
      { t: 'p', texto: 'La pestaña **Desempeño** resume el período elegido: promedio general, cobertura (cuántas personas fueron evaluadas), criterio más fuerte y a reforzar, y un ranking con la variación contra el período anterior.' },
      { t: 'h', texto: 'Encuesta de clima' },
      { t: 'p', texto: 'Son 8 preguntas, una por pantalla, con respuesta de 1 (muy en desacuerdo) a 5 (muy de acuerdo). Es anónima: solo se guarda, opcionalmente, el área de quien responde.' },
      { t: 'lista', items: ['Al elegir una respuesta se pasa sola a la pregunta siguiente; se puede volver atrás.', 'El gráfico de resultados se actualiza apenas se envía la encuesta.', '«Favorables» es el porcentaje de respuestas cuyo promedio es 4 o más.'] },
    ],
  },
  {
    id: 'calidad',
    titulo: 'Calidad y mejora continua',
    icono: 'ShieldCheck',
    resumen: 'Unidad 5 · No conformidades en tablero Kanban o en tabla.',
    bloques: [
      { t: 'p', texto: 'Una **no conformidad** es un desvío detectado respecto de lo esperado (un producto fuera de especificación, un procedimiento desactualizado). Cada una recorre tres estados: **Abierto → En análisis → Resuelto**.' },
      { t: 'lista', items: ['**Tablero**: arrastrá las tarjetas entre columnas. Con teclado: Espacio para levantar la tarjeta, flechas para moverla y Espacio para soltarla. En el celular, mantené presionada la tarjeta.', '**Tabla**: la misma información ordenable por código, estado, prioridad o fecha.', 'Los filtros (búsqueda, prioridad y responsable) valen para las dos vistas.', 'Cada registro recibe un código correlativo (NC-042) y una prioridad: Baja, Media, Alta o Crítica.'] },
      { t: 'p', texto: 'Los cuatro indicadores de arriba muestran cuántas hay en cada estado, la tasa de cierre y las críticas que todavía están pendientes. Hacer clic en una tarjeta (o en el lápiz de la tabla) abre la ventana de edición.' },
    ],
  },
  {
    id: 'finanzas',
    titulo: 'Finanzas',
    icono: 'Wallet',
    resumen: 'Unidad 6 · Presupuesto contra ejecutado, en guaraníes.',
    bloques: [
      { t: 'p', texto: 'La tabla muestra, por departamento, el presupuesto anual, lo ejecutado, la diferencia y el porcentaje de ejecución. Los totales se calculan solos.' },
      {
        t: 'tabla',
        cols: ['Ejecución', 'Estado', 'Qué significa'],
        filas: [
          ['Menos de 90 %', 'En regla', 'Hay margen de gasto'],
          ['90 % a 100 %', 'Al límite', 'Conviene revisar los próximos gastos'],
          ['Más de 100 %', 'Excedido', 'Fila en rojo y alerta en la parte superior'],
        ],
      },
      { t: 'lista', items: ['**Registrar gasto** (ícono de recibo): suma un monto al ejecutado y avisa antes de guardar si el departamento va a quedar excedido.', '**Nuevo presupuesto** y el lápiz de cada fila permiten crear, editar o eliminar departamentos.', 'Los montos se escriben con separador de miles automático y se muestran como `Gs. 1.250.000.000`.'] },
    ],
  },
  {
    id: 'proyectos',
    titulo: 'Gestor de proyectos',
    icono: 'FolderKanban',
    resumen: 'Unidad 7 · Tareas en Kanban y cronograma en Gantt.',
    bloques: [
      { t: 'h', texto: 'Kanban' },
      { t: 'p', texto: 'Cuatro columnas: **Por hacer, En curso, En revisión y Hecho**. Las tarjetas se arrastran igual que en Calidad. Una tarea vencida se marca en rojo mientras no esté en Hecho.' },
      { t: 'h', texto: 'Gantt' },
      { t: 'p', texto: 'Cada fase es una barra con su fecha de inicio, de fin y su porcentaje de avance. Las flechas indican dependencias: una fase no empieza hasta que terminan las que la preceden.' },
      { t: 'lista', items: ['**Línea de hoy**: la vertical marcada con «Hoy». El botón **Hoy** centra la vista en ella.', '**Ruta crítica**: en naranja. Son las fases sin holgura: si una se atrasa un día, todo el proyecto se atrasa un día. Se puede apagar con el interruptor.', '**Holgura**: días que una fase puede demorarse sin afectar la fecha final. Aparece en el cuadro que se abre al pasar el mouse por la barra.', '**Zoom**: Completo, Semanas o Días.', 'Tocar una barra o un nombre abre la edición de la fase (fechas, avance y «Depende de»). No se permiten dependencias circulares.'] },
      { t: 'nota', tono: 'info', texto: 'La ruta crítica se recalcula automáticamente cada vez que cambian fechas o dependencias.' },
    ],
  },
  {
    id: 'arquitectura',
    titulo: 'Arquitectura',
    icono: 'Network',
    resumen: 'Unidad 8 · Transformación digital.',
    bloques: [
      { t: 'p', texto: 'Muestra el sistema por capas (navegador → React → Firestore → módulos) con la cantidad real de documentos de cada colección, el recorrido de un cambio en tiempo real (el botón **Probar en vivo** lo ejecuta con una escritura de verdad), las tecnologías con su versión instalada y las seis etapas del ciclo de vida de un sistema.' },
    ],
  },
  {
    id: 'usuarios',
    titulo: 'Usuarios y roles',
    icono: 'UserCog',
    resumen: 'Cómo cambiar de usuario, crear cuentas y qué puede hacer cada rol.',
    bloques: [
      { t: 'h', texto: 'Cambiar de usuario' },
      { t: 'lista', items: ['Desde el **menú del avatar** (arriba a la derecha) elegí a otra persona en «Cambiar de usuario»: la sesión pasa a ser suya sin volver a la pantalla de ingreso.', 'En la página **Usuarios**, el ícono de flechas de cada fila hace lo mismo.', '**Cerrar sesión** vuelve a la pantalla de bienvenida.'] },
      { t: 'p', texto: 'Las acciones quedan registradas con el nombre del usuario activo (por ejemplo, en Actividad reciente).' },
      { t: 'h', texto: 'Administrar usuarios' },
      { t: 'p', texto: 'Solo un **Administrador** puede crear, editar o eliminar cuentas desde la página **Usuarios**. Cada usuario tiene nombre, correo (único), cargo, rol y estado.' },
      { t: 'lista', items: ['Un usuario **Inactivo** no aparece en la pantalla de ingreso ni en el cambio rápido.', 'No se puede eliminar el propio usuario.', 'Siempre tiene que quedar al menos un administrador activo: el último no se puede borrar, degradar ni desactivar.', 'Si editás tu propio usuario, los cambios se reflejan al instante en tu sesión.'] },
      { t: 'h', texto: 'Roles' },
      {
        t: 'tabla',
        cols: ['Rol', 'Pensado para', 'Hoy permite'],
        filas: [
          ['Administrador', 'Quien gestiona el sistema', 'Todo, incluida la gestión de usuarios'],
          ['Editor', 'Quien trabaja en los módulos', 'Usar todos los módulos y cambiar de usuario'],
          ['Lector', 'Quien solo consulta (incluye invitados)', 'Ver la información y cambiar de usuario'],
        ],
      },
      { t: 'nota', tono: 'aviso', texto: 'Por ahora el rol solo controla el acceso a la gestión de usuarios. Que un Lector no pueda modificar registros en los módulos se aplicará cuando se sume autenticación real con reglas de seguridad en Firestore: hoy esos controles de interfaz no serían una protección verdadera, porque cualquiera puede elegir el usuario que quiera.' },
    ],
  },
  {
    id: 'datos',
    titulo: 'Datos y Firebase',
    icono: 'Database',
    resumen: 'Dónde se guarda la información y cómo conectar Firestore.',
    bloques: [
      { t: 'h', texto: 'Dos formas de funcionar' },
      {
        t: 'tabla',
        cols: ['Modo', 'Cuándo', 'Dónde se guardan los datos'],
        filas: [
          ['Firestore', 'Existe el archivo `.env` con los datos de Firebase', 'En la nube; se comparten entre dispositivos en tiempo real'],
          ['Local', 'No hay `.env`', 'Solo en el navegador de esa persona (localStorage)'],
        ],
      },
      { t: 'p', texto: 'El estado se ve en la parte inferior del menú lateral: **Conectando…**, **Firestore · en vivo**, **Sin conexión** (muestra la última copia guardada) o **Error de Firestore**.' },
      { t: 'h', texto: 'Conectar Firestore' },
      {
        t: 'pasos',
        items: [
          'En la consola de Firebase, creá un proyecto sin Google Analytics.',
          'Registrá una app web y copiá los valores de `firebaseConfig`.',
          'Copiá `.env.example` como `.env` y pegá cada valor en la variable `VITE_FIREBASE_*` que corresponde.',
          'Creá la base Firestore en `southamerica-east1`, en modo de prueba.',
          'Reiniciá `npm run dev` y tocá **Probar conexión**.',
        ],
      },
      { t: 'nota', tono: 'aviso', texto: 'Las reglas del modo de prueba vencen a los 30 días y dejan la base abierta a cualquiera que conozca la URL. Sirven para la feria; no para datos reales.' },
      { t: 'h', texto: 'Colecciones' },
      {
        t: 'tabla',
        cols: ['Colección', 'Módulo', 'Campos principales'],
        filas: [
          ['`empresas`', 'Planeación', 'nombre, rubro, ciudad, descripcion'],
          ['`foda`', 'Planeación', 'empresaId, tipo, texto'],
          ['`usuarios`', 'Usuarios', 'nombre, email, cargo, rol, estado, ultimoAcceso'],
          ['`empleados`', 'Talento Humano', 'nombre, cargo, departamento, email, fechaIngreso, estado'],
          ['`evaluaciones`', 'Talento Humano', 'empleadoId, periodo, criterios, promedio'],
          ['`clima_respuestas`', 'Talento Humano', 'respuestas, departamento'],
          ['`no_conformidades`', 'Calidad', 'codigo, titulo, estado, prioridad, responsable, fecha, orden'],
          ['`presupuestos`', 'Finanzas', 'departamento, presupuesto, ejecutado'],
          ['`costos_mensuales`', 'Finanzas y Dashboard', 'periodo (AAAA-MM), costo'],
          ['`tareas`', 'Proyectos', 'titulo, estado, prioridad, responsable, fechaLimite, orden'],
          ['`fases`', 'Proyectos', 'nombre, inicio, fin, avance, dependencias'],
          ['`actividad`', 'Dashboard', 'modulo, mensaje, usuario, tipo'],
          ['`test_collection`', 'Prueba de conexión', 'mensaje, fecha'],
        ],
      },
      { t: 'p', texto: 'Todos los documentos llevan `createdAt` (milisegundos) y, al modificarse, `updatedAt`.' },
    ],
  },
  {
    id: 'tecnica',
    titulo: 'Arquitectura técnica',
    icono: 'Layers',
    resumen: 'Cómo está organizado el código y cómo agregar un módulo.',
    bloques: [
      { t: 'h', texto: 'Tecnologías' },
      { t: 'p', texto: 'React 19 con Vite, React Router, Firebase Firestore (`onSnapshot`), Tailwind CSS 4, Recharts, Framer Motion, lucide-react y @hello-pangea/dnd.' },
      { t: 'h', texto: 'Estructura de carpetas' },
      {
        t: 'codigo',
        texto: 'src/\n├─ firebase/    config, hooks (useCollection), almacén local y datos de demo\n├─ components/\n│  ├─ ui/       librería de componentes (Button, Card, Modal, Table…)\n│  ├─ layout/   Sidebar, Header, PageHeader, buscador\n│  ├─ charts/   piezas compartidas de los gráficos\n│  └─ kanban/   tablero arrastrable (Calidad y Proyectos)\n├─ modules/     una carpeta por módulo\n├─ config/      marca, navegación y catálogos\n├─ context/     tema y sesión\n└─ lib/         formato, animaciones y utilidades',
      },
      { t: 'h', texto: 'Leer y escribir datos' },
      { t: 'p', texto: 'Todos los módulos usan el mismo hook. Los cambios llegan solos a todas las pantallas abiertas:' },
      {
        t: 'codigo',
        texto: "const { data, loading, error, add, update, remove } =\n  useCollection(COLECCIONES.empleados, { orderBy: 'nombre' })\n\nadd({ nombre: 'Ana', cargo: 'Analista' })   // crea y devuelve el id\nupdate(id, { cargo: 'Jefa' })\nremove(id)",
      },
      { t: 'lista', items: ['Mientras `loading` es verdadero se muestra un esqueleto; si no hay datos, un estado vacío con una acción.', 'Las escrituras son optimistas: la pantalla cambia al instante y, si Firestore rechaza el cambio, se avisa con un toast.', 'Hay una sola suscripción por colección para toda la aplicación, aunque varias pantallas la usen.', '`logActivity(modulo, mensaje, tipo)` agrega un evento al feed del dashboard.'] },
      { t: 'h', texto: 'Agregar un módulo nuevo' },
      {
        t: 'pasos',
        items: [
          'Crear la carpeta `src/modules/mimodulo/` con `MiModuloPage.jsx` (exportación por defecto).',
          'Registrar la ruta, con carga diferida, en `src/App.jsx`.',
          'Agregar el ítem en `src/config/navigation.js`: aparece solo en el menú, los breadcrumbs y el buscador.',
          'Si usa datos nuevos, agregar el nombre de la colección en `src/config/constants.js`.',
          'Armar la pantalla con los componentes de `@/components/ui` y las plantillas del sistema de diseño.',
        ],
      },
      { t: 'h', texto: 'Versión de demostración en un solo archivo' },
      { t: 'p', texto: '`npm run build:demo` genera `dist-demo/arandu-erp.html`: toda la aplicación (código, estilos y tipografía) en un único archivo que no necesita servidor ni Firebase. Navega en memoria y guarda los datos en el navegador. Es el formato con el que se comparte la demo.' },
    ],
  },
  {
    id: 'diseno',
    titulo: 'Sistema de diseño',
    icono: 'Palette',
    resumen: 'Tokens, componentes y reglas visuales.',
    bloques: [
      { t: 'p', texto: 'Los colores, sombras y radios están definidos una sola vez como variables CSS en `src/index.css`. El modo oscuro solo redefine esas variables, por lo que los componentes no cambian. **Nunca se usan colores sueltos**: siempre los tokens (`bg-surface`, `text-fg-muted`, `border-line`, `bg-primary`…).' },
      {
        t: 'tabla',
        cols: ['Tema', 'Regla'],
        filas: [
          ['Tipografía', 'Inter. Título de página 24–28 px, título de tarjeta 15 px, texto 14 px, secundario 13 px, leyendas 12 px'],
          ['Color', 'Primario índigo-violeta, neutros cálidos y cuatro semánticos: verde, ámbar, rojo y azul'],
          ['Formas', 'Tarjetas `rounded-2xl` con borde sutil y sombra suave; controles `rounded-[10px]`; badges redondeados'],
          ['Movimiento', 'Una sola curva de animación; entradas escalonadas; se respeta «reducir movimiento» del sistema'],
          ['Gráficos', 'Cuatro colores validados para daltonismo, grilla fina y tooltip propio'],
          ['Estados', 'Carga con esqueleto, vacío con ilustración y acción, confirmación con toast, borrado con diálogo de confirmación'],
        ],
      },
      { t: 'p', texto: 'Los componentes disponibles se importan desde `@/components/ui`: Button, Card, Badge, Modal, ConfirmDialog, Input, Select, Table, Tabs, Toast, Skeleton, EmptyState, Avatar, ProgressBar, StatCard, StarRating, Slider, Tooltip, Dropdown y ThemeToggle, entre otros.' },
    ],
  },
  {
    id: 'accesibilidad',
    titulo: 'Atajos y accesibilidad',
    icono: 'Keyboard',
    resumen: 'Cómo usar el sistema solo con el teclado y en cualquier dispositivo.',
    bloques: [
      {
        t: 'tabla',
        cols: ['Atajo', 'Acción'],
        filas: [
          ['`Ctrl` + `K` (o `⌘` + `K`)', 'Abrir el buscador de páginas, personas, no conformidades y tareas'],
          ['`Esc`', 'Cerrar ventanas, menús y el buscador'],
          ['`Enter` en un ítem del FODA', 'Guardar el texto; `Esc` descarta el cambio'],
          ['`←` `→` en las pestañas', 'Cambiar de pestaña'],
          ['`Espacio` y flechas en un tablero', 'Levantar, mover y soltar una tarjeta'],
        ],
      },
      { t: 'lista', items: ['**Modo claro y oscuro**: botón de la luna o el sol en la barra superior. Se recuerda en el navegador y, si nunca se eligió, sigue la configuración del sistema.', '**Menú lateral**: se puede colapsar a íconos; en celular se abre con el botón de hamburguesa.', 'Todos los botones de solo ícono tienen nombre accesible, el foco siempre es visible y las ventanas atrapan el foco.', 'El diseño se adapta a computadora, tableta y celular.'] },
    ],
  },
  {
    id: 'problemas',
    titulo: 'Solución de problemas',
    icono: 'LifeBuoy',
    resumen: 'Los inconvenientes más frecuentes y cómo resolverlos.',
    bloques: [
      {
        t: 'tabla',
        cols: ['Síntoma', 'Causa y solución'],
        filas: [
          ['La pantalla queda en blanco al abrir `index.html`', 'Ese archivo necesita el servidor: usá `npm run dev`, o `npm run build:demo` y abrí `dist-demo/arandu-erp.html`'],
          ['Cambié el `.env` y nada pasa', 'Vite lee el archivo solo al arrancar: detené el servidor y volvé a ejecutar `npm run dev`'],
          ['`permission-denied` o «Error de Firestore»', 'Las reglas del modo de prueba vencieron: extendé la fecha en Firestore → Reglas'],
          ['Todo aparece vacío', 'Tocá **Cargar datos de demo** y revisá el estado de conexión del menú lateral'],
          ['Mis cambios no aparecen en otro dispositivo', 'Estás en modo local (sin `.env`): cada navegador tiene sus propios datos. Configurá Firebase'],
          ['«Sin conexión» en el menú lateral', 'No hay internet: se muestran los últimos datos guardados y se sincroniza solo al volver'],
          ['No puedo crear ni editar usuarios', 'Solo un Administrador puede hacerlo: cambiá a una cuenta con ese rol'],
          ['No me deja degradar o borrar a un usuario', 'Es el único administrador activo: primero nombrá a otro'],
          ['Las tarjetas no se arrastran en el celular', 'Mantené presionada la tarjeta un instante antes de moverla'],
          ['Un gráfico o una pantalla no cargan', 'Recargá la página; si persiste, abrí la consola del navegador (F12) y revisá el error'],
        ],
      },
    ],
  },
  {
    id: 'glosario',
    titulo: 'Glosario',
    icono: 'BookOpen',
    resumen: 'Términos que aparecen en el sistema.',
    bloques: [
      {
        t: 'tabla',
        cols: ['Término', 'Significado'],
        filas: [
          ['FODA', 'Análisis de Fortalezas, Oportunidades, Debilidades y Amenazas de una organización'],
          ['KPI', 'Indicador clave de desempeño: una cifra que resume cómo va un aspecto del negocio'],
          ['No conformidad', 'Incumplimiento de un requisito de calidad que hay que analizar y corregir'],
          ['Ejecución presupuestaria', 'Porcentaje del presupuesto que ya se gastó'],
          ['Clima organizacional', 'Percepción que tienen las personas sobre su ambiente de trabajo'],
          ['Kanban', 'Tablero de columnas por las que avanzan las tareas'],
          ['Gantt', 'Cronograma en barras horizontales sobre una línea de tiempo'],
          ['Ruta crítica', 'Cadena de fases sin margen de demora que determina la fecha final del proyecto'],
          ['Holgura', 'Días que una fase puede atrasarse sin mover la fecha final'],
          ['Firestore', 'Base de datos NoSQL en la nube de Google Firebase'],
          ['onSnapshot', 'Función de Firestore que avisa a la aplicación cada vez que cambia un dato'],
          ['SPA', 'Aplicación de una sola página: no se recarga al navegar entre módulos'],
        ],
      },
    ],
  },
  {
    id: 'equipo',
    titulo: 'Equipo y mantenimiento',
    icono: 'Users',
    resumen: 'Reparto de módulos y forma de trabajo.',
    bloques: [
      { t: 'p', texto: 'Cada integrante es dueño de una carpeta dentro de `src/modules/`, lo que evita conflictos al fusionar. La tabla con los nombres está en el `README.md` del repositorio.' },
      { t: 'lista', items: ['Una rama por módulo (`modulo/finanzas`, `modulo/calidad`…).', 'Tocar solo la carpeta propia; si hace falta un componente nuevo en `components/ui/`, avisar al grupo.', 'Antes de fusionar a `main`: `npm run build` sin errores y revisar la pantalla en claro, oscuro y celular.', 'Después de cambiar esta documentación, ejecutar `npm run docs` para regenerar `docs/DOCUMENTACION.md`.'] },
    ],
  },
]
