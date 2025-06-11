# INSTRUCCIONES PARA EJECUTAR EL PROGRAMA, IMPORTAR LA BASE DE DATOS Y REALIZAR LAS PETICIONES POSTMAN

## 1. Importar la base de datos (MongoDB)
* Abrir MongoDB Compass.
* Crear la base de datos con nombre CRUD
* Crear cuatro colecciones en la base de datos (users, categories, subcategories, pruducts)
* Abrir la coleccion usuarios y seguidamente dar click en 'add data'
* Alli da click en import JSON or CSV file
* Selecciona users.json de la carpeta 'base de datos' y la importa
* HACE LO MISMO CON LAS TRES OTRAS COLECCIONES


## 2. Importar entorno Postman
* Abrir Postman.
* Clic en Import arriba a la izquierda.
* Selecciona 'Entorno_crud-Natalia.postman_environment.json' en la carpeta 'peticiones POSTMAN'

## 3. Importar colección Postman
* Clic en Import.
* Seleccionar el archivo CRUD-Natalia.postman_collection.json en la carpeta 'peticiones POSTMAN'.

## 4. Correr el programa
* Debe descomprimir crud.zip
* Abrir la carpeta y ejecutar npm run dev

## Enviar peticiones
* Seleccionar el entorno: Entorno_Evaluacion.
* Elegir la carpeta del rol (Admin, Coordinador o Auxiliar).
* Seleccionar una petición y hacer clic en Send.

Las variables de autenticación (token) ya están preconfiguradas.

Debe realizar la peticion de 'signin' de la carpeta 'USER' de cada usuario antes de cualquier otra peticion

 SOLO DEBE HACER CLICK EN SEND CON LOS GET, LOS POST Y LOS PUT. EN EL CASO DE LOS DELETE SI DE DEBE DIRIGIR A LA BASE DE DATOS, COPIAR EL ID Y PROPORCIONARLO EN LA URL HTTP.
