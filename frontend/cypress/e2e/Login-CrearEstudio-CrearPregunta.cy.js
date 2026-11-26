import { iniciarSesion, usuarios } from "../support/login";
import { cerrarAlerta } from "../support/alertas";

describe("Flujo 2 - El Fundador crea un taller (espacio) y una pregunta frecuente", () => {
  const sufijo = Date.now();
  const nombreTaller = `Taller Cypress ${sufijo}`;
  const pregunta = `¿Pregunta de Cypress ${sufijo}?`;

  beforeEach(() => {
    cy.viewport(1600, 900);
  });

  it("debe iniciar sesión como Fundador, crear un taller y crear una pregunta frecuente", () => {
    // 1) Login con el Fundador
    iniciarSesion(usuarios.fundador);
    cy.contains("Mi Cuenta").should("be.visible");

    // 2) Crear taller (espacio que se arrienda)
    cy.contains("a", "Talleres").click();
    cy.url().should("include", "/talleres");
    cy.contains("button", "+ Crear taller").click();

    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear taller").should("be.visible");
      cy.get('input[name="nombre"]').type(nombreTaller);
      cy.get('textarea[name="descripcion"]').type("Creado desde Cypress");
      cy.get('input[name="capacidad"]').type("4");
      cy.get('input[name="precio"]').type("200000");
      cy.get('input[name="ancho_metros"]').type("5");
      cy.get('input[name="largo_metros"]').type("6");
      cy.get('button[type="submit"]').click();
    });

    //Alerta de creación exitosa (solo si el taller se guardó bien)
    cy.get(".modal-box").should("not.exist");
    cy.contains(".alerta-box, .alerta-exito", /se creó correctamente/).should("be.visible");
    cerrarAlerta();

    // 3) Crear una pregunta frecuente desde Soporte
    cy.contains("a", "Soporte").click();
    cy.url().should("include", "/soporte");
    cy.contains("button", "Preguntas frecuentes").click();
    cy.contains("button", "+ Crear pregunta").click();

    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear pregunta").should("be.visible");
      cy.get('input[placeholder^="Ej:"]').type(pregunta);
      cy.get("textarea").type("Respuesta creada desde Cypress");
      cy.get('button[type="submit"]').click();
    });

    cy.get(".modal-box").should("not.exist");
    cy.contains(".alerta-box, .alerta-exito", /correctamente/).should("be.visible");
    cerrarAlerta();
    cy.contains(pregunta).should("be.visible");
  });
});