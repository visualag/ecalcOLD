"use client";
import React, { useState } from 'react';

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ro&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error("Orașul nu a fost găsit");
      const { latitude, longitude, name, admin1 } = geoData.results[0];

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto&forecast_days=14`);
      const weatherData = await weatherRes.json();
      setWeather({ ...weatherData, cityName: name, region: admin1 });
    } catch (err) {
      alert("Eroare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Starea Vremii</h1>
        <p className="text-gray-500 mb-6">Introdu numele orașului pentru prognoza pe 14 zile</p>
        
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
            placeholder="Ex: Bucuresti, Londra, New York..." 
            className="flex-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-lg"
          />
          <button 
            onClick={fetchWeather}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:bg-gray-400"
          >
            {loading ? 'Căutare...' : 'Vezi Prognoza'}
          </button>
        </div>
      </div>

      {weather && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold">{weather.cityName}</h2>
                <p className="opacity-80 text-lg">{weather.region}</p>
                <div className="flex items-center mt-6">
                  <span className="text-8xl font-black tracking-tighter">{Math.round(weather.current.temperature_2m)}°</span>
                  <div className="ml-6">
                    <p className="text-2xl font-medium">Se simte ca {Math.round(weather.current.apparent_temperature)}°</p>
                    <p className="opacity-80">Umiditate: {weather.current.relative_humidity_2m}%</p>
                  </div>
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-[200px] opacity-20 select-none">☀️</div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-500">💨 Vânt</span>
                <span className="font-bold text-lg">{weather.current.wind_speed_10m} km/h</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-500">☀️ Index UV</span>
                <span className="font-bold text-lg">{weather.daily.uv_index_max[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">🌧️ Precipitații</span>
                <span className="font-bold text-lg">{weather.daily.precipitation_sum[0]} mm</span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-6 px-2">Următoarele 14 zile</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {weather.daily.time.map((date, index) => (
              <div key={date} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center">
                <p className="text-xs font-bold text-blue-500 uppercase">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short' })}</p>
                <p className="text-sm text-gray-400 mb-3">{new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</p>
                <p className="text-2xl font-black text-gray-800">{Math.round(weather.daily.temperature_2m_max[index])}°</p>
                <p className="text-sm text-gray-400">{Math.round(weather.daily.temperature_2m_min[index])}°</p>
                <div className="mt-3 pt-3 border-t text-[10px] font-bold text-blue-400 italic">🌧️ {weather.daily.precipitation_sum[index]}mm</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
