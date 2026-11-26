import { iniciarSesion } from "../support/login";
import { cerrarAlerta } from "../support/alertas";

describe("Flujo 1 - Registro, login y filtrado de talleres (espacios)", () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
  });

  it("debe registrar un usuario, iniciar sesión y filtrar talleres por nombre", () => {
    const sufijo = Date.now();
    const email = `cypress_${sufijo}@ejemplo.com`;
    const contraseña = "Password123!";

    // 1) Registro
    cy.visit("/registro");
    cy.get("#nombre_usuario").type(`cypress_${sufijo}`);
    cy.get("#nombre").type("Cypress");
    cy.get("#apellido").type("Prueba");
    cy.get("#email").type(email);
    cy.get("#telefono").type("912345678");
    cy.get('[id="contraseña"]').type(contraseña);
    cy.get('[id="confirmar_contraseña"]').type(contraseña);
    cy.get("button.registro-btn").click();

    //Alerta de registro exitoso
    cy.contains(".alerta-box", "Registro exitoso").should("be.visible");
    cerrarAlerta();
    cy.url().should("include", "/login");

    // 2) Login con el usuario recién registrado (login compartido de support/login.js)
    iniciarSesion({ email, contraseña });
    cy.contains("Mi Cuenta").should("be.visible");

    // 3) Talleres y filtrado
    cy.contains("a", "Talleres").click();
    cy.url().should("include", "/talleres");
    cy.get(".estudio-card").should("have.length.at.least", 3);

    // 4) Filtro
    cy.get(".estudio-card").then(($tarjetas) => {
      const nombre = [...$tarjetas]
        .map((t) => t.innerText.match(/(Estudio|Taller) \d+/))
        .find(Boolean)[0];

      cy.get('input[placeholder^="Ej:"]').type(nombre);
      cy.get(".search-btn").click();

      cy.get(".estudio-card").should("have.length", 1);
      cy.get(".estudio-card").first().should("contain", nombre);
    });
  });
});