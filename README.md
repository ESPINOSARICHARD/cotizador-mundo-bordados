# Cotizador Mundo Bordados · Demo pública

Aplicación web creada para modernizar la preparación de cotizaciones de Mundo Bordados y reemplazar un flujo basado en hojas de cálculo.

## Demo en línea

[Abrir Cotizador Mundo Bordados · Demo pública](https://cotizador-mundo-bordados.eimy-espinosa.chatgpt.site)

![Vista previa del Cotizador Mundo Bordados](public/og.png)

La demostración permite completar los datos del cliente, agregar productos dinámicamente, calcular totales e ITBMS y descargar el documento en PDF o PNG. Los borradores se guardan únicamente en el navegador del visitante.

## Funciones principales

- Vista previa tamaño carta en tiempo real.
- Tabla dinámica para 1, 5, 40 o más productos.
- Subtotal, ITBMS opcional del 7% y total automático.
- Exportación PDF multipágina sin cortar filas, totales o condiciones.
- Exportación PNG; las cotizaciones multipágina se entregan en un archivo ZIP.
- Diseño adaptable a computadora, tableta y celular.
- Persistencia local mediante `localStorage`.

## Privacidad de la demostración

Esta versión pública no contiene firmas, datos fiscales ni teléfonos internos. Todos los documentos llevan la marca **DEMO · Sin validez comercial**. La edición empresarial se mantiene separada y protegida.

## Tecnologías

React, TypeScript, Vinext/Vite, html2canvas, jsPDF y JSZip.

## Uso local

```powershell
pnpm install
pnpm run dev
```

Después abra `http://localhost:3000`.

## Autor

Proyecto desarrollado por Richard Espinosa para Mundo Bordados.
