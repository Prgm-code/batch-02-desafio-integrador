const fs = require('fs');
const path = require('path');

const directorio = './ipfs/metadata'; // Ajusta a tu ruta
const directorioSalida = './ipfs/metadataOut'; // Ajusta a tu ruta de salida

// Eliminar el directorio de salida si ya existe
if (fs.existsSync(directorioSalida)) {
    fs.rmdirSync(directorioSalida, { recursive: true });
}

// Crear el directorio de salida
fs.mkdirSync(directorioSalida);

fs.readdir(directorio, (err, archivos) => {
    if (err) {
        console.error('Error al leer el directorio:', err);
        return;
    }

    archivos.forEach(archivo => {
        const rutaArchivo = path.join(directorio, archivo);

        const id_num = parseInt(archivo);

        fs.readFile(rutaArchivo, 'utf8', (err, contenido) => {
            if (err) {
                console.error('Error al leer el archivo:', err);
                return;
            }

            const data = JSON.parse(contenido);

            // Según tramos
            if (0 <= id_num && id_num <= 199) {
                data['name'] = `Común#${id_num}`;
            } else if (200 <= id_num && id_num <= 499) {
                data['name'] = `Raro#${id_num}`;
            } else if (500 <= id_num && id_num <= 699) {
                data['name'] = `Legendario#${id_num}`;
            } else if (700 <= id_num && id_num <= 999) {
                data['name'] = `Místico#${id_num}`;
            } else if (1000 <= id_num && id_num <= 1999) {
                data['name'] = `Whitelist#${id_num}`;
            }

            // Escribir en la carpeta de salida
            fs.writeFile(path.join(directorioSalida, archivo), JSON.stringify(data, null, 4), err => {
                if (err) {
                    console.error('Error al escribir el archivo:', err);
                }
            });
        });
    });
});
