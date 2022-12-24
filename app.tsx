import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

interface Participant {
    id: number;
    name: string;
    bids: string[];
}
interface Trade {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    requirements: string[]
    participants: Participant[]
}

let trades: Trade[] = [{
    id: 123456,
    name: 'Тестовые торги на аппарат ЛОТОС №2033564',
    startDate: '2022-12-22T07:00:00',
    endDate: '2023-01-01T00:00:00',
    requirements: [
        'Наличие комплекса мероприятий, повышающих стандарты качества изготовления',
        'Срок изготовления, дней',
        'Гарантийные обязательства, мес',
        'Условия оплаты',
        'Стоимость изготовления лота, руб. (без НДС)'
    ],
    participants: [
        {
            id: 111,
            name: 'ООО Первый',
            bids: [
                '-',
                '80',
                '24',
                '30%',
                '3700000',
                '-25000',
                '2475000'
            ]
        },
        {
            id: 222,
            name: 'ООО Второй',
            bids: [
                '-',
                '90',
                '24',
                '100%',
                '3200000',
                '-25000',
                '2475000'
            ]
        },
        {
            id: 333,
            name: 'ООО Третий',
            bids: [
                '-',
                '75',
                '22',
                '60%',
                '2800000',
                '-25000',
                '2475000'
            ]
        },
        {
            id: 444,
            name: 'ООО Четвертый',
            bids: [
                '-',
                '120',
                '36',
                '50%',
                '2500000',
                '-25000',
                '2475000'
            ]
        }
    ]
}];

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

    return daysLeft + addZero(hours) + ":" + addZero(minutes) + ":" + addZero(sec);
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
            <div className='trade-info-container'>
                <div className='trade-info'>
                    <div className='headline'>{props.trade.name}</div>
                    <div className='start-date'>{startDate(props.trade.startDate)}</div>
                    <div className='participants'>
                        <span>Участники торгов</span>
                        {props.trade.participants.length != 0
                            ?   props.trade.participants.map((participant: Participant) =>
                                    <div className='participant' key={participant.id}>{participant.name}</div>
                                )
                            :   'Нет участников'
                        }
                    </div>
                    <button type='button' className='show-trades' onClick={() => props.setTrade(undefined)}>Закрыть</button>
                </div>
            </div>
        )
    } else {
        return (null)
    }
}

const App = () => {
    const [update, setUpdate] = useState(0);
    const [activeTrade, setActiveTrade] = useState<Trade | undefined>(undefined);

    let IntervalId: any;
    if (!IntervalId) {
        IntervalId = setInterval(() => setUpdate(Math.random()), 1000);
    }

    useEffect(() => {

    }, [update])

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