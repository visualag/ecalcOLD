"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudSun, Wind, Droplets, Sun, Eye, Gauge, Umbrella, Thermometer } from 'lucide-react';

const getWeatherIcon = (code, temp, isNight = false) => {
  const pulseClass = temp > 30 ? "animate-pulse scale-110" : "";
  if (isNight) return <span className="text-6xl drop-shadow-lg">🌙</span>;
  if (code === 0) return <Sun className={`h-24 w-24 text-yellow-400 ${pulseClass} drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]`} />;
  if (code <= 3) return <CloudSun className="h-24 w-24 text-blue-200 opacity-80" />;
  if (code <= 67) return <Umbrella className="h-24 w-24 text-blue-400 animate-bounce" />;
  if (code <= 99) return <span className="text-7xl animate-pulse">⚡</span>;
  return <CloudSun className="h-24 w-24 text-slate-300" />;
};

export default function WeatherView({ weather, nearbyPlaces, ORASE_PRINCIPALE }) {
  const router = useRouter();
  const [cityInput, setCityInput] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSearch = () => {
    if (cityInput) router.push(`/vreme/${cityInput.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Identic cu cel vechi */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 mb-6">
        <input 
          type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Cauta alt oras..." className="flex-1 px-4 outline-none font-medium text-slate-700"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Cauta</button>
      </div>

      {/* Dashboard Principal - Grafica ta intacta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-5 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl group transition-all duration-700 bg-gradient-to-br ${
          weather.current.temperature_2m > 30 ? 'from-orange-500 to-red-600' : 
          weather.current.temperature_2m < 5 ? 'from-slate-700 to-slate-900' : 
          'from-blue-600 to-indigo-700'
        }`}>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-1">{weather.cityName}</h1>
            <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-8">{weather.region} {currentYear}</p>
            <div className="flex items-center gap-4">
              <span className="text-8xl font-black tracking-tighter">{Math.round(weather.current.temperature_2m)}°</span>
              <div>
                <p className="text-xl font-bold opacity-90">Simtit: {Math.round(weather.current.apparent_temperature)}°</p>
              </div>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-30 group-hover:opacity-50 transition-all duration-500 transform group-hover:rotate-12">
            {getWeatherIcon(weather.current.weather_code, weather.current.temperature_2m)}
          </div>
        </div>

        {/* Widget-urile tale (Vant, Umiditate, etc.) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { l: 'Vânt', v: `${weather.current.wind_speed_10m} km/h`, i: Wind, c: 'text-blue-500' },
            { l: 'Umiditate', v: `${weather.current.relative_humidity_2m}%`, i: Droplets, c: 'text-cyan-500' },
            { l: 'UV Max', v: weather.daily.uv_index_max[0], i: Sun, c: 'text-orange-500' },
            { l: 'Aer (AQI)', v: weather.hourly.pm10[0] > 50 ? 'Moderat' : 'Excelent', i: Gauge, c: 'text-emerald-500' },
            { l: 'Presiune', v: `${Math.round(weather.current.surface_pressure)}`, i: Gauge, c: 'text-slate-500' },
            { l: 'Vizibilitate', v: `${weather.current.visibility / 1000} km`, i: Eye, c: 'text-blue-400' },
            { l: 'Șanse Ploaie', v: `${weather.daily.precipitation_probability_max[0]}%`, i: Umbrella, c: 'text-indigo-500' },
            { l: 'Temp. Min', v: `${Math.round(weather.daily.temperature_2m_min[0])}°`, i: Thermometer, c: 'text-rose-400' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <item.i className={`h-7 w-7 ${item.c} mb-1`} />
              <span className="text-[10px] font-black text-slate-400 uppercase leading-tight">{item.l}</span>
              <span className="text-base font-black text-slate-900 leading-tight">{item.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolutie pe Ore - Intacta */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Următoarele 24h</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {weather.hourly.time.slice(0, 24).map((time, index) => {
            const hour = new Date(time).getHours();
            return (
              <div key={time} className="flex-shrink-0 w-16 text-center">
                <p className="text-[10px] font-bold text-slate-400 mb-2">{hour}:00</p>
                <div className="bg-slate-50 rounded-2xl py-3 border border-slate-100 group hover:bg-blue-600 transition-all">
                  <span className="text-sm font-black text-slate-800 group-hover:text-white">
                    {Math.round(weather.hourly.temperature_2m[index])}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orase Principale & Fabrica de Linkuri (Google le vede acum) */}
      <div className="mt-12">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Localități Principale</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ORASE_PRINCIPALE.map(oras => (
            <a key={oras} href={`/vreme/${oras.toLowerCase().replace(/\s+/g, '-')}`} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:text-blue-600 shadow-sm">
              {oras}
            </a>
          ))}
        </div>
      </div>

      {nearbyPlaces.length > 0 && (
        <div className="mt-12 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center shadow-inner">
          <h3 className="text-xs font-black text-blue-400 uppercase mb-6 tracking-widest">Localități în apropiere de {weather.cityName}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {nearbyPlaces.map((place) => (
              <a key={place.id} href={`/vreme/${place.name.toLowerCase().replace(/\s+/g, '-')}`} className="px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 shadow-sm transition-all">
                Vremea in {place.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
