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
      // Pasul 1: Geocoding pentru a afla lat/long din numele orașului
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ro&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Orașul nu a fost găsit");
      const { latitude, longitude, name, admin1 } = geoData.results[0];

      // Pasul 2: Luăm datele meteo detaliate
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto&forecast_days=14`);
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData, cityName: name, region: admin1 });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Prognoză Meteo Detaliată</h1>
      
      <div className="flex gap-2 mb-10">
        <input 
          type="text" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          placeholder="Introdu orașul (ex: Craiova)" 
          className="flex-1 p-3 border rounded-lg focus:outline-blue-500"
        />
        <button 
          onClick={fetchWeather}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Se încarcă...' : 'Caută'}
        </button>
      </div>

      {weather && (
        <div>
          <div className="bg-blue-50 p-6 rounded-xl mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{weather.cityName}</h2>
              <p className="text-gray-600">{weather.region}</p>
              <p className="text-5xl font-black mt-4">{Math.round(weather.current.temperature_2m)}°C</p>
              <p className="text-gray-500">Se simte ca: {Math.round(weather.current.apparent_temperature)}°C</p>
            </div>
            <div className="text-right space-y-2">
              <p>💨 Vânt: <strong>{weather.current.wind_speed_10m} km/h</strong></p>
              <p>💧 Umiditate: <strong>{weather.current.relative_humidity_2m}%</strong></p>
              <p>☀️ UV Max: <strong>{weather.daily.uv_index_max[0]}</strong></p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">Prognoză pe 14 zile</h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {weather.daily.time.map((date, index) => (
              <div key={date} className="border p-3 rounded-lg text-center hover:bg-gray-50 transition">
                <p className="text-xs font-bold text-gray-500">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short' })}</p>
                <p className="text-sm font-bold">{new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</p>
                <div className="my-2 text-lg font-bold text-blue-600">{Math.round(weather.daily.temperature_2m_max[index])}°</div>
                <div className="text-sm text-gray-400">{Math.round(weather.daily.temperature_2m_min[index])}°</div>
                <p className="text-[10px] mt-2 text-blue-400">🌧️ {weather.daily.precipitation_sum[index]}mm</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
