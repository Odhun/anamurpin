import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: { size: string } },
) {
  const sz = Math.min(Math.max(parseInt(params.size, 10) || 192, 16), 512);
  const pin = Math.round(sz * 0.55);
  const dot = Math.round(pin * 0.34);
  const dotOffset = Math.round((pin - dot) / 2);
  const stem = Math.round(sz * 0.13);
  const stemLeft = Math.round((sz - Math.round(sz * 0.055)) / 2);
  const radius = Math.round(sz * 0.18);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#3b82f6',
          width: sz,
          height: sz,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: pin,
            height: pin + stem,
            position: 'relative',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: pin,
              height: pin,
              background: 'white',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <div
            style={{
              width: dot,
              height: dot,
              background: '#3b82f6',
              borderRadius: '50%',
              position: 'absolute',
              top: dotOffset,
              left: dotOffset,
            }}
          />
          <div
            style={{
              width: Math.round(sz * 0.055),
              height: stem,
              background: 'white',
              borderRadius: Math.round(sz * 0.03),
              position: 'absolute',
              bottom: 0,
              left: stemLeft - Math.round(pin * 0.5) + Math.round(Math.round(sz * 0.055) / 2),
            }}
          />
        </div>
      </div>
    ),
    { width: sz, height: sz },
  );
}
