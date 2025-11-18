# Inspección de Código con SonarQube
Para efectos del uso de la Plataforma de ensayos PAES que hemos estado construyendo a lo largo del año, nos parece que la parte más relevante corresponde al backend. Una correcta implementación del backend garantiza que los estudiantes puedan ingresar a la plataforma, desarrollar los ensayos propuestos por sus profesores, y visualizar sus resultados para entender y estudiar sus errores. Además, asegura que los profesores no enfrenten problemas que impidan la publicación de ensayos y visualización de resultados para reforzar temas específicos. A continuación, se contemplan los resultados de la inspección del código de backend de nuestro proyecto, para la cual utilizamos la herramienta solicitada "SonarQube", que mostró un resumen de los resultados, las 4 quality issues encontradas, y la explicación de dichas issues junto a la manera de arreglarlas.

## Información General
- **Proyecto:** PAES Platform - Backend Routes
- **Sección Analizada:** Backend, carpeta "routes".
- **Fecha de Análisis:** 17 de noviembre.
- **Líneas de Código:** 540 

---
## Main Branch Summary

- **Security:** 0 issues.
- **Reliability:** 3 open issues (A).
- **Maintainability:** 4 open issues (A).
- **Accepted Issues:** 0.
- **Coverage:** 0.0%.
- **Duplications:** 0.0%.
- **Security Hotspots:** 0.

---
## Quality Issues Encontradas
### 1. Prefer `Number.parseInt` over `parseInt`.

**Ubicación:** `routes/ensayos.js` - líneas 184, 185 y 229.

#### Severity - Severidad
- Reliability: Medio.
- Maintainability: Bajo.

#### Explicación e Impacto Potencial
ECMAScript 2015 introdujo métodos y propiedades estáticas en el constructor `Number` para reemplazar varias funciones y valores globales. Utilizar sus objetos brinda consistencia y  organización, ya que se agrupan bajo el mismo namespace; disminuye la contaminación del espacio de nombres global, utilizando sus métodos en vez de variables globales; mejora el comportamiento del código, evitando que se generen resultados inesperados; y finalmente, se alinea con los estándares modernos de JavaScript.

El uso de funciones globales en lugar de métodos `Number` puede provocar comportamientos inesperados que generan errores, inconsistencias en el código y problemas de mantenibilidad porque el código es difícil de entender para desarrolladores externos.

---
### 2. Remove this useless assignment to variable `profesorIdFinal`.

**Ubicación:** `routes/preguntas.js` - línea 20.

#### Severity - Severidad
- Maintainability: Medio.

#### Explicación e Impacto Potencial
Las asignaciones muertas se refieren a asignaciones realizadas a variables locales que posteriormente nunca se utilizan o se sobrescriben inmediatamente. Dichas asignaciones son innecesarias y no contribuyen a la funcionalidad ni a la claridad del código. Incluso pueden afectar negativamente al rendimiento. Eliminarlas mejora la limpieza y la legibilidad del código. Aunque las operaciones innecesarias no perjudiquen la corrección del programa, en el mejor de los casos, representan un desperdicio de recursos computacionales.

---
## Recomendaciones de SonarQube
El análisis identificó 4 quality issues que corresponden a 2 problemas distintos: 3 ocurrencias del mismo error en diferentes líneas y 1 problema adicional de código innecesario.

Se ha decidido abordar todas las recomendaciones, ya que las modificaciones son simples y rápidas de implementar, previenen comportamientos inesperados que puedan llevar a errores en producción, facilitan la comprensión del código para futuros desarrolladores, y mejoran la mantenibilidad del proyecto a largo plazo. Cabe mencionar que la severidad media de los issues justifica su corrección inmediata.

Dado que no existen issues de baja prioridad que puedan posponerse, se procederá a implementar todas las correcciones sugeridas.

### Quality Issue 1: Prefer `Number.parseInt` over `parseInt`.
Reemplazar las funciones de análisis sintáctico globales por sus equivalentes numéricos. El comportamiento es idéntico, pero los métodos numéricos son más explícitos y están mejor organizados.

### Quality Issue 2: Remove this useless assignment to variable `profesorIdFinal`.
Eliminar la asignación innecesaria y luego pruebe el código para asegurarse de que el lado derecho de una asignación dada no tenga efectos secundarios.
