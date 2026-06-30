import './forecast.css';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' });
const hourFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const DEGREE = '\u00B0';

const groupDailyForecast = (items) => {
    const grouped = items.reduce((days, item) => {
        const dateKey = item.dt_txt.split(' ')[0];
        const day = days[dateKey] || {
            date: new Date(item.dt * 1000),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            max: item.main.temp_max,
            min: item.main.temp_min,
            rain: 0,
            wind: item.wind.speed,
        };

        day.max = Math.max(day.max, item.main.temp_max);
        day.min = Math.min(day.min, item.main.temp_min);
        day.rain = Math.max(day.rain, item.pop || 0);
        day.wind = Math.max(day.wind, item.wind.speed);

        if (item.dt_txt.includes('12:00:00')) {
            day.description = item.weather[0].description;
            day.icon = item.weather[0].icon;
        }

        return { ...days, [dateKey]: day };
    }, {});

    return Object.values(grouped).slice(0, 5);
};

const Forecast = ({ data }) => {
    const hourlyForecast = data.list.slice(0, 8);
    const dailyForecast = groupDailyForecast(data.list);

    return (
        <section className="forecast-panel">
            <div className="forecast-heading">
                <div>
                    <p className="overline">Tendance meteo</p>
                    <h2>Prochaines heures</h2>
                </div>
                <span className="forecast-note">Pas de 3h</span>
            </div>

            <div className="hourly-strip" aria-label="Previsions heure par heure">
                {hourlyForecast.map((item) => (
                    <article className="hour-tile" key={item.dt}>
                        <time>{hourFormatter.format(new Date(item.dt * 1000))}</time>
                        <img src={`icons/${item.weather[0].icon}.png`} alt={item.weather[0].description} />
                        <strong>{Math.round(item.main.temp)}{DEGREE}C</strong>
                        <span>{Math.round((item.pop || 0) * 100)}% pluie</span>
                    </article>
                ))}
            </div>

            <div className="forecast-heading compact">
                <div>
                    <p className="overline">Trajectoire</p>
                    <h2>5 jours</h2>
                </div>
            </div>

            <div className="daily-stack" aria-label="Previsions sur cinq jours">
                {dailyForecast.map((day) => (
                    <article className="daily-row" key={day.date.toISOString()}>
                        <div className="day-name">
                            <img src={`icons/${day.icon}.png`} alt={day.description} />
                            <div>
                                <time>{dayFormatter.format(day.date)}</time>
                                <span>{day.description}</span>
                            </div>
                        </div>

                        <div className="day-stats">
                            <span><small>Min</small>{Math.round(day.min)}{DEGREE}</span>
                            <strong><small>Max</small>{Math.round(day.max)}{DEGREE}</strong>
                            <span><small>Pluie</small>{Math.round(day.rain * 100)}%</span>
                            <span><small>Vent</small>{Math.round(day.wind * 3.6)} km/h</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default Forecast;
