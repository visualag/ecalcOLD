"use client";
import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer'; 
import { CloudSun, Wind, Droplets, Sun, Eye, Gauge, Umbrella, thermometerSun } from 'lucide-react';

const currentYear = new Date().getFullYear();

const ORASE_PRINCIPALE = [
  'Alba Iulia', 'Alexandria', 'Arad', 'Bacau', 'Baia Mare', 'Bistrita', 'Botosani', 'Braila', 'Brasov', 'Bucuresti',
  'Buzau', 'Calarasi', 'Cluj-Napoca', 'Constanta', 'Craiova', 'Deva', 'Drobeta-Turnu Severin', 'Focsani', 'Galati', 'Giurgiu',
  'Iasi', 'Miercurea Ciuc', 'Oradea', 'Piatra Neamt', 'Pitesti', 'Ploiesti', 'Ramnicu Valcea', 'Resita', 'Satu Mare', 'Sfantu Gheorghe',
  'Sibiu', 'Slatina', 'Slobozia', 'Suceava', 'Targoviste', 'Targu Jiu', 'Targu Mures', 'Timisoara', 'Tulcea', 'Vaslui', 'Zalau'
].sort();

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityName) => {
    const targetCity = cityName || city;
    if (!targetCity) return;
    setLoading(true);
    try {
      const slug = targetCity.toLowerCase().replace(/\s+/g, '-');
      window.history.pushState({}, '', `/vreme/${slug}`);
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${targetCity}&count=1&language=ro&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error("Orasul nu a fost gasit");
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=14`);
      const weatherData = await weatherRes.json();
      setWeather({ ...weatherData, cityName: name, region: admin1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <NavigationHeader />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Search bar minimalist */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2">
            <input 
              type="text" value={city} onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
              placeholder="Cauta oras..." 
              className="flex-1 p-3 bg-transparent outline-none font-medium text-slate-700"
            />
            <button onClick={() => fetchWeather()} disabled={loading} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
              {loading ? '...' : 'Vezi Vremea'}
            </button>
          </div>

          {weather && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {/* Header Info & Current Details */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 flex justify-between items-center shadow-sm">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{weather.cityName}</h1>
                    <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">{weather.region}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-7xl font-black text-slate-900">{Math.round(weather.current.temperature_2m)}°</span>
                       <span className="text-slate-400 font-bold text-xl">/ {Math.round(weather.current.apparent_temperature)}°</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <CloudSun className="h-24 w-24 text-blue-500 mb-2" />
                    <p className="text-xs font-black text-slate-400 uppercase">Cod: {weather.current.weather_code}</p>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                  {[
                    { l: 'Vant', v: `${weather.current.wind_speed_10m} km/h`, i: Wind, c: 'text-blue-500' },
                    { l: 'Umiditate', v: `${weather.current.relative_humidity_2m}%`, i: Droplets, c: 'text-cyan-500' },
                    { l: 'UV Max', v: weather.daily.uv_index_max[0], i: Sun, c: 'text-orange-500' },
                    { l: 'Presiune', v: `${Math.round(weather.current.surface_pressure)}`, i: Gauge, c: 'text-purple-500' },
                    { l: 'Vizibilitate', v: `${weather.current.visibility / 1000}km`, i: Eye, c: 'text-emerald-500' },
                    { l: 'Prob. Plic.', v: `${weather.daily.precipitation_probability_max[0]}%`, i: Umbrella, c: 'text-indigo-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                      <item.i className={`h-5 w-5 ${item.c} mb-1`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.l}</span>
                      <span className="text-sm font-black text-slate-800">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGNOZA PE 14 ZILE - 2 RANDURI X 7 ZILE */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
                  <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                  Evolutie 14 zile
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {weather.daily.time.map((date, index) => (
                    <div key={date} className="group bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-400 transition-all">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'long' })}</p>
                      <p className="text-[11px] text-slate-400 font-bold mb-3 border-b border-slate-50 pb-2">{new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</p>
                      
                      <div className="flex flex-col items-center gap-1 mb-3">
                        <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                        <span className="text-xs font-bold text-slate-300 italic">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><Umbrella className="h-3 w-3 text-blue-300" />{weather.daily.precipitation_probability_max[index]}%</span>
                          <span className="text-blue-400">{weather.daily.precipitation_sum[index]}mm</span>
                        </div>
                        <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full transition-all" style={{ width: `${weather.daily.precipitation_probability_max[index]}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEO Cluster cu link-uri reale */}
          <div className="pt-10">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Reteaua Nationala Meteo eCalc</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {ORASE_PRINCIPALE.map(oras => (
                <a 
                  key={oras} href={`/vreme/${oras.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={(e) => { e.preventDefault(); setCity(oras); fetchWeather(oras); }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-500 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {oras}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
