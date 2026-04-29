import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'models');

function vecSub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vecCross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function vecNormalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function makeD10Data() {
  const top = [0, 1.18, 0];
  const bottom = [0, -1.18, 0];
  const ring = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2 + Math.PI / 10;
    const y = i % 2 === 0 ? 0.28 : -0.28;
    ring.push([Math.cos(angle) * 0.92, y, Math.sin(angle) * 0.92]);
  }

  const positions = [];
  const normals = [];
  const indices = [];

  function addTriangle(a, b, c) {
    const n = vecNormalize(vecCross(vecSub(b, a), vecSub(c, a)));
    const start = positions.length / 3;
    positions.push(...a, ...b, ...c);
    normals.push(...n, ...n, ...n);
    indices.push(start, start + 1, start + 2);
  }

  for (let i = 0; i < 10; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % 10];
    addTriangle(top, a, b);
    addTriangle(bottom, b, a);
  }

  return { positions, normals, indices };
}

function f32Buffer(values) {
  const array = new Float32Array(values);
  return Buffer.from(array.buffer);
}

function u16Buffer(values) {
  const array = new Uint16Array(values);
  return Buffer.from(array.buffer);
}

function minMax(values) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < values.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], values[i + axis]);
      max[axis] = Math.max(max[axis], values[i + axis]);
    }
  }
  return { min, max };
}

async function writeD10(name, color) {
  const { positions, normals, indices } = makeD10Data();
  const chunks = [f32Buffer(positions), f32Buffer(normals), u16Buffer(indices)];
  let offset = 0;
  const bufferViews = chunks.map((chunk, index) => {
    const view = { buffer: 0, byteOffset: offset, byteLength: chunk.byteLength };
    if (index < 2) view.byteStride = 12;
    offset += chunk.byteLength;
    while (offset % 4 !== 0) offset += 1;
    return view;
  });

  const padded = [];
  for (const chunk of chunks) {
    padded.push(chunk);
    const padding = (4 - (chunk.byteLength % 4)) % 4;
    if (padding) padded.push(Buffer.alloc(padding));
  }
  const buffer = Buffer.concat(padded);
  const bounds = minMax(positions);

  const gltf = {
    asset: { version: '2.0', generator: 'Paritas procedural d10' },
    scenes: [{ nodes: [0, 1] }],
    scene: 0,
    nodes: [{ mesh: 0, name: 'D10' }, { light: 0, name: 'Softbox', translation: [0, 4, 3] }],
    extensionsUsed: ['KHR_lights_punctual'],
    extensions: {
      KHR_lights_punctual: {
        lights: [{ type: 'point', color: [1, 0.86, 0.58], intensity: 80 }]
      }
    },
    materials: [
      {
        name: 'polished plastic',
        pbrMetallicRoughness: {
          baseColorFactor: color,
          metallicFactor: 0,
          roughnessFactor: 0.42
        }
      }
    ],
    meshes: [
      {
        name: 'Rounded D10 fallback mesh',
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0
          }
        ]
      }
    ],
    buffers: [{ uri: `data:application/octet-stream;base64,${buffer.toString('base64')}`, byteLength: buffer.byteLength }],
    bufferViews,
    accessors: [
      { bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3', min: bounds.min, max: bounds.max },
      { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: indices.length, type: 'SCALAR' }
    ]
  };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, name), JSON.stringify(gltf));
}

await writeD10('d10_percentile_blue.gltf', [0.02, 0.28, 0.86, 1]);
await writeD10('d10_units_ivory.gltf', [0.86, 0.82, 0.68, 1]);

console.log(`Wrote d10 GLTF assets to ${outDir}`);
