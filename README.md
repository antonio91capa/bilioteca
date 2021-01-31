# CRUD de Libreria

Este es un ejemplo de un Sistema de Libreria.

Entidades:
  - Libro
  - Autor
  - Genero
  - Copia/Instancias del Libro (Editorial del Libro y donde se pueden encontrar las copias de este)

### Dependencias Nodejs

  - Express
  - Express-validator (validacion de los inputs)
  - Mongoose (driver MongoDB)
  - async (llamadas asincronas a la base de datos)
  - luxon (parsear fechas)
  - pug (vistas HTML)

Para ejecutar este proyecto localmente:
1. Descargar el proyecto
1. Seguir los siguientes comandos en la terminal:
    ```sh
    $ cd bilbioteca
    $ npm install
    $ npm run dev
    ```
1. Abrir el navegador e ir a la direccion http://localhost/3000

> **Nota** Este proyecto usa el driver de la Base de datos de MongoDB. Puedes cambiar el url del driver local y usar el driver/coneccion de Mongo Atlas.
