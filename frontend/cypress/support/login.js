export const usuarios = {
  admin: { email: "admin@casamaestra.cl", contraseña: "admin123" },
  fundador: { email: "fundador@casamaestra.cl", contraseña: "fundador123" },
  residente: { email: "residente@casamaestra.cl", contraseña: "residente123" },
  artista: { email: "artista@casamaestra.cl", contraseña: "artista123" },
  cliente: { email: "cliente@casamaestra.cl", contraseña: "cliente123" },
};

export const iniciarSesion = ({ email, contraseña }) => {
  cy.session(email, () => {
    cy.visit("/login");
    cy.get("#email").type(email);
    cy.get("#password").type(contraseña);
    cy.get("button[type='submit']").click();
    cy.location("pathname").should("eq", "/");
  });

  cy.visit("/");
};