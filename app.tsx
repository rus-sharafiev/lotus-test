import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

interface Participant {
    id: number;
    turn: string;
    name: string;
    bids: string[][];
}
interface Trade {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    requirements: string[]
    participants: Participant[]
}

const iconsLoaded = (event: any) => {
    event.fontfaces.map( (font: any) => {
        if (font.family == 'Material Symbols Rounded') {
            document.getElementById("root")?.classList.remove('icons-hidden');
        }
    })
}
document.fonts.addEventListener("loadingdone", iconsLoaded);

var decCache: number[] = [], decCases = [2, 0, 1, 1, 1, 2];
const declination = (number: number, titles: string[]) => {
    if (!decCache[number]) decCache[number] = number % 100 > 4 && number % 100 < 20 ? 2 : decCases[Math.min(number % 10, 5)];
    return titles[decCache[number]];
}

const startDate = (stringDate: string): string => {
    let date = new Date(stringDate);
    return date.toLocaleString('ru-RU');
}

const timeLeftFn = (endDate: string): string => {
    let end = new Date(endDate).valueOf();
    let today = Date.now();
    let diff = end - today;

    let days = Math.floor(diff / (24*60*60*1000));
    let daysms = diff % (24*60*60*1000);
    let hours = Math.floor(daysms / (60*60*1000));
    let hoursms = diff % (60*60*1000);
    let minutes = Math.floor(hoursms / (60*1000));
    let minutesms = diff % (60*1000);
    let sec = Math.floor(minutesms / 1000);
    let addZero = (num: number) => { return num < 10 ? '0' + num : num }
    let daysLeft = days > 0 ? days + declination(days, [' день ', ' дня ', ' дней ']) : '';

    if (days >= 0 && hours >= 0 && minutes >= 0 && sec >= 0) {
        return daysLeft + addZero(hours) + ':' + addZero(minutes) + ':' + addZero(sec);
    } else {
        return ''
    }
}

const TradeCard = (props: {trade: Trade, setTrade: (trade: Trade) => void }) => {

    return (                            
        <div className='card'>
            <div className='headline'>{props.trade.name}</div>
            <div className='start-date'>{startDate(props.trade.startDate)}</div>
            <div className='end-date'>{timeLeftFn(props.trade.endDate)}</div>
            <div className='participants'>
                <span>Участники торгов</span>
                {props.trade.participants.length != 0
                    ?   props.trade.participants.map((participant: Participant) =>
                            <div className='participant' key={participant.id}>{participant.name}</div>
                        )
                    :   'Нет участников'
                }
            </div>
            <button type='button' className='show-trades' onClick={() => props.setTrade(props.trade)}>Ход торгов</button> 
        </div>
    )
}

const Trade = (props: { trade: Trade | undefined, setTrade: (trade: undefined) => void }) => {

    if (props.trade) {
        return (
            <div className='trade-scrim'>
                <div className='trade-info'>
                    <div className='headline'><span>Ход торгов </span>{props.trade.name + ' (' + startDate(props.trade.startDate) + ')'}</div>
                    <div className='info'>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанных в таблице:</div>
                    <table>
                        <tbody>
                        <tr>
                            <td>ХОД</td>                        
                            {props.trade.participants.length != 0
                            ?   props.trade.participants.map((participant: Participant) =>
                                    <td className='turn' key={participant.id + 'turn'}>
                                        {timeLeftFn(participant.turn) && <div className='timer'>
                                            <div>{timeLeftFn(participant.turn)}</div>
                                            <span className='material-symbols-rounded'>hourglass_top</span></div>}
                                    </td>
                                )
                            :   null}
                        </tr>
                        <tr>
                            <td>ПАРАМЕТРЫ И ТРЕБОВАНИЯ</td>                     
                            {props.trade.participants.length != 0
                            ?   props.trade.participants.map((participant: Participant, index: number) =>
                                    <td key={participant.id + 'participant'}>
                                        <div className='participant'>
                                            <span>Участник №{index + 1}</span>{participant.name}
                                        </div>
                                    </td>
                                )
                            :   null}
                        </tr>
                        {props.trade.requirements.length != 0
                            ?   props.trade.requirements.map((requirement: string, index: number) =>
                                    <tr className='requirements' key={'requirement' + index}>
                                        <td>{requirement}</td>
                                        {props.trade && props.trade.participants.length != 0
                                            ?   props.trade && props.trade.participants.map((participant: Participant) =>
                                                    <td key={participant.id + participant.bids[index][0]}>
                                                        {participant.bids[index].map((bid: string, bidIndex: number) => 
                                                            <div className='bid' key={participant.id + participant.bids[index][0] + bidIndex} >{bid}</div>
                                                        )}
                                                    </td>
                                                )
                                            :   null}
                                    </tr>
                                )
                            :   null}
                        </tbody>
                    </table>
                    <button type='button' className='close-trade' onClick={() => props.setTrade(undefined)}><span className='material-symbols-rounded'>close</span>Закрыть</button>
                </div>
            </div>
        )
    } else {
        return (null)
    }
}

const App = () => {
    const [trades, setTrades] = useState([]);
    const [update, setUpdate] = useState(0);
    const [activeTrade, setActiveTrade] = useState<Trade | undefined>();

    let IntervalId: any;
    if (!IntervalId) {
        IntervalId = setInterval(() => setUpdate(Math.random()), 1000);
    }

    useEffect(() => {
        fetch('/api/')
            .then((response) => response.json())
            .then((array) => setTrades(array));
    }, [])

    return ( 
        <>
            <main>
                {trades.length != 0 
                    ?   trades.map((trade: Trade) =>
                            <TradeCard trade={trade} key={trade.id} setTrade={setActiveTrade}/>
                        )
                    :   'Нет активных торгов'}
            </main>
            <header>
                Header
                <img src='/img/LOGO_LOTUS.svg' alt='logo' />
            </header>
            <footer>Footer</footer>
            <Trade trade={activeTrade} setTrade={setActiveTrade}/>
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<BrowserRouter><App /></BrowserRouter>);