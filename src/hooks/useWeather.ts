'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { isFrostAlert } from '@/lib/reliability';

// Coordinates: center of Anamur-Bozyazı-Aydıncık region
const LAT = 36.0857;
const LON = 33.0669;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m&timezone=Europe%2FIstanbul&forecast_days=1`;

const WEATHER_CACHE_KEY = 'anamurpin_weather';
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 min

export function useWeather() {
  const { temperature, setTemperature } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Check cache
      try {
        const raw = sessionStorage.getItem(WEATHER_CACHE_KEY);
        if (raw) {
          const { temp, ts } = JSON.parse(raw);
          if (Date.now() - ts < WEATHER_CACHE_TTL) {
            setTemperature(temp);
            return;
          }
        }
      } catch {}

      try {
        const res = await fetch(WEATHER_URL);
        if (!res.ok) return;
        const json = await res.json();
        const temp: number = json?.current?.temperature_2m ?? null;
        if (cancelled || temp === null) return;

        setTemperature(temp);
        sessionStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({ temp, ts: Date.now() }),
        );
      } catch {}
    }

    load();
    return () => { cancelled = true; };
  }, [setTemperature]);

  return {
    temperature,
    isFrost: temperature !== null && isFrostAlert(temperature),
  };
}
