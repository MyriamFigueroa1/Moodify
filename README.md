# Moodify

## Miembros del proyecto
+ Yolanda Llop Pellisa
+ Karen Cebreros López
+ Myriam Lizeth Figueroa Morales
+ Marta Canino Romero
+ Xavier Alexander Mora Peraza

## Descripción 

Moodify es una aplicación web que permite a los usuarios registrar sus emociones diarias, conectar con amigos, compartir su estado de ánimo acompañado de listas de canciones, y obtener recomendaciones musicales basadas en análisis emocional y reconocimiento facial. La plataforma ofrece funcionalidades en tiempo real para que los usuarios puedan interactuar instantáneamente y visualizar los estados de ánimo de sus amigos. Además, cuenta con un sistema de moderación administrado para garantizar un ambiente seguro y amigable.  

---

## **Ejecución Local**

Sigue estos pasos para ejecutar el proyecto localmente en tu máquina:

### **1. Requisitos previos**
Antes de comenzar, asegúrate de tener instalados:
- [Node.js](https://nodejs.org/) (v14 o superior).
- [MongoDB](https://www.mongodb.com/) instalado y ejecutándose localmente o accesible a través de la nube.
- Una cuenta y claves API para los servicios de:
  - [OpenAI](https://platform.openai.com/)
  - [AWS](https://aws.amazon.com/)

---

### **2. Clonar el repositorio**
Clona este repositorio en tu máquina local:
```bash
git clone [https://github.com/MyriamFigueroa1/Moodify.git](url)
cd Moodify/src
```
### **3.  Instalar dependencias**
Ejecuta el siguiente comando para instalar las dependencias necesarias:
```bash
npm install
```
### **4.  Configurar variables de entorno**
Crea o importa el archivo .env en la raíz del proyecto (dentro de /src) con las variables de entorno necesarias: MongoDB, OpenAI, AWS:
### **5.  Ejecutar el proyecto**
Inicia el servidor utilizando el siguiente comando:
```bash
npm start
```
El servidor estará disponible en http://localhost:3000.


## **Despliegue en Azure**

El proyecto está desplegado en **Microsoft Azure** para asegurar una infraestructura escalable y confiable, a través de la url: [https://moodify-demo.azurewebsites.net/](url)

Resumen del proceso de despliegue:
### **1. Backend**
El servidor Node.js fue desplegado en **Azure App Service**. El despliegue se realizó siguiendo estos pasos:
1. Configuración del servicio en el portal de Azure.
2. Uso de Git o una herramienta de CI/CD (como GitHub Actions) para realizar el despliegue automático.

### **2. Base de datos**
La base de datos se mantiene en MongoDB.

### **3. Frontend**
El frontend fue alojado en **Azure Static Web Apps**, lo que asegura tiempos de carga rápidos y una distribución eficiente de los recursos.

### **4. Servicios Externos**
A pesar de estar desplegado en Azure, el backend sigue interactuando con:
- **OpenAI**: Para el reconocimiento facial.
- **AWS**: Para funcionalidades adicionales como almacenamiento.


