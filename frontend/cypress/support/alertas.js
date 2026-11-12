export const cerrarAlerta = () => {
  cy.get(".alerta-btn-primary").click();
  cy.get(".alerta-overlay").should("not.exist");
};

export const aceptarConfirmacion = () => {
  cy.get(".alerta-peligro .alerta-btn-primary").click();
};