# Opciones para despliegue: AWS

## Link de referencia
```bash
https://www-geeksforgeeks-org.translate.goog/blogs/gcp-vs-aws/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc&_x_tr_hist=true
```

## 1. Arquitectura e Infraestructura en la Nube
* **Front/Back:** 4 instancias EC2, `t3.xlarge` (4 vCPU, 16 GB). Se tomó en cuenta el caso de tener un máximo de 3 instancias distintas de backend. Se requiere mayoritariamente potencia de cálculo para procesamiento de solicitudes HTTP. **Costo:** 411.72 USD.
* **Servicio IA:** Instancia EC2, `t3.xlarge` al igual que las instancias de front/back para poder alojar un modelo gratuito de Llama 8B. **Costo:** 98.04 USD.
* **DB:** Se seleccionó el servicio de BD de AWS el cual asegura tener disponibilidad del 99.9% y además un servicio de respaldo en caso de caída. Se seleccionó una SSD de uso general (`gp3` recomendada por AWS) junto con 150 GB de almacenamiento. **Costo:** 299.30 USD.

**Costo total del servicio AWS:** 809.06 USD mensuales ($791.137 CLP aprox. al tipo de cambio referencial).

---

## 2. Resumen de Costos de Infraestructura (AWS)

| Componente | Instancia / Recurso | Especificaciones | Costo Mensual (USD) | Costo Mensual (CLP Aprox.) |
| :--- | :--- | :--- | :--- | :--- |
| **Front / Backend** | 4 $\times$ EC2 | `t3.xlarge` (4 vCPU, 16 GB) | $411.72 | $391.134 |
| **Servidor de IA** | 1 $\times$ EC2 | `t3.xlarge` (Llama 8B) | $98.04 | $93.138 |
| **Base de Datos** | Amazon RDS MySQL | `db.t3.large` + 150 GB `gp3` | $299.30 | $284.335 |
| **Total AWS** | -- | -- | **$809.06** | **$768.607** |

---

## 3. Modelo de Horas-Hombre y Servicios Profesionales
* **Tarifa por hora:** $7.000 CLP por cada desarrollador ($14.000 CLP/h combinados para el equipo de 2 personas).
* **Fase 1 (Desarrollo Inicial):** 160 horas totales en conjunto para el despliegue y puesta en marcha.

---

## 4. Proyección Financiera y Modelo de Cobro (Contrato a 36 Meses)
* **Presupuesto de la licitación:** $42.000.000 CLP para 36 meses de contrato.
* **Gasto total acumulado de AWS (36 meses):** $27.667.800 CLP.

### Tabla de Hitos y Cobros

| Hito / Periodo | Concepto del Servicio | Monto Estimado (CLP) | Modalidad de Facturación |
| :--- | :--- | :--- | :--- |
| **Mes 1 (Implementación)** | Desarrollo inicial (160 h) + AWS Mes 1 + Soporte del primer mes | **$3.092.550** | Pago único inicial |
| **Meses 2 al 36 (Soporte)** | Costo mensual de AWS ($768.550) + Mantenimiento del equipo ($84.000) | **$852.550 / mes** | Igualada fija mensual |

Teniendo en cuenta los cálculos y asumiendo un total de 160 horas totales en conjunto para el desarrollo inicial, el primer mes se realizaría un cobro total de **$3.092.550 CLP** aprox. El resto de los meses el costo mensual a cobrar para aprovechar y ajustar el presupuesto de la licitación se estima en **$852.550 CLP** lo cual daria una ganancia total de **$9.152.200 CLP**.