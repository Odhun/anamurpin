import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '30%',
        }}
      >
        <div
          style={{
            width: 18,
            height: 22,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
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
              width: 6,
              height: 6,
              background: '#3b82f6',
              borderRadius: '50%',
              position: 'absolute',
              top: 6,
              left: 6,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
