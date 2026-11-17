// 꾸민 케이스를 PNG 이미지로 만들어 내려받기 (P06 이미지 저장하기)
import { CUBIC_SHADOW, getCaseColor, getCaseType, getEngraveStyle, getSticker } from '../data/catalog';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function renderDesign(design, size = 1000) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 배경 (면 색)
  ctx.fillStyle = '#F7E6DF';
  ctx.fillRect(0, 0, size, size);

  const pad = size * 0.07;
  const box = size - pad * 2;
  const type = getCaseType(design.type);
  const color = getCaseColor(design.color);
  const caseImg = await loadImage(type.top);

  // 케이스 색 입히기: 케이스 모양으로 자른 색을 곱하기로 겹침
  const tint = document.createElement('canvas');
  tint.width = box;
  tint.height = box;
  const tctx = tint.getContext('2d');
  tctx.fillStyle = color.value;
  tctx.fillRect(0, 0, box, box);
  tctx.globalCompositeOperation = 'destination-in';
  tctx.drawImage(caseImg, 0, 0, box, box);

  ctx.drawImage(caseImg, pad, pad, box, box);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(tint, pad, pad);
  ctx.globalCompositeOperation = 'source-over';

  if (document.fonts?.ready) await document.fonts.ready;

  for (const it of design.items) {
    ctx.save();
    ctx.translate(pad + it.x * box, pad + it.y * box);
    ctx.rotate(((it.rot || 0) * Math.PI) / 180);
    if (it.kind === 'engrave') {
      const text = (it.text || '').trim();
      if (text) {
        const s = getEngraveStyle(it.style);
        const px = it.fs * box;
        ctx.font = `${s.weight} ${px}px ${s.family}`;
        if ('letterSpacing' in ctx) ctx.letterSpacing = s.spacing.replace('em', '') * px + 'px';
        ctx.fillStyle = s.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
      }
    } else {
      const st = getSticker(it.ref);
      if (st) {
        const img = await loadImage(st.src);
        const w = it.w * box;
        const h = (w * img.height) / img.width;
        if (it.kind === 'cubic') {
          // 큐빅 접지 그림자 (화면 CaseView와 같은 값). 캔버스 그림자는 회전과 상관없이 항상 아래로 떨어짐
          ctx.shadowColor = CUBIC_SHADOW.color;
          ctx.shadowBlur = box * CUBIC_SHADOW.blur;
          ctx.shadowOffsetY = box * CUBIC_SHADOW.y;
        }
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
    ctx.restore();
  }
  return canvas;
}

export async function downloadDesign(design, filename = 'moa-case.png') {
  const canvas = await renderDesign(design);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// 꾸민 케이스를 PNG 데이터 주소로 (P06 아이폰·아이패드: 크게 띄워 길게 눌러 "사진 앱에 저장")
export async function designToDataURL(design) {
  const canvas = await renderDesign(design);
  return canvas.toDataURL('image/png');
}

// 꾸민 케이스를 PNG 파일 객체로 만들기 (P06 아이폰·아이패드: 공유 창 → "이미지 저장"으로 사진첩에 저장)
export async function designToFile(design, filename = 'moa-case.png') {
  const canvas = await renderDesign(design);
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  );
  return new File([blob], filename, { type: 'image/png' });
}
