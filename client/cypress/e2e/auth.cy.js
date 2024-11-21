// cypress/e2e/auth.cy.js

describe('Flujo de Autenticación y Protección de Rutas', () => {
  beforeEach(() => {
    // Limpia el estado antes de cada prueba
    cy.clearLocalStorage();
  });

  it('Inicio de sesión como Administrador y acceso a rutas de administración', () => {
    // Visita la página de login
    cy.visit('/login');

    // Ingresar credenciales de administrador usando data-testid
    cy.get('[data-testid="email-input"]').type(Cypress.env('adminCredentials').username);
    cy.get('[data-testid="password-input"]').type(Cypress.env('adminCredentials').password);

    // Hacer clic en el botón de login
    cy.get('[data-testid="login-button"]').click();

    // Verificar que se redirige a la página principal
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);

    // Acceder a una ruta de administración
    cy.visit('/admin/likes');

    // Verificar que la página de administración se carga
    cy.contains('Like Moderation').should('be.visible');
  });

  it('Cierre de sesión elimina permisos de administrador', () => {
    // Inicia sesión como administrador primero
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(Cypress.env('adminCredentials').username);
    cy.get('[data-testid="password-input"]').type(Cypress.env('adminCredentials').password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);

    // Cerrar sesión
    cy.get('button').contains('Logout').click();

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/login');

    // Intentar acceder a una ruta de administración
    cy.visit('/admin/likes');

    // Verificar que se redirige a la página principal o muestra un mensaje de no autorizado
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('Inicio de sesión como Profesor y acceso a rutas de profesor', () => {
    // Visita la página de login
    cy.visit('/login');

    // Ingresar credenciales de profesor usando data-testid
    cy.get('[data-testid="email-input"]').type(Cypress.env('profesorCredentials').username);
    cy.get('[data-testid="password-input"]').type(Cypress.env('profesorCredentials').password);

    // Hacer clic en el botón de login
    cy.get('[data-testid="login-button"]').click();

    // Verificar que se redirige a la página principal
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);

    // Acceder a una ruta protegida para profesores
    cy.visit('/grupos');

    // Verificar que la página de grupos se carga
    cy.contains('Collaborative Groups').should('be.visible');

    // Intentar acceder a una ruta de administración
    cy.visit('/admin/likes');

    // Verificar que no puede acceder y es redirigido o muestra un mensaje de no autorizado
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('Intentar acceder a rutas protegidas sin autenticación redirige a login', () => {
    // Intentar acceder a una ruta protegida sin estar autenticado
    cy.visit('/grupos');

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/login');
  });
});

