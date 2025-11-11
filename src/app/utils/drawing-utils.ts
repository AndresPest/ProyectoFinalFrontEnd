import { NormalizedLandmarkList } from '@mediapipe/face_mesh';

// 👇 Esta es una versión reducida de FACEMESH_TESSELATION
// Para producción puedes incluir el set completo desde:
// https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_mesh/face_mesh_connections.json

export const FACEMESH_IRISES: Array <[number, number]> = [
  [474, 475], [475, 476], [476, 477], [477, 474], // ojo izquierdo
  [469, 470], [470, 471], [471, 472], [472, 469]  // ojo derecho
];

// Dibuja conectores entre puntos
export function drawConnectors(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  connections: Array<[number, number]>,
  style?: { color?: string; lineWidth?: number }
): void {
  const { color = '#00FF00', lineWidth = 1 } = style || {};
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [start, end] of connections) {
    const pt1 = landmarks[start];
    const pt2 = landmarks[end];
    if (!pt1 || !pt2) continue;
    ctx.beginPath();
    ctx.moveTo(pt1.x * ctx.canvas.width, pt1.y * ctx.canvas.height);
    ctx.lineTo(pt2.x * ctx.canvas.width, pt2.y * ctx.canvas.height);
    ctx.stroke();
  }
}

// Dibuja puntos
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  style?: { color?: string; radius?: number }
): void {
  const { color = '#FF0000', radius = 1 } = style || {};
  ctx.fillStyle = color;

  for (const pt of landmarks) {
    ctx.beginPath();
    ctx.arc(pt.x * ctx.canvas.width, pt.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}