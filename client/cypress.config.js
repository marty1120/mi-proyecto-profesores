
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Asegúrate de que coincide con la URL donde corre tu app
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Ajusta el patrón de búsqueda de pruebas
    supportFile: false, // Opcional: desactiva el archivo de soporte si no lo usas
    setupNodeEvents(on, config) {
      // Implementa aquí los eventos del nodo si es necesario
    },
  },
});
