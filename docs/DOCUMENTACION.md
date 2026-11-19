# Arandu ERP · Documentación del sistema

Versión 2.0

> Este archivo se genera con `npm run docs` a partir de `src/modules/documentacion/contenido.js`. No lo edites a mano.

## Contenido

1. Qué es Arandu ERP
2. Primeros pasos
3. Dashboard
4. Planeación estratégica
5. Talento Humano
6. Calidad y mejora continua
7. Finanzas
8. Gestor de proyectos
9. Arquitectura
10. Usuarios y roles
11. Datos y Firebase
12. Arquitectura técnica
13. Sistema de diseño
14. Atajos y accesibilidad
15. Solución de problemas
16. Glosario
17. Equipo y mantenimiento

---

## 1. Qué es Arandu ERP

*Un ERP simplificado, hecho para la feria Expotecnia de Ingeniería en Sistemas.*

**Arandu ERP** reúne en una sola aplicación web las áreas básicas de una empresa: estrategia, personas, calidad, finanzas y proyectos. Todos los módulos comparten la misma base de datos en tiempo real, así que un cambio hecho en una pantalla aparece al instante en las demás y en los otros dispositivos conectados.

El nombre significa «sabiduría» en guaraní. La empresa de ejemplo con la que se trabaja es **Yvoty Alimentos S.A.**, una industria ficticia de Luque; todos los datos de demostración son inventados.

| Módulo | Unidad | Para qué sirve |
| --- | --- | --- |
| Dashboard | 3 y 4 | Ver los indicadores de toda la organización y simular escenarios |
| Planeación | 1 | Analizar empresas con la matriz FODA |
| Talento Humano | 2 | Legajos, evaluación de desempeño y clima laboral |
| Calidad | 5 | Registrar y resolver no conformidades |
| Finanzas | 6 | Controlar presupuesto contra gasto ejecutado |
| Proyectos | 7 | Organizar tareas y planificar el cronograma |
| Arquitectura | 8 | Entender cómo está construido el sistema |
| Usuarios | — | Administrar quién ingresa y con qué rol |

> **Nota:** No hay autenticación real: el ingreso es simulado para la feria. Cualquier persona que abra la aplicación puede elegir un usuario. Antes de usar el sistema con datos reales hay que sumar Firebase Authentication y reglas de seguridad en Firestore.

---

## 2. Primeros pasos

*Instalar, ingresar y cargar los datos de demostración.*

### Instalación

Se necesita **Node.js 20.19 o superior** (recomendado 22) y npm. Desde la carpeta del proyecto:

```
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. El servidor también se muestra con la dirección de la red local (`Network`), útil para abrirla desde un celular conectado al mismo wifi.

> **Importante:** No se puede abrir `index.html` con doble clic: el navegador muestra la página en blanco porque el código necesita el servidor de desarrollo. Para tener un único archivo que sí se abre con doble clic, ejecutá `npm run build:demo` y abrí `dist-demo/arandu-erp.html`.

### Ingresar

1. Al abrir la aplicación siempre aparece la pantalla de acceso: no se restaura ninguna sesión anterior ni se cargan datos automáticamente.
2. Escribí tu **correo** (formato `nombre.apellido@gmail.com`) y tu **contraseña**, y tocá **Ingresar**. El ojo del campo muestra u oculta la contraseña.
3. Si te olvidaste el correo, tocá **Cuentas de la demostración**: al elegir una cuenta, el correo se completa solo y solo falta la contraseña.
4. Si los datos no coinciden, la tarjeta se sacude y aparece el mensaje de error. Una cuenta **Inactiva** no puede ingresar.

La sesión dura mientras la pestaña esté abierta: recargar la página la mantiene, pero cerrar la pestaña o abrir la app en otra obliga a ingresar de nuevo.

Los usuarios base (el equipo y los usuarios de la empresa de ejemplo) existen desde el inicio: al abrir la app se crean en la colección `usuarios` los que falten, aunque no se hayan cargado los datos de demo. Están definidos en `src/config/usuarios.js`.

### Cargar los datos de demostración

El botón **Cargar datos de demo** (en el dashboard, en el menú del avatar y en los estados vacíos de cada módulo) escribe más de 200 documentos realistas en todos los módulos. **Solo lo ve un Administrador.** Se puede tocar las veces que haga falta: los datos tienen identificadores fijos, así que se restablecen sin duplicarse. Nunca se cargan solos.

- **Probar conexión** escribe un documento en `test_collection` y confirma que la base responde.
- **Vaciar datos de los módulos** borra los registros de los módulos pero conserva los usuarios y las empresas, para no quedarte sin cuenta con la que ingresar.

---

## 3. Dashboard

*Unidades 3 y 4 · Indicadores, gráficos y simulador de escenarios.*

Es la página de inicio y la vitrina de la feria. Toda la información se calcula en vivo a partir de los otros módulos.

### Indicadores

| Indicador | Cómo se calcula | La flecha indica |
| --- | --- | --- |
| Empleados | Cantidad de legajos | Variación frente a hace 7 meses |
| Desempeño promedio | Promedio de las evaluaciones del último período | Variación frente al período anterior |
| Tickets abiertos | No conformidades en estado Abierto o En análisis | Nuevos casos de las últimas 2 semanas contra las 2 anteriores |
| Presupuesto ejecutado | Total ejecutado ÷ total presupuestado | Puntos de diferencia contra el ritmo esperado del año |
| Avance de proyectos | Avance de las fases ponderado por su duración | Puntos de diferencia contra lo planificado a hoy |

El color de la flecha depende de si subir es bueno: más empleados o más avance se muestran en verde; más tickets abiertos o más gasto, en rojo.

### Gráficos

- **Presupuesto vs. ejecutado** por departamento (barras).
- **Evolución de costos**: 12 meses reales, una tendencia lineal a 6 meses y la línea del presupuesto mensual.
- **Tickets por estado** (dona).
- **Clima organizacional** por dimensión (radar), con el índice global.

Al pasar el mouse (o tocar en el celular) cada gráfico muestra el detalle.

### Simulador de escenarios

1. Mové **Aumento de presupuesto** (0 a 40 %) o **Reducción de costos** (0 a 30 %), o elegí un escenario predefinido: Eficiencia, Equilibrio o Expansión.
2. Los gráficos de presupuesto y de costos muestran el valor actual y el proyectado juntos.
3. La tabla del panel compara presupuesto total, ejecutado, % de ejecución, saldo y áreas excedidas, antes y después.
4. Con el botón de la esquina se vuelve al escenario base.

> **Nota:** El simulador solo proyecta: nunca modifica los datos guardados.

### Actividad reciente

Muestra los últimos eventos de todos los módulos (altas, cambios, movimientos de tarjetas) con el usuario que los hizo. Se actualiza sola, sin recargar.

---

## 4. Planeación estratégica

*Unidad 1 · Matriz FODA de cada empresa.*

La matriz FODA ordena el análisis de una empresa en cuatro cuadrantes: **Fortalezas** y **Debilidades** (factores internos) y **Oportunidades** y **Amenazas** (factores externos).

### Trabajar con una empresa

1. Elegí la empresa en el selector de la parte superior.
2. Para agregar un ítem, escribilo en el campo del cuadrante y presioná Enter.
3. Para editarlo, hacé clic en el texto: Enter guarda y Esc cancela.
4. Para borrarlo, usá el ícono de papelera que aparece al pasar el mouse (en el celular está siempre visible).

Cada cuadrante muestra un contador y la barra superior resume cuánto pesa cada uno en el análisis.

### Agregar, editar y eliminar empresas

- **Nueva empresa**: nombre (obligatorio), rubro, ciudad y descripción. Se crea con la matriz vacía y queda seleccionada.
- **Editar**: ícono de lápiz junto al nombre de la empresa.
- **Eliminar**: desde la ventana de edición. Se pide confirmación porque también se borran todos los ítems de su matriz.

No puede haber dos empresas con el mismo nombre.

---

## 5. Talento Humano

*Unidad 2 · Empleados, desempeño y clima organizacional.*

### Empleados

- Búsqueda por nombre, cargo o correo (ignora acentos) y filtro por departamento.
- **Nuevo empleado** abre el formulario de alta; el lápiz de cada fila edita y la papelera elimina (con confirmación).
- La columna Desempeño muestra la última evaluación de cada persona.

### Evaluación de desempeño

1. Tocá **Evaluar** (o la estrella de una fila) y elegí al empleado.
2. Calificá de 1 a 5 estrellas los cinco criterios: Productividad, Calidad del trabajo, Trabajo en equipo, Puntualidad e Iniciativa.
3. El promedio se calcula al instante y se guarda con el período vigente (semestre).

La pestaña **Desempeño** resume el período elegido: promedio general, cobertura (cuántas personas fueron evaluadas), criterio más fuerte y a reforzar, y un ranking con la variación contra el período anterior.

### Encuesta de clima

Son 8 preguntas, una por pantalla, con respuesta de 1 (muy en desacuerdo) a 5 (muy de acuerdo). Es anónima: solo se guarda, opcionalmente, el área de quien responde.

- Al elegir una respuesta se pasa sola a la pregunta siguiente; se puede volver atrás.
- El gráfico de resultados se actualiza apenas se envía la encuesta.
- «Favorables» es el porcentaje de respuestas cuyo promedio es 4 o más.

---

## 6. Calidad y mejora continua

*Unidad 5 · No conformidades en tablero Kanban o en tabla.*

Una **no conformidad** es un desvío detectado respecto de lo esperado (un producto fuera de especificación, un procedimiento desactualizado). Cada una recorre tres estados: **Abierto → En análisis → Resuelto**.

- **Tablero**: arrastrá las tarjetas entre columnas. Con teclado: Espacio para levantar la tarjeta, flechas para moverla y Espacio para soltarla. En el celular, mantené presionada la tarjeta.
- **Tabla**: la misma información ordenable por código, estado, prioridad o fecha.
- Los filtros (búsqueda, prioridad y responsable) valen para las dos vistas.
- Cada registro recibe un código correlativo (NC-042) y una prioridad: Baja, Media, Alta o Crítica.

Los cuatro indicadores de arriba muestran cuántas hay en cada estado, la tasa de cierre y las críticas que todavía están pendientes. Hacer clic en una tarjeta (o en el lápiz de la tabla) abre la ventana de edición.

---

## 7. Finanzas

*Unidad 6 · Presupuesto contra ejecutado, en guaraníes.*

La tabla muestra, por departamento, el presupuesto anual, lo ejecutado, la diferencia y el porcentaje de ejecución. Los totales se calculan solos.

| Ejecución | Estado | Qué significa |
| --- | --- | --- |
| Menos de 90 % | En regla | Hay margen de gasto |
| 90 % a 100 % | Al límite | Conviene revisar los próximos gastos |
| Más de 100 % | Excedido | Fila en rojo y alerta en la parte superior |

- **Registrar gasto** (ícono de recibo): suma un monto al ejecutado y avisa antes de guardar si el departamento va a quedar excedido.
- **Nuevo presupuesto** y el lápiz de cada fila permiten crear, editar o eliminar departamentos.
- Los montos se escriben con separador de miles automático y se muestran como `Gs. 1.250.000.000`.

---

## 8. Gestor de proyectos

*Unidad 7 · Tareas en Kanban y cronograma en Gantt.*

### Kanban

Cuatro columnas: **Por hacer, En curso, En revisión y Hecho**. Las tarjetas se arrastran igual que en Calidad. Una tarea vencida se marca en rojo mientras no esté en Hecho.

### Gantt

Cada fase es una barra con su fecha de inicio, de fin y su porcentaje de avance. Las flechas indican dependencias: una fase no empieza hasta que terminan las que la preceden.

- **Línea de hoy**: la vertical marcada con «Hoy». El botón **Hoy** centra la vista en ella.
- **Ruta crítica**: en naranja. Son las fases sin holgura: si una se atrasa un día, todo el proyecto se atrasa un día. Se puede apagar con el interruptor.
- **Holgura**: días que una fase puede demorarse sin afectar la fecha final. Aparece en el cuadro que se abre al pasar el mouse por la barra.
- **Zoom**: Completo, Semanas o Días.
- Tocar una barra o un nombre abre la edición de la fase (fechas, avance y «Depende de»). No se permiten dependencias circulares.

> **Nota:** La ruta crítica se recalcula automáticamente cada vez que cambian fechas o dependencias.

---

## 9. Arquitectura

*Unidad 8 · Transformación digital.*

Muestra el sistema por capas (navegador → React → Firestore → módulos) con la cantidad real de documentos de cada colección, el recorrido de un cambio en tiempo real (el botón **Probar en vivo** lo ejecuta con una escritura de verdad), las tecnologías con su versión instalada y las seis etapas del ciclo de vida de un sistema.

---

## 10. Usuarios y roles

*Cómo cambiar de usuario, crear cuentas y qué puede hacer cada rol.*

### Cambiar de usuario

- Desde el **menú del avatar** (arriba a la derecha) elegí a otra persona en «Cambiar de usuario»: la sesión pasa a ser suya sin volver a la pantalla de ingreso.
- En la página **Usuarios**, el ícono de flechas de cada fila hace lo mismo.
- **Cerrar sesión** vuelve a la pantalla de acceso.

Las acciones quedan registradas con el nombre del usuario activo (por ejemplo, en Actividad reciente).

### Administrar usuarios

Solo un **Administrador** puede crear, editar o eliminar cuentas desde la página **Usuarios**. Cada usuario tiene nombre, correo (único), cargo, departamento, teléfono, fecha de ingreso, rol, estado y, opcionalmente, contraseña. La tabla muestra el cargo con su departamento y, en pantallas anchas, el teléfono y la antigüedad.

- Un usuario **Inactivo** no puede ingresar ni aparece en el cambio rápido.
- No se puede eliminar el propio usuario.
- Siempre tiene que quedar al menos un administrador activo: el último no se puede borrar, degradar ni desactivar.
- Si editás tu propio usuario, los cambios se reflejan al instante en tu sesión.

### Mi perfil

Cualquier persona con cuenta puede completar sus propios datos (nombre, cargo, departamento, teléfono y fecha de ingreso) desde el menú del avatar → **Mi perfil**, sin ser Administrador. El correo y el rol los define un Administrador.

### Contraseñas

- Todas las cuentas base usan la misma contraseña de demostración. En el código solo se guarda su hash (`CLAVE_DEMO_HASH` en `src/config/usuarios.js`).
- Al crear un usuario nuevo, la contraseña es obligatoria (mínimo 6 caracteres). Un Administrador puede cambiarla o quitarla después desde la ventana de edición; una cuenta sin contraseña propia usa la de demostración.
- Al cambiar de usuario desde el menú del avatar o desde la página Usuarios, se pide la contraseña de la cuenta.
- Los usuarios que ya existían de versiones anteriores pasan, una sola vez, al formato de correo `nombre.apellido@gmail.com` con la contraseña de demostración. Después se respetan los cambios que se hagan.
- El rol con el que se crean los usuarios del equipo está en `ROL_USUARIOS_NUEVOS` (`src/config/usuarios.js`).

> **Importante:** Este es un control de acceso de demostración en el cliente, no seguridad real. Se comparan en el navegador contra un hash guardado en la colección `usuarios`, que cualquiera con acceso a la base o al código puede leer, y una contraseña corta se deduce a partir de su hash. Sirven para ordenar el uso en la feria. Para proteger datos reales hay que usar Firebase Authentication y reglas de seguridad en Firestore.

### Roles

| Rol | Pensado para | Hoy permite |
| --- | --- | --- |
| Administrador | Quien gestiona el sistema | Todo, incluida la gestión de usuarios y la carga de datos de demo |
| Editor | Quien trabaja en los módulos | Usar todos los módulos y cambiar de usuario |
| Lector | Quien solo consulta | Ver la información y cambiar de usuario |

> **Importante:** Por ahora el rol controla la gestión de usuarios y la carga de datos de demo. Que un Lector no pueda modificar registros en los módulos se aplicará cuando se sume autenticación real con reglas de seguridad en Firestore: hoy esos controles de interfaz no serían una protección verdadera, porque cualquiera puede elegir el usuario que quiera.

---

## 11. Datos y Firebase

*Dónde se guarda la información y cómo conectar Firestore.*

### Dos formas de funcionar

| Modo | Cuándo | Dónde se guardan los datos |
| --- | --- | --- |
| Firestore | Existe el archivo `.env` con los datos de Firebase | En la nube; se comparten entre dispositivos en tiempo real |
| Local | No hay `.env` | Solo en el navegador de esa persona (localStorage) |

El estado se ve en la parte inferior del menú lateral: **Conectando…**, **Firestore · en vivo**, **Sin conexión** (muestra la última copia guardada) o **Error de Firestore**.

### Conectar Firestore

1. En la consola de Firebase, creá un proyecto sin Google Analytics.
2. Registrá una app web y copiá los valores de `firebaseConfig`.
3. Copiá `.env.example` como `.env` y pegá cada valor en la variable `VITE_FIREBASE_*` que corresponde.
4. Creá la base Firestore en `southamerica-east1`, en modo de prueba.
5. Reiniciá `npm run dev` y tocá **Probar conexión**.

> **Importante:** Las reglas del modo de prueba vencen a los 30 días y dejan la base abierta a cualquiera que conozca la URL. Sirven para la feria; no para datos reales.

### Colecciones

| Colección | Módulo | Campos principales |
| --- | --- | --- |
| `empresas` | Planeación | nombre, rubro, ciudad, descripcion |
| `foda` | Planeación | empresaId, tipo, texto |
| `usuarios` | Usuarios | nombre, email, cargo, departamento, telefono, fechaIngreso, rol, estado, ultimoAcceso, claveHash |
| `empleados` | Talento Humano | nombre, cargo, departamento, email, fechaIngreso, estado |
| `evaluaciones` | Talento Humano | empleadoId, periodo, criterios, promedio |
| `clima_respuestas` | Talento Humano | respuestas, departamento |
| `no_conformidades` | Calidad | codigo, titulo, estado, prioridad, responsable, fecha, orden |
| `presupuestos` | Finanzas | departamento, presupuesto, ejecutado |
| `costos_mensuales` | Finanzas y Dashboard | periodo (AAAA-MM), costo |
| `tareas` | Proyectos | titulo, estado, prioridad, responsable, fechaLimite, orden |
| `fases` | Proyectos | nombre, inicio, fin, avance, dependencias |
| `actividad` | Dashboard | modulo, mensaje, usuario, tipo |
| `test_collection` | Prueba de conexión | mensaje, fecha |

Todos los documentos llevan `createdAt` (milisegundos) y, al modificarse, `updatedAt`.

---

## 12. Arquitectura técnica

*Cómo está organizado el código y cómo agregar un módulo.*

### Tecnologías

React 19 con Vite, React Router, Firebase Firestore (`onSnapshot`), Tailwind CSS 4, Recharts, Framer Motion, lucide-react y @hello-pangea/dnd.

### Estructura de carpetas

```
src/
├─ firebase/    config, hooks (useCollection), almacén local y datos de demo
├─ components/
│  ├─ ui/       librería de componentes (Button, Card, Modal, Table…)
│  ├─ layout/   Sidebar, Header, PageHeader, buscador
│  ├─ charts/   piezas compartidas de los gráficos
│  └─ kanban/   tablero arrastrable (Calidad y Proyectos)
├─ modules/     una carpeta por módulo
├─ config/      marca, navegación y catálogos
├─ context/     tema y sesión
└─ lib/         formato, animaciones y utilidades
```

### Leer y escribir datos

Todos los módulos usan el mismo hook. Los cambios llegan solos a todas las pantallas abiertas:

```
const { data, loading, error, add, update, remove } =
  useCollection(COLECCIONES.empleados, { orderBy: 'nombre' })

add({ nombre: 'Ana', cargo: 'Analista' })   // crea y devuelve el id
update(id, { cargo: 'Jefa' })
remove(id)
```

- Mientras `loading` es verdadero se muestra un esqueleto; si no hay datos, un estado vacío con una acción.
- Las escrituras son optimistas: la pantalla cambia al instante y, si Firestore rechaza el cambio, se avisa con un toast.
- Hay una sola suscripción por colección para toda la aplicación, aunque varias pantallas la usen.
- `logActivity(modulo, mensaje, tipo)` agrega un evento al feed del dashboard.

### Agregar un módulo nuevo

1. Crear la carpeta `src/modules/mimodulo/` con `MiModuloPage.jsx` (exportación por defecto).
2. Registrar la ruta, con carga diferida, en `src/App.jsx`.
3. Agregar el ítem en `src/config/navigation.js`: aparece solo en el menú, los breadcrumbs y el buscador.
4. Si usa datos nuevos, agregar el nombre de la colección en `src/config/constants.js`.
5. Armar la pantalla con los componentes de `@/components/ui` y las plantillas del sistema de diseño.

### Versión de demostración en un solo archivo

`npm run build:demo` genera `dist-demo/arandu-erp.html`: toda la aplicación (código, estilos y tipografía) en un único archivo que no necesita servidor ni Firebase. Navega en memoria y guarda los datos en el navegador. Es el formato con el que se comparte la demo.

---

## 13. Sistema de diseño

*Tokens, componentes y reglas visuales.*

Los colores, sombras y radios están definidos una sola vez como variables CSS en `src/index.css`. El modo oscuro solo redefine esas variables, por lo que los componentes no cambian. **Nunca se usan colores sueltos**: siempre los tokens (`bg-surface`, `text-fg-muted`, `border-line`, `bg-primary`…).

| Tema | Regla |
| --- | --- |
| Tipografía | Inter. Título de página 24–28 px, título de tarjeta 15 px, texto 14 px, secundario 13 px, leyendas 12 px |
| Color | Primario índigo-violeta, neutros cálidos y cuatro semánticos: verde, ámbar, rojo y azul |
| Formas | Tarjetas `rounded-2xl` con borde sutil y sombra suave; controles `rounded-[10px]`; badges redondeados |
| Movimiento | Una sola curva de animación; entradas escalonadas; se respeta «reducir movimiento» del sistema |
| Gráficos | Cuatro colores validados para daltonismo, grilla fina y tooltip propio |
| Estados | Carga con esqueleto, vacío con ilustración y acción, confirmación con toast, borrado con diálogo de confirmación |

Los componentes disponibles se importan desde `@/components/ui`: Button, Card, Badge, Modal, ConfirmDialog, Input, Select, Table, Tabs, Toast, Skeleton, EmptyState, Avatar, ProgressBar, StatCard, StarRating, Slider, Tooltip, Dropdown y ThemeToggle, entre otros.

---

## 14. Atajos y accesibilidad

*Cómo usar el sistema solo con el teclado y en cualquier dispositivo.*

| Atajo | Acción |
| --- | --- |
| `Ctrl` + `K` (o `⌘` + `K`) | Abrir el buscador de páginas, personas, no conformidades y tareas |
| `Esc` | Cerrar ventanas, menús y el buscador |
| `Enter` en un ítem del FODA | Guardar el texto; `Esc` descarta el cambio |
| `←` `→` en las pestañas | Cambiar de pestaña |
| `Espacio` y flechas en un tablero | Levantar, mover y soltar una tarjeta |

- **Modo claro y oscuro**: botón de la luna o el sol en la barra superior. Se recuerda en el navegador y, si nunca se eligió, sigue la configuración del sistema.
- **Menú lateral**: se puede colapsar a íconos; en celular se abre con el botón de hamburguesa.
- Todos los botones de solo ícono tienen nombre accesible, el foco siempre es visible y las ventanas atrapan el foco.
- El diseño se adapta a computadora, tableta y celular.

---

## 15. Solución de problemas

*Los inconvenientes más frecuentes y cómo resolverlos.*

| Síntoma | Causa y solución |
| --- | --- |
| La pantalla queda en blanco al abrir `index.html` | Ese archivo necesita el servidor: usá `npm run dev`, o `npm run build:demo` y abrí `dist-demo/arandu-erp.html` |
| Cambié el `.env` y nada pasa | Vite lee el archivo solo al arrancar: detené el servidor y volvé a ejecutar `npm run dev` |
| `permission-denied` o «Error de Firestore» | Las reglas del modo de prueba vencieron: extendé la fecha en Firestore → Reglas |
| Todo aparece vacío | Tocá **Cargar datos de demo** y revisá el estado de conexión del menú lateral |
| Mis cambios no aparecen en otro dispositivo | Estás en modo local (sin `.env`): cada navegador tiene sus propios datos. Configurá Firebase |
| «Sin conexión» en el menú lateral | No hay internet: se muestran los últimos datos guardados y se sincroniza solo al volver |
| Olvidé la contraseña de una cuenta | Un Administrador la cambia o la quita desde Usuarios → editar |
| No puedo crear ni editar usuarios | Solo un Administrador puede hacerlo: cambiá a una cuenta con ese rol |
| No me deja degradar o borrar a un usuario | Es el único administrador activo: primero nombrá a otro |
| Las tarjetas no se arrastran en el celular | Mantené presionada la tarjeta un instante antes de moverla |
| Un gráfico o una pantalla no cargan | Recargá la página; si persiste, abrí la consola del navegador (F12) y revisá el error |

---

## 16. Glosario

*Términos que aparecen en el sistema.*

| Término | Significado |
| --- | --- |
| FODA | Análisis de Fortalezas, Oportunidades, Debilidades y Amenazas de una organización |
| KPI | Indicador clave de desempeño: una cifra que resume cómo va un aspecto del negocio |
| No conformidad | Incumplimiento de un requisito de calidad que hay que analizar y corregir |
| Ejecución presupuestaria | Porcentaje del presupuesto que ya se gastó |
| Clima organizacional | Percepción que tienen las personas sobre su ambiente de trabajo |
| Kanban | Tablero de columnas por las que avanzan las tareas |
| Gantt | Cronograma en barras horizontales sobre una línea de tiempo |
| Ruta crítica | Cadena de fases sin margen de demora que determina la fecha final del proyecto |
| Holgura | Días que una fase puede atrasarse sin mover la fecha final |
| Firestore | Base de datos NoSQL en la nube de Google Firebase |
| onSnapshot | Función de Firestore que avisa a la aplicación cada vez que cambia un dato |
| SPA | Aplicación de una sola página: no se recarga al navegar entre módulos |

---

## 17. Equipo y mantenimiento

*Reparto de módulos y forma de trabajo.*

Cada integrante es dueño de una carpeta dentro de `src/modules/`, lo que evita conflictos al fusionar. La tabla con los nombres está en el `README.md` del repositorio.

- Una rama por módulo (`modulo/finanzas`, `modulo/calidad`…).
- Tocar solo la carpeta propia; si hace falta un componente nuevo en `components/ui/`, avisar al grupo.
- Antes de fusionar a `main`: `npm run build` sin errores y revisar la pantalla en claro, oscuro y celular.
- Después de cambiar esta documentación, ejecutar `npm run docs` para regenerar `docs/DOCUMENTACION.md`.
