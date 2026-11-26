import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1600,
    viewportHeight: 900,
    setupNodeEvents(on, config) {
    },
  },
});