describe("Flujo 1 - Registro, login y filtrado de estudios", () => {
  it("debe registrar un usuario, iniciar sesión y filtrar estudios por nombre", () => {
    const sufijo = Date.now();
    const email = `cypress_${sufijo}@ejemplo.com`;
    const contraseña = "Password123!";

    // 1) Registro
    cy.visit("http://localhost:5173/registro");
    cy.get("#nombre_usuario").type(`cypress_${sufijo}`);
    cy.get("#nombre").type("Cypress");
    cy.get("#apellido").type("Prueba");
    cy.get("#email").type(email);
    cy.get("#telefono").type("912345678");
    cy.get('[id="contraseña"]').type(contraseña);
    cy.get('[id="confirmar_contraseña"]').type(contraseña);

    const alerta = cy.stub().as("alerta");
    cy.on("window:alert", alerta);
    cy.get("button.registro-btn").click();

    cy.get("@alerta").should("have.been.calledWithMatch", "Registro exitoso");
    cy.url().should("include", "/login");

    // 2) Login
    cy.get("#email").type(email);
    cy.get("#password").type(contraseña);
    cy.get("button.login-btn").click();
    cy.url().should("not.include", "/login");
    cy.contains("Mi Cuenta").should("be.visible");

    // 3) Estudios y filtrado
    cy.contains("Estudios").click();
    cy.url().should("include", "/estudios");
    cy.get(".estudio-card").should("have.length.at.least", 3);

    cy.get('input[placeholder="Ej: Estudio 2"]').type("Estudio 2");
    cy.get(".search-btn").click();

    cy.get(".estudio-card").should("have.length", 1);
    cy.get(".estudio-card").first().should("contain", "Estudio 2");
  });
});