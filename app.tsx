import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

interface Participant {
    id: number;
    activeTurn: number;
    turnEnds: string;
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

const timeLeft = ( end: string ) => {

    let endTime = new Date(end).valueOf();
    let mskTime = new Date().toLocaleString(undefined, {timeZone: "Europe/Moscow"});
    let today = new Date(mskTime).valueOf();
    let diff = endTime - today - 3000;

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
        return daysLeft + addZero(hours) + ':' + addZero(minutes) + ':' + addZero(sec)
    } else {
        return 'Окончен'
    }
}

const TradeCard = (props: {trade: Trade, setTradeId: (tradeId: number) => void }) => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let timer = setInterval(() => setTick(Math.random()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (                            
        <div className='card'>
            <div className='headline'>{props.trade.name}</div>
            <div className='start-date'>{startDate(props.trade.startDate)}</div>
            <div className='end-date'>{ timeLeft(props.trade.endDate) }</div>
            <div className='participants'>
                <span>Участники торгов</span>
                {props.trade.participants.length != 0
                    ?   props.trade.participants.map((participant: Participant) =>
                            <div className='participant' key={participant.id}>{participant.name}</div>
                        )
                    :   'Нет участников'
                }
            </div>
            <button type='button' className='show-trades' onClick={() => props.setTradeId(props.trade.id) }>Ход торгов</button> 
        </div>
    )
}

const Trade = (props: { tradeId: number | undefined, setTradeId: (trade: undefined) => void }) => {
    const [trade, setTrade] = useState<Trade | undefined>();
    const [update, setUpdate] = useState(0);

    useEffect(() => {
        let timer = setInterval(() => setUpdate(Math.random()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (props.tradeId) {
            fetch('/api/?id=' + props.tradeId)
                .then((response) => response.json())
                .then((array) => setTrade(array[0]))
        }
    }, [update]);

    const nextTurn = () => {
        fetch('/api/next_turn/')
        .then((response) => response.json())
        .then((status) => console.log(status.status))
    }

    if (trade) {
        return (
            <div className='trade-scrim'>
                <div className='trade-info'>
                    <div className='headline'><span>Ход торгов </span>{trade.name + ' (' + startDate(trade.startDate) + ')'}</div>
                    <div className='info'>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанных в таблице:</div>
                    <table>
                        <tbody>
                        <tr>
                            <td>ХОД</td>                        
                            {trade.participants.length != 0
                            ?   trade.participants.map((participant: Participant) =>
                                    <td className='turn' key={participant.id + 'turn'}>
                                        {participant.activeTurn === 1 && <div className='timer'>
                                            <div>{ timeLeft(participant.turnEnds) }</div>
                                            <span className='material-symbols-rounded'>hourglass_top</span></div>}
                                    </td>
                                )
                            :   null}
                        </tr>
                        <tr>
                            <td>ПАРАМЕТРЫ И ТРЕБОВАНИЯ</td>                     
                            {trade.participants.length != 0
                            ?   trade.participants.map((participant: Participant, index: number) =>
                                    <td key={participant.id + 'participant'}>
                                        <div className='participant'>
                                            <span>Участник №{index + 1}</span>{participant.name}
                                        </div>
                                    </td>
                                )
                            :   null}
                        </tr>
                        {trade.requirements.length != 0
                            ?   trade.requirements.map((requirement: string, index: number) =>
                                    <tr key={'requirement' + index}>
                                        <td>{requirement}</td>
                                        {trade && trade.participants.length != 0
                                            ?   trade && trade.participants.map((participant: Participant) =>
                                                    <td key={participant.id + participant.bids[index][0]}>
                                                        {participant.bids[index].length === 1
                                                            ? participant.bids[index].map((bid: string, bidIndex: number) => 
                                                            <div className='bid' key={participant.id + participant.bids[index][0] + bidIndex} >{bid}</div>)
                                                            : participant.bids[index].map((bid: string, bidIndex: number) => 
                                                            <div className={'bid price price-' + bidIndex} key={participant.id + participant.bids[index][0] + bidIndex} >{Number(bid).toLocaleString('ru')} руб</div>)
                                                        }
                                                    </td>
                                                )
                                            :   null}
                                    </tr>
                                )
                            :   null}
                        </tbody>
                    </table>
                    <div className='btns'>
                        <button type='button' className='next' onClick={() => nextTurn()}><span className='material-symbols-rounded'>next_plan</span>Следующий ход</button>
                        <button type='button' className='close' onClick={() => props.setTradeId(undefined)}><span className='material-symbols-rounded'>close</span>Закрыть</button>
                    </div>
                </div>
            </div>
        )
    } else {
        return (null)
    }
}

const App = () => {
    const [trades, setTrades] = useState([]);
    const [activeTrade, setActiveTrade] = useState<number | undefined>();

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
                            <TradeCard trade={trade} key={trade.id} setTradeId={setActiveTrade}/>
                        )
                    :   'Нет активных торгов'}
            </main>
            <header>
                Lotus Trade
                <img src='/img/LOGO_LOTUS.svg' alt='logo' />
            </header>
            <footer>Footer</footer>
            { activeTrade ? <Trade tradeId={activeTrade} setTradeId={setActiveTrade}/> : null }
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);