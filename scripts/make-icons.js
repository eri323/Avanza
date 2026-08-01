import sharp from 'sharp';

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#171717"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${size * 0.58}" font-weight="bold" fill="#ffffff">A</text>
</svg>`;

Promise.all(
  [192, 512].map((size) =>
    sharp(Buffer.from(svg(size))).png().toFile(`public/icon-${size}.png`),
  ),
).then(() => console.log('Iconos generados.'));
