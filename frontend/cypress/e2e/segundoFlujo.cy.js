describe("Flujo 2 - Admin crea estudio y contenedor de residente", () => {
  const sufijo = Date.now();
  const nombreEstudio = `Estudio Cypress ${sufijo}`;
  const nombreResidente = `Residente Cypress ${sufijo}`;

  it("debe iniciar sesión con AdminDemo, crear un estudio y crear un residente", () => {
    // 1) Login con AdminDemo
    cy.visit("http://localhost:5173/login");
    cy.get("#email").type("admin@casamaestra.cl");
    cy.get("#password").type("admin123");
    cy.get("button.login-btn").click();
    cy.url().should("not.include", "/login");
    cy.contains("Mi Cuenta").should("be.visible");

    // 2) Crear estudio
    cy.contains("a", "Estudios").click();
    cy.url().should("include", "/estudios");
    cy.contains("button", "+ Crear estudio").click();

    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear estudio").should("be.visible");
      cy.get('input[name="nombre"]').type(nombreEstudio);
      cy.get('textarea[name="descripcion"]').type("Creado desde Cypress");
      cy.get('input[name="capacidad"]').type("4");
      cy.get('input[name="precio"]').type("200000");
      cy.get('input[name="ancho_metros"]').type("5");
      cy.get('input[name="largo_metros"]').type("6");
      cy.get('button[type="submit"]').click();
    });

    //Alerta de creación de estudio exitoso (solo si el estudio se guardó bien)
    cy.get(".modal-box").should("not.exist");
    cy.contains(".alerta-box", "El estudio se creó correctamente").should("be.visible");
    cy.contains(".alerta-box button", "Aceptar").click();

    // 3) Crear contenedor de residente
    cy.contains("a", "Residentes").click();
    cy.url().should("include", "/residentes");
    cy.contains("button", "+ Crear residente").click();

    cy.get(".modal-box").within(() => {
      cy.contains("h2", "Crear residente").should("be.visible");
      cy.get('input[name="nombre"]').type(nombreResidente);
      cy.get('input[name="descripcion"]').type("Creado desde Cypress");
      cy.get('button[type="submit"]').click();
    });

    //Alerta de creación de residente exitoso (solo si el residente se guardó bien)
    cy.get(".modal-box").should("not.exist");
    cy.contains(".alerta-box", "El residente se creó correctamente").should("be.visible");
    cy.contains(".alerta-box button", "Aceptar").click();
    cy.contains(".residente-card", nombreResidente).should("be.visible");
  });
});