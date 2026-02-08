"use client";
import React, { useState, useEffect } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer'; 
import { CloudSun, Wind, Droplets, Sun } from 'lucide-react';

const ORASE_PRINCIPALE = [
  'Bucuresti', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta', 
  'Craiova', 'Brasov', 'Galati', 'Ploiesti', 'Oradea', 'Braila', 'Arad'
];

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityName) => {
    const targetCity = cityName || city;
    if (!targetCity) return;
    
    setLoading(true);
    try {
      // Schimbam URL-ul pentru SEO: ecalc.ro/vreme/craiova
      const slug = targetCity.toLowerCase().replace(/\s+/g, '-');
      window.history.pushState({}, '', `/vreme/${slug}`);
      
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${targetCity}&count=1&language=ro&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error("Orasul nu a fost gasit");
      
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto&forecast_days=14`);
      const weatherData = await weatherRes.json();
      
      setWeather({ ...weatherData, cityName: name, region: admin1 });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavigationHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Meteo {currentYear}</h1>
            <p className="text-slate-500 mb-8">Prognoza detaliata si starea vremii in timp real.</p>
            
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
                placeholder="Introdu orasul (ex: Craiova)" 
                className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all text-lg text-slate-900"
              />
              <button 
                onClick={() => fetchWeather()} 
                disabled={loading} 
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
              >
                {loading ? 'Se incarca...' : 'Vezi Vremea'}
              </button>
            </div>
          </div>

          {weather && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* Card Principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold">{weather.cityName}</h2>
                    <p className="opacity-80 uppercase tracking-widest text-sm font-bold">{weather.region}</p>
                    <div className="flex items-center mt-8">
                      <span className="text-8xl font-black tracking-tighter">{Math.round(weather.current.temperature_2m)}°</span>
                      <div className="ml-8">
                        <p className="text-2xl font-medium">Se simte ca {Math.round(weather.current.apparent_temperature)}°</p>
                        <p className="opacity-80">Cod meteo: {weather.current.weather_code}</p>
                      </div>
                    </div>
                  </div>
                  <CloudSun className="absolute right-[-20px] bottom-[-20px] h-64 w-64 opacity-10" />
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-around">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div className="flex items-center text-slate-500"><Wind className="h-5 w-5 mr-2" /> Vant</div>
                    <span className="font-bold text-slate-900">{weather.current.wind_speed_10m} km/h</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div className="flex items-center text-slate-500"><Droplets className="h-5 w-5 mr-2" /> Umiditate</div>
                    <span className="font-bold text-slate-900">{weather.current.relative_humidity_2m}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-500"><Sun className="h-5 w-5 mr-2" /> Index UV</div>
                    <span className="font-bold text-slate-900">{weather.daily.uv_index_max[0]}</span>
                  </div>
                </div>
              </div>

              {/* Tabel 14 Zile */}
              <h3 className="text-2xl font-bold text-slate-800 px-2">Prognoza pe 14 zile</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {weather.daily.time.map((date, index) => (
                  <div key={date} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short' })}</p>
                    <p className="text-sm text-slate-400 mb-4">{new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-3xl font-black text-slate-800">{Math.round(weather.daily.temperature_2m_max[index])}°</p>
                    <p className="text-sm text-slate-400">{Math.round(weather.daily.temperature_2m_min[index])}°</p>
                    <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] font-bold text-blue-400">🌧️ {weather.daily.precipitation_sum[index]}mm</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sectiune SEO */}
          <div className="mt-16 border-t border-slate-200 pt-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Vremea in orasele populare</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {ORASE_PRINCIPALE.map(oras => (
                <button 
                  key={oras} 
                  onClick={() => { setCity(oras); fetchWeather(oras); }}
                  className="px-6 py-3 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Vremea in {oras}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
