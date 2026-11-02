/* eslint-disable @typescript-eslint/no-require-imports */
// Executar depois do build OpenNext e antes de publicar o Worker de produção.
// Valores privados e de teste pertencem aos bindings, nunca ao pacote publicado.
const fs = require("node:fs");
const path = require("node:path");
const file = path.join(process.cwd(), ".open-next/cloudflare/next-env.mjs");
const source = fs.readFileSync(file, "utf8");
const environments = [...source.matchAll(/^export const (production|development|test) = (.+);$/gm)];
if (environments.length !== 3) throw new Error("Formato de ambiente OpenNext inesperado; publicação interrompida.");
const privateValues = [];
const clean = environments.map(([, mode, json]) => {
  const values = JSON.parse(json);
  for (const [key, value] of Object.entries(values)) {
    if (!key.startsWith("NEXT_PUBLIC_") && /KEY|SECRET|PASSWORD/.test(key) && typeof value === "string" && value.length >= 12) privateValues.push(value);
  }
  return `export const ${mode} = ${JSON.stringify(Object.fromEntries(Object.entries(values).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))))};`;
});
fs.writeFileSync(file, clean.join("\n") + "\n");
const leakedFiles = [];
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) inspect(target);
    else {
      const bytes = fs.readFileSync(target);
      if (privateValues.some(value => bytes.includes(Buffer.from(value)))) leakedFiles.push(target);
    }
  }
}
inspect(path.join(process.cwd(), ".open-next"));
if (leakedFiles.length) throw new Error(`Valores privados encontrados no pacote: ${leakedFiles.join(", ")}`);
console.log("Pacote de produção preparado: configurações locais removidas e valores privados ausentes.");
