// Converte os originais aprovados para as dimensões de entrega, sem recortar.
async function main() {
  const { default: sharp } = await import('sharp');
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const source = path.join(__dirname, 'originais');
  const target = path.resolve(__dirname, '../../../public/images/redes-sociais/auria');
  await fs.mkdir(target, { recursive: true });
  const files = (await fs.readdir(source)).filter(name => name.endsWith('.png'));
  const manifest = [];
  for (const file of files) {
    const video = file.startsWith('video-referencia');
    const name = file.replace(/\.png$/, '.webp');
    const info = await sharp(path.join(source, file))
      .resize(1080, video ? 1920 : 1350, {
        fit: 'contain', background: '#e6ddcf',
      })
      .webp({ quality: 88, effort: 5 })
      .toFile(path.join(target, name));
    manifest.push({ file: name, width: info.width, height: info.height, bytes: info.size });
  }
  await fs.writeFile(path.join(__dirname, 'assets.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
