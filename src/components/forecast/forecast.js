import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemPanel, AccordionItemButton } from 'react-accessible-accordion';
import './forecast.css';

const WEEK_DAYS = ['lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Forecast = ({ data }) => {

    const dayInAWeek = new Date().getDay();
    const forecastDays = WEEK_DAYS.slice(dayInAWeek, WEEK_DAYS.length).concat(WEEK_DAYS.slice(0, dayInAWeek));

    return (
        <>
            <label className='title'>Jours</label>
            <Accordion allowZeroExpanded>
                {data.list.splice(0, 7).map((item, idx) => (
                     <AccordionItem key={idx}>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            <div className="daily-item">
                                <img src={`icons/${item.weather[0].icon}.png`} alt="weather" className='icon-small' />
                                <label className='day'>{forecastDays[idx]}</label>
                                <label className='description'>{item.weather[0].description}</label>
                                <label className='min-max'>{Math.trunc(item.main.temp_min)}°C / {Math.trunc(item.main.temp_max)}°C</label>
                            </div>
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <div className="daily-details-grid">
                            <div className="daily-details-grid-item">
                                <label>Pression : </label>
                                <label>{item.main.pressure} hPa</label>
                            </div>
                            <div className="daily-details-grid-item">
                                <label>Humiditée : </label>
                                <label>{item.main.humidity}</label>
                            </div>
                            <div className="daily-details-grid-item">
                                <label>Nuageux : </label>
                                <label>{item.clouds.all} %</label>
                            </div>
                            <div className="daily-details-grid-item">
                                <label>vitesse vent : </label>
                                <label>{item.wind.speed} m/s</label>
                            </div>
                            <div className="daily-details-grid-item">
                                <label>Niveau de la mer : </label>
                                <label>{item.main.sea_level} m</label>
                            </div>
                            <div className="daily-details-grid-item">
                                <label>Ressentie : </label>
                                <label>{item.main.feels_like} °C</label>
                            </div>
                        </div>
                    </AccordionItemPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    );
}

export default Forecast;