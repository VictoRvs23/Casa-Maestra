"use strict";

export const slugify = (texto = "") => {
    const slug = String(texto)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")   
        .replace(/^-+|-+$/g, "")        
        .slice(0, 80);

    return slug || "residente";
};
