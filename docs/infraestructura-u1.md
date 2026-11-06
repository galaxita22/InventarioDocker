# Arquitectura de Infraestructura - Unidad 1 (Google Cloud)

## 1. Resumen

El proyecto de la Unidad 1 se encuentra desplegado sobre una infraestructura en la nube utilizando Google Cloud Platform (GCP). La arquitectura está diseñada para garantizar alta disponibilidad y escalabilidad horizontal en la capa de la aplicación.

El flujo divide las responsabilidades en distintas capas: un servidor que actúa como Gateway/Frontend, un balanceador de carga, múltiples instancias de backend alojadas en Máquinas Virtuales (Compute Engine) y una base de datos centralizada mediante el servicio gestionado Cloud SQL.

## 2. Vista de despliegue

```mermaid
flowchart LR
    C[Cliente / Navegador] -->|HTTP / HTTPS| GCP
    
    subgraph GCP [Google Cloud Platform]
        direction LR
        
        GW[VM: Front / Gateway<br/>Nginx Proxy Inverso]
        LB[Load Balancer]
        
        subgraph Backends [Compute Engine]
            B1[VM: Backend 1]
            B2[VM: Backend 2]
        end
        
        DB[(Cloud SQL<br/>MySQL)]

        GW -->|Tráfico API| LB
        LB -->|Round Robin| B1
        LB -->|Round Robin| B2
        B1 -->|Consultas SQL| DB
        B2 -->|Consultas SQL| DB
    end
```

## 3. Descripción de Componentes

La infraestructura se compone de los siguientes recursos dentro de GCP:

**Front / Gateway (Compute Engine):** Máquina virtual que sirve los archivos estáticos de la interfaz de usuario. Además, funciona como proxy inverso (Nginx), interceptando las peticiones del cliente hacia la API y redirigiéndolas hacia la red interna.

**Load Balancer:** Componente encargado de recibir el tráfico de la API proveniente del Gateway y distribuirlo equitativamente entre las distintas instancias de backend disponibles.

**Instancias de Backend (Compute Engine):** Dos máquinas virtuales independientes (B1 y B2) que ejecutan la lógica de negocio de la aplicación. Trabajan en paralelo para soportar una mayor carga de usuarios y proporcionar redundancia (si una falla, la otra sigue operando de forma transparente).

**Base de Datos (Cloud SQL para MySQL):** Servicio de base de datos relacional totalmente gestionado por Google Cloud. Al utilizar Cloud SQL en lugar de una VM tradicional, se delega a GCP la administración del sistema operativo, los parches de seguridad y los respaldos automatizados, garantizando que ambos backends se conecten a un endpoint altamente disponible.

## 4. Flujo de una petición

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente
    participant GW as Gateway (Front / Nginx)
    participant LB as Load Balancer
    participant B as Backend (VM B1 / B2)
    participant DB as Cloud SQL

    C->>GW: 1. Accede a la aplicación
    
    alt Petición de vista
        GW-->>C: Sirve el frontend estático
    else Petición a la API
        GW->>LB: 2. Proxy inverso intercepta petición
        LB->>B: 3. Decide destino (Round Robin)
        activate B
        Note right of B: 4. Procesa la lógica de negocio
        
        opt Requiere base de datos
            B->>DB: 5. Conexión segura (Consulta / Persiste)
            activate DB
            DB-->>B: Retorna información
            deactivate DB
        end
        
        B-->>LB: 6. Inicia viaje de respuesta
        deactivate B
        LB-->>GW: Pasa por el Load Balancer
        GW-->>C: Respuesta final al navegador
    end
```