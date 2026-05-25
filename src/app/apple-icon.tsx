import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#3b82f6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 100,
            height: 120,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
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
              width: 34,
              height: 34,
              background: '#3b82f6',
              borderRadius: '50%',
              position: 'absolute',
              top: 33,
              left: 33,
            }}
          />
          <div
            style={{
              width: 10,
              height: 30,
              background: 'white',
              borderRadius: 4,
              position: 'absolute',
              bottom: 0,
              left: 45,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
