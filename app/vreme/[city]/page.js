"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer'; 
import { CloudSun, Wind, Droplets, Sun, Eye, Gauge, Umbrella, Thermometer } from 'lucide-react';

const ORASE_PRINCIPALE = [
  'Alba Iulia', 'Alexandria', 'Arad', 'Bacau', 'Baia Mare', 'Bistrita', 'Botosani', 'Braila', 'Brasov', 'Bucuresti',
  'Buzau', 'Calarasi', 'Cluj-Napoca', 'Constanta', 'Craiova', 'Deva', 'Drobeta-Turnu Severin', 'Focsani', 'Galati', 'Giurgiu',
  'Iasi', 'Miercurea Ciuc', 'Oradea', 'Piatra Neamt', 'Pitesti', 'Ploiesti', 'Ramnicu Valcea', 'Resita', 'Satu Mare', 'Sfantu Gheorghe',
  'Sibiu', 'Slatina', 'Slobozia', 'Suceava', 'Targoviste', 'Targu Jiu', 'Targu Mures', 'Timisoara', 'Tulcea', 'Vaslui', 'Zalau'
].sort();

// FUNCTIA DE ICONITE DINAMICE SI ANIMATII
const getWeatherIcon = (code, temp, isNight = false) => {
  const pulseClass = temp > 30 ? "animate-pulse scale-110" : "";
  if (isNight) return <span className="text-6xl drop-shadow-lg">🌙</span>;
  if (code === 0) return <Sun className={`h-24 w-24 text-yellow-400 ${pulseClass} drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]`} />;
  if (code <= 3) return <CloudSun className="h-24 w-24 text-blue-200 opacity-80" />;
  if (code <= 67) return <Umbrella className="h-24 w-24 text-blue-400 animate-bounce" />;
  if (code <= 99) return <span className="text-7xl animate-pulse">⚡</span>;
  return <CloudSun className="h-24 w-24 text-slate-300" />;
};

export default function WeatherCityPage() {
  const params = useParams();
  const router = useRouter();
  const [cityInput, setCityInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const fetchWeather = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=ro&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error("Orasul nu a fost gasit");
      
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      // --- START FABRICA DE LINKURI ---
try {
  const nearbyRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${admin1}&count=20&language=ro&format=json`);
  const nearbyData = await nearbyRes.json();
  if (nearbyData.results) {
    setNearbyPlaces(nearbyData.results.filter(p => p.name.toLowerCase() !== name.toLowerCase()));
  }
} catch (e) {
  console.error("Eroare la fabrica de link-uri");
}
// --- END FABRICA DE LINKURI ---
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility&hourly=temperature_2m,pm10&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=14`);
      const weatherData = await weatherRes.json();
      
      setWeather({ ...weatherData, cityName: name, region: admin1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cityFromUrl = params?.city || 'Bucuresti';
    fetchWeather(cityFromUrl);
  }, [params?.city]);

  const handleSearch = () => {
    if (cityInput) router.push(`/vreme/${cityInput.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <NavigationHeader />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Search */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 mb-6">
          <input 
            type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cauta alt oras..." className="flex-1 px-4 outline-none font-medium text-slate-700"
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Cauta</button>
        </div>

        {weather && (
          <div className="space-y-6">
            {/* 1. Dashboard Principal cu CULORI DINAMICE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-5 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl group transition-all duration-700 bg-gradient-to-br ${
                weather.current.temperature_2m > 30 ? 'from-orange-500 to-red-600' : 
                weather.current.temperature_2m < 5 ? 'from-slate-700 to-slate-900' : 
                'from-blue-600 to-indigo-700'
              }`}>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black mb-1">{weather.cityName}</h1>
                  <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-8">{weather.region}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-8xl font-black tracking-tighter">{Math.round(weather.current.temperature_2m)}°</span>
                    <div>
                      <p className="text-xl font-bold opacity-90">Simtit: {Math.round(weather.current.apparent_temperature)}°</p>
                      <p className="text-sm font-medium opacity-70">Azi, {new Date().toLocaleDateString('ro-RO', {day: 'numeric', month: 'short'})}</p>
                    </div>
                  </div>
                </div>
                {/* Iconița dinamică fundal */}
                <div className="absolute right-[-10px] bottom-[-10px] opacity-30 group-hover:opacity-50 transition-all duration-500 transform group-hover:rotate-12">
                  {getWeatherIcon(weather.current.weather_code, weather.current.temperature_2m)}
                </div>
              </div>

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
                  <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:bg-blue-50/50 transition-colors group">
                    <item.i className={`h-7 w-7 ${item.c} mb-1 group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">{item.l}</span>
                    <span className="text-base font-black text-slate-900 leading-tight">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Vremea pe Ore cu LOGICA NOAPTE/ZI */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Evoluție termică (Următoarele 24h)</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {weather.hourly.time.slice(0, 24).map((time, index) => {
                  const hour = new Date(time).getHours();
                  const isNight = hour >= 21 || hour <= 6;
                  return (
                    <div key={time} className="flex-shrink-0 w-16 text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-2">{hour}:00</p>
                      <div className="bg-slate-50 rounded-2xl py-3 border border-slate-100 group hover:bg-blue-600 transition-all">
                        <div className="mb-2 flex justify-center">
                          {isNight ? <span className="text-xl">🌙</span> : <Sun className="h-5 w-5 text-yellow-500 group-hover:text-white" />}
                        </div>
                        <span className="text-sm font-black text-slate-800 group-hover:text-white">
                          {Math.round(weather.hourly.temperature_2m[index])}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Evolutie 14 zile - Design Pro Compact */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 mb-6 px-2 border-l-4 border-blue-600 ml-2">Prognoză Detaliată 14 zile</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {weather.daily.time.map((date, index) => (
                  <div key={date} className="bg-slate-50 p-4 rounded-3xl border border-transparent hover:border-blue-200 hover:bg-white transition-all text-center group">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short' })}</p>
                    <p className="text-[10px] text-slate-400 font-bold mb-3">{new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</p>
                    <div className="flex justify-center mb-3 text-blue-500">
                      <CloudSun className="h-10 w-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{Math.round(weather.daily.temperature_2m_max[index])}°</div>
                    <div className="text-xs font-bold text-slate-300 mb-3">{Math.round(weather.daily.temperature_2m_min[index])}°</div>
                    <div className="space-y-1 bg-white p-2 rounded-xl border border-blue-50">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-500">
                        <Umbrella className="h-3 w-3" />
                        <span>{weather.daily.precipitation_probability_max[index]}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${weather.daily.precipitation_probability_max[index]}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEO - Orașe */}
        <div className="mt-12">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Meteo în localitățile principale</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ORASE_PRINCIPALE.map(oras => (
              <a 
                key={oras} href={`/vreme/${oras.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => { e.preventDefault(); router.push(`/vreme/${oras.toLowerCase().replace(/\s+/g, '-')}`); }}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-500 rounded-lg text-[11px] font-bold transition-all shadow-sm"
              >
                {oras}
              </a>
            ))}
          </div>
        </div>
{/* FABRICA DE LINK-URI DINAMICE - GOOGLE MAGNET */}
        {nearbyPlaces.length > 0 && (
          <div className="mt-12 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 shadow-inner text-center">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">
              Vremea în alte localități din {weather?.region || 'zonă'}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {nearbyPlaces.map((place) => (
                <a 
                  key={place.id} 
                  href={`/vreme/${place.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 bg-white border border-blue-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  Vremea in {place.name}
                </a>
              ))}
            </div>
          </div>
        )}
        {/* --- SFARSIT FABRICA --- */}

          </div> // Inchide space-y-6
        )} {/* Inchide weather && */}
        
      </main>

      <Footer />
    </div>
  );
}
