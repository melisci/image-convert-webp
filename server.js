const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Inicializa Express
const app = express();

// Configuración de carpeta pública para servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
 // Servir la carpeta assets

// Middleware para procesar formularios con archivos
const upload = multer({ dest: 'uploads/' }); // Middleware Multer

// Ruta principal (home)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Sirve el archivo HTML
});

// Ruta para convertir imágenes
app.post('/convert', upload.array('images', 10), async (req, res) => { 
    // 'images' debe coincidir con el name del input HTML
    // 10 es el máximo de archivos permitidos
    try {
        const files = req.files; // Archivos subidos
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No se subieron imágenes.' });
        }

        const convertedImages = [];
        for (const file of files) {
            const outputFileName = `converted-${Date.now()}-${file.originalname}.webp`;
            const outputFilePath = path.join(__dirname, 'public', outputFileName);

            await sharp(file.path)
                .webp({ quality: 80 })
                .toFile(outputFilePath);

            convertedImages.push(`/public/${outputFileName}`);
            fs.unlinkSync(file.path); // Elimina archivo temporal
        }

        res.json({ images: convertedImages }); // Devuelve las URLs de las imágenes convertidas
    } catch (err) {
        console.error('Error al procesar imágenes:', err);
        res.status(500).json({ error: 'Error al convertir las imágenes.' });
    }
});

app.delete('/delete-all', (req, res) => {
    const directory = path.join(__dirname, 'public'); // Carpeta donde se guardan las imágenes convertidas

    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error leyendo el directorio:', err);
            return res.status(500).json({ error: 'No se pudieron eliminar los archivos' });
        }

        // Eliminar cada archivo en la carpeta
        files.forEach(file => {
            fs.unlink(path.join(directory, file), err => {
                if (err) {
                    console.error('Error eliminando archivo:', err);
                }
            });
        });

        res.json({ message: 'Todas las imágenes convertidas han sido eliminadas' });
    });
});


// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
