document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm'); // Formulario de subida
    const resultDiv = document.getElementById('result'); // Contenedor para mostrar resultados
    const loader = document.getElementById('loader'); // Indicador de carga
    const deleteAllButton = document.getElementById('deleteAllButton'); // Botón para borrar todas las imágenes
    const deleteMessage = document.getElementById('deleteMessage'); // Contenedor del mensaje de eliminación
    const deleteMessageText = document.getElementById('deleteMessageText'); // Texto del mensaje de eliminación

    // Manejo del formulario de subida
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el comportamiento predeterminado del formulario

        const formData = new FormData(uploadForm); // Obtiene los datos del formulario
        loader.style.display = 'block'; // Muestra el loader
        resultDiv.innerHTML = ''; // Limpia resultados anteriores
        deleteMessage.style.display = 'none'; // Oculta el mensaje de borrar imágenes

        try {
            // Realiza la petición al servidor para convertir las imágenes
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json(); // Convierte la respuesta a JSON
            loader.style.display = 'none'; // Oculta el loader

            if (response.ok) {
                resultDiv.innerHTML = `<h3>Imágenes convertidas:</h3>`; // Encabezado de resultados

                // Muestra las imágenes convertidas con opciones de descarga
                data.images.forEach(imageUrl => {
                    resultDiv.innerHTML += `
                        <div>
                            <img src="${imageUrl}" alt="Imagen convertida" style="max-width: 100%; margin: 10px 0;">
                            <a href="${imageUrl}" download class="btn btn-primary">Descargar</a>
                        </div>`;
                });

                // Muestra el mensaje de eliminación
                deleteMessage.style.display = 'block';
                deleteMessageText.innerHTML = `Se han cargado ${data.images.length} imagen${data.images.length === 1 ? '' : 's'}. ¿Quieres eliminarlas?`;

                // Desplaza automáticamente al inicio del contenedor de resultados
                resultDiv.scrollTop = 0;
            } else {
                console.error('Error en la respuesta del servidor:', data);
                resultDiv.innerHTML = `<p class="text-danger">Error: ${data.error || 'No se pudo procesar la solicitud.'}</p>`;
            }

        } catch (err) {
            // Manejo de errores de red o de servidor
            loader.style.display = 'none';
            console.error('Error de red o servidor:', err);
            resultDiv.innerHTML = `<p class="text-danger">Ocurrió un error inesperado. Revisa la consola para más detalles.</p>`;
        }
    });

    // Manejo del botón para borrar todas las imágenes convertidas
    deleteAllButton.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que deseas eliminar todas las imágenes convertidas?')) {
            loader.style.display = 'block'; // Muestra el loader mientras se realiza la operación

            try {
                // Realiza la petición al servidor para eliminar las imágenes
                const response = await fetch('/delete-all', { method: 'DELETE' });
                loader.style.display = 'none'; // Oculta el loader

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message); // Muestra mensaje de éxito
                    resultDiv.innerHTML = ''; // Limpia los resultados en pantalla
                    deleteMessage.style.display = 'none'; // Oculta el mensaje de eliminación
                } else {
                    alert('Error al intentar eliminar las imágenes.');
                }
            } catch (error) {
                loader.style.display = 'none';
                console.error('Error al borrar imágenes:', error);
                alert('Error de red al intentar eliminar las imágenes.');
            }
        }
    });
});
