import React from "react";
import './current-weather.css';

const formatTime = (timestamp, timezone) => {
    if (!timestamp) {
        return '--:--';
    }

    return new Date((timestamp + timezone) * 1000).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });
};

const round = (value) => Math.round(value);

const CurrentWeather = ({ data }) => {
    const weather = data.weather[0];
    const timezone = data.timezone || 0;
    const localTime = formatTime(data.dt, timezone);

    const metrics = [
        { label: 'Ressenti', value: `${round(data.main.feels_like)}\u00B0C` },
        { label: 'Vent', value: `${Math.round(data.wind.speed * 3.6)} km/h` },
        { label: 'Humidite', value: `${data.main.humidity}%` },
        { label: 'Pression', value: `${data.main.pressure} hPa` },
        { label: 'Nuages', value: `${data.clouds?.all ?? 0}%` },
        { label: 'Visibilite', value: `${Math.round((data.visibility || 0) / 1000)} km` },
    ];

    return (
        <section className='weather-stage'>
            <div className="weather-visual">
                <div className="sky-ring" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <img src={`icons/${weather.icon}.png`} alt={weather.description} className='weather-icon' />
                <p className='weather-description'>{weather.description}</p>
                <h2>{data.city}</h2>
                <p className="local-time">Heure locale {localTime}</p>
                <p className="temperature">{round(data.main.temp)}<span>{'\u00B0C'}</span></p>
            </div>

            <div className="weather-details">
                <div className="sun-row">
                    <div>
                        <span>Lever</span>
                        <strong>{formatTime(data.sys?.sunrise, timezone)}</strong>
                    </div>
                    <div>
                        <span>Coucher</span>
                        <strong>{formatTime(data.sys?.sunset, timezone)}</strong>
                    </div>
                </div>

                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <div className="metric-card" key={metric.label}>
                            <span>{metric.label}</span>
                            <strong>{metric.value}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CurrentWeather;
