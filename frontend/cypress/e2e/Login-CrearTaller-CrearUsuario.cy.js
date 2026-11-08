import { iniciarSesion, usuarios } from "../support/login";

describe("Flujo e2e: el Fundador crea un taller y un usuario nuevo", () => {
  const sufijo = Date.now();
  const nombreTaller = `Taller Cypress ${sufijo}`;
  const usuario = {
    nombre_usuario: `usuario_${sufijo}`,
    nombre: "Camila",
    apellido: "Cypress",
    email: `cypress.${sufijo}@ejemplo.com`,
    telefono: `9${String(sufijo).slice(-8)}`,
    contraseña: "Cypress123",
  };

  it("debe crear un taller en el inicio y luego crear un usuario nuevo", () => {
    // 1. Inicia sesión como Fundador
    iniciarSesion(usuarios.fundador);
    cy.contains("Mi Cuenta").should("be.visible");

    // 2. Crea un taller desde el inicio.
    cy.contains("button", "+ Crear taller").click();
    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear taller").should("be.visible");
      cy.get('input[name="nombre"]').type(nombreTaller);
      cy.get('textarea[name="descripcion"]').type("Creado desde Cypress");
      cy.get('button[type="submit"]').click();
    });
    cy.get(".modal-box").should("not.exist");
    cy.get(".alerta-exito").should("contain", "El taller se creó correctamente");
    cy.cerrarAlerta();
    cy.contains(".category-card", nombreTaller).should("be.visible");

    // 3. Crea un usuario
    cy.contains("a", "Usuarios").click();
    cy.url().should("include", "/usuarios");
    cy.contains("button", "+ Crear usuario").click();
    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear usuario").should("be.visible");
      cy.get("#nuevo-nombre_usuario").type(usuario.nombre_usuario);
      cy.get("#nuevo-nombre").type(usuario.nombre);
      cy.get("#nuevo-apellido").type(usuario.apellido);
      cy.get("#nuevo-email").type(usuario.email);
      cy.get("#nuevo-telefono").type(usuario.telefono);
      cy.get("[id='nuevo-contraseña']").type(usuario.contraseña);
      cy.get('button[type="submit"]').click();
    });
    cy.get(".modal-box").should("not.exist");
    cy.get(".alerta-exito").should("contain", "La cuenta se creó correctamente");
    cy.cerrarAlerta();
  });
});