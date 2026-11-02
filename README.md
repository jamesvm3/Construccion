# Predimensionado de estructuras

Herramienta didáctica de predimensionado de las asignaturas de Construcción de la ETSIE y la ETSA (Universidad de Granada). Profesor responsable: Jaime Vergara Muñoz.

Calculadoras de hormigón (cimentaciones, muros y estructura), acero y madera, con su proceso constructivo. Procedimientos basados en *Números gordos en el proyecto de estructuras* (J. C. Arroyo) y *Cálculo rápido de estructuras* (S. Mute), con la Guía de aplicación del Código Estructural y los DB SE-C, SE-A y SE-M. Resultados aproximados con fines didácticos: no sustituyen al cálculo de las asignaturas de Estructuras ni sirven para un proyecto real.

## Uso
Abrir `index.html`. Es una web estática (HTML, CSS y JavaScript), sin dependencias de servidor: funciona en GitHub Pages.

## Qué herramientas se ven en el menú
La lista está en `index.html`, en el bloque:

```html
<script type="application/json" id="state">{"enabled":[...]}</script>
```

Añade o quita identificadores (`zapata`, `medianera`, `esquina`, `combinada`, `centradora`, `atado`, `losa`, `losa-ampliacion`, `pilotes`, `encepado`, `muro`, `contencion`, `pantalla`, `unidireccional`, `reticular`, `viga`, `pilar`, `viga-acero`, `pilar-acero`, `basa`, `soldadura`, `tirante`, `viga-madera`, `pilar-madera`, `fuego-madera`). El panel de configuración del portal solo funciona dentro de Claude; aquí se edita esa línea.

## Licencia
© 2026 Jaime Vergara Muñoz, Universidad de Granada. Obra con licencia [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es): puede compartirse citando la autoría, sin uso comercial ni obras derivadas.
Errores o sugerencias: jaimevergara@ugr.es
