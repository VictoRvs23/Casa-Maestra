import { iniciarSesion, usuarios } from "../support/login";
import { cerrarAlerta, aceptarConfirmacion } from "../support/alertas";

describe("Flujo e2e: reservar una hora en el Estudio 0", () => {
  it("un cliente reserva una hora desde la agenda y luego la cancela", () => {
    // 1. Inicia sesión como cliente
    iniciarSesion(usuarios.cliente);
    cy.intercept("GET", "**/estudio0/disponibilidad*").as("disponibilidad");

    // 2. Entra al Estudio 0 y abre la agenda.
    cy.contains("nav a, .navbar-links a", "Estudio 0").click();
    cy.contains("button", "Ver agenda").click();
    cy.wait("@disponibilidad");

    // 3. Pasa al mes siguiente y elige el último día con horas libres.
    cy.get("button[aria-label='Mes siguiente']").click();
    cy.wait("@disponibilidad");
    cy.get(".e0-dia:not(:disabled)").last().click();

    // 4. Elige la última hora libre del día.
    cy.get(".e0-hora:not(:disabled)").last().click();
    cy.get(".e0-resumen .e0-total").should("not.contain", "$0");

    // 5. Confirma la reserva y ve el aviso de éxito.
    cy.contains("button", "Confirmar reserva").click();
    cy.get(".alerta-exito").should("contain", "Reserva confirmada");
    cerrarAlerta();

    // 6. La reserva aparece en "Mis reservas" como confirmada.
    cy.visit("/estudio0/reservas");
    cy.get(".e0-reserva").last().find(".e0-pill").should("contain", "Confirmada");

    // 7. La cancela y se muestra el aviso.
    cy.get(".e0-reserva").last().contains("button", "Cancelar").click();
    aceptarConfirmacion();
    cy.get(".alerta-exito").should("contain", "La reserva se canceló");
  });
});