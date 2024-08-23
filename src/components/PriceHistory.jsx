import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAveragePriceInPeriod, getFloorPriceInPeriod, getTotalSalesInPeriod, getMaxSupply, getLiveFloorPrice } from '../components/utils';
import '../styles/PriceHistory.css';

const PriceHistory = ({ contractAddress, marketplace, currencyIcon }) => {
    const [priceToday, setPriceToday] = useState(null);
    const [priceLast7Days, setPriceLast7Days] = useState(null);
    const [priceLast30Days, setPriceLast30Days] = useState(null);
    const [priceLastYear, setPriceLastYear] = useState(null);
    const [priceAllTime, setPriceAllTime] = useState(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
    const [chartData, setChartData] = useState([]);
    const [selectedChart, setSelectedChart] = useState('averagePrice');
    const [maxSupply, setMaxSupply] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const descriptions = {
        averagePrice: "*The average sale prices of the artworks NFTs over the selected period.",
        floorPrice: "*The lowest listing price of the artworks NFTs over the selected period.",
        totalSales: "*The number of sales of the artworks NFTs over the selected period.",
        artworkPrice: "*The theoretical artwork price, calculated based on the floor price over the selected period."
    };
    

    const customTooltip = ({ payload }) => {
        if (payload && payload.length) {
            const value = payload[0].value;
            return (
                <div className="custom-tooltip flex center-ho">
                    <p>{`${formatPrice(value)}`}</p>
                    <img src={currencyIcon} alt="Currency Icon" className="tooltip-currency-icon ml5" />
                </div>
            );
        }
        return null;
    };

    const customTooltipSales = ({ payload }) => {
        if (payload && payload.length) {
            const value = payload[0].value;
            return (
                <div className="custom-tooltip flex center-ho">
                    <p>{`${formatPrice(value)}`}</p>
                </div>
            );
        }
        return null;
    };

    const formatPrice = (price) => {
        return price !== null && !isNaN(price) ? parseFloat(price).toFixed(2) : '0.00';
    };

    const formatYAxisTick = (tick) => {
        return parseFloat(tick).toFixed(2);
    };

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (!contractAddress || !marketplace) return;

            setIsLoading(true);

            const now = Math.floor(Date.now() / 1000);
            const oneHour = 3600;
            const oneDay = 86400;
            const oneYear = 31536000;



            try {
                const today = await getAveragePriceInPeriod(contractAddress, now - (24 * oneHour), now, marketplace);
                setPriceToday(formatPrice(today));

                const last7Days = await getAveragePriceInPeriod(contractAddress, now - (7 * oneDay), now, marketplace);
                setPriceLast7Days(formatPrice(last7Days));

                const last30Days = await getAveragePriceInPeriod(contractAddress, now - (30 * oneDay), now, marketplace);
                setPriceLast30Days(formatPrice(last30Days));

                const lastYear = await getAveragePriceInPeriod(contractAddress, now - oneYear, now, marketplace);
                setPriceLastYear(formatPrice(lastYear));

                const allTime = await getAveragePriceInPeriod(contractAddress, 0, now, marketplace);
                setPriceAllTime(formatPrice(allTime));

                // Fetch max supply
                const supply = await getMaxSupply(contractAddress);
                setMaxSupply(supply);

            } catch (error) {
                console.error("Error fetching price history:", error);
            }
            setIsLoading(false);
        };

        fetchPriceHistory();
    }, [contractAddress, marketplace]);

    useEffect(() => {
        const generateChartData = async () => {
            if (!contractAddress || !marketplace || maxSupply === null) return;
    
            setIsLoading(true);
    
            const now = Math.floor(Date.now() / 1000);
            const oneHour = 3600;
            const oneDay = 86400;
            const oneYear = 31536000;
    
            try {
                let data = [];
                const fallbackHistory = 1 * oneDay; // 1 year history to find fallback value if needed
    
                const fetchDataInPeriod = async (start, end) => {
                    const avgPrice = await getAveragePriceInPeriod(contractAddress, start, end, marketplace);
                    const floorPrice = await getFloorPriceInPeriod(contractAddress, start, end, marketplace);
                    const totalSales = await getTotalSalesInPeriod(contractAddress, start, end, marketplace);
                    return {
                        avgPrice: formatPrice(Number(avgPrice)),
                        floorPrice: Number(floorPrice),
                        totalSales,
                    };
                };
    
                const getNonZeroFloorPrice = async (start, end) => {
                    const result = await fetchDataInPeriod(start, end);
                    let { floorPrice } = result;
        
                    let historyStart = end - fallbackHistory;
                    while (floorPrice === 0 && historyStart < start) {
                        const historyResult = await fetchDataInPeriod(historyStart, end);
                        if (historyResult.floorPrice !== 0) {
                            floorPrice = historyResult.floorPrice;
                            break;
                        }
                        historyStart += fallbackHistory; // Move further back in history
                    }
        
                    return floorPrice;
                };

                const getCurrentHourFloorPrice = async () => {
                    return await getLiveFloorPrice(contractAddress, marketplace);
                };
    
                const processChartData = async (start, end, period) => {
                    const { avgPrice, totalSales } = await fetchDataInPeriod(start, end);
                    let floorPrice;
                    if (period === '1d' && end === now) {
                        floorPrice = await getCurrentHourFloorPrice();
                    } else {
                        floorPrice = await getNonZeroFloorPrice(start, end);
                    }
                    const artworkPrice = floorPrice * Number(maxSupply);
                
                    // Zeit aufrunden
                    let time = new Date(start * 1000);
                    if (period === '1d') {
                        // Auf die nächste volle Stunde aufrunden
                        time.setHours(time.getHours() + Math.ceil(time.getMinutes() / 60));
                        time.setMinutes(0);
                        time.setSeconds(0);
                    } else {
                        // Auf den nächsten vollen Tag aufrunden
                        time = new Date(Math.ceil(time.getTime() / (1000 * 60 * 60 * 24)) * (1000 * 60 * 60 * 24));
                    }
                    return {
                        time: period === '1d' ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString(),
                        Averageprice: avgPrice,
                        Floorprice: formatPrice(floorPrice),
                        TotalSales: totalSales,
                        ArtworkPrice: artworkPrice
                    };
                };
    
                if (selectedTimeframe === '1d') {
                    for (let i = 0; i < 24; i++) {
                        const start = now - ((24 - i) * oneHour);
                        const end = start + oneHour;
                        data.push(await processChartData(start, end, '1d'));
                    }
                } else if (selectedTimeframe === '7d') {
                    const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
                    for (let i = 0; i < 7; i++) {
                        const start = todayStart - ((6 - i) * oneDay);
                        const end = start + oneDay;
                        data.push(await processChartData(start, end, '7d'));
                    }
                } else if (selectedTimeframe === '30d') {
                    for (let i = 0; i < 30; i++) {
                        const start = now - ((30 - i) * oneDay);
                        const end = start + oneDay;
                        data.push(await processChartData(start, end, '30d'));
                    }
                } else if (selectedTimeframe === 'alltime') {
                    const weeks = Math.floor(now / (7 * oneDay));
                    for (let i = 0; i < weeks; i++) {
                        const start = now - ((weeks - i) * 7 * oneDay);
                        const end = start + (7 * oneDay);
                        data.push(await processChartData(start, end, 'alltime'));
                    }
                }
    
                setChartData(data);
            } catch (error) {
                console.error("Error generating chart data:", error);
            }
            setIsLoading(false);
        };

        generateChartData();
    }, [contractAddress, marketplace, selectedTimeframe, maxSupply]);
    


    const getYAxisDomain = () => {
        if (chartData.length === 0) return [0, 1];
        const prices = chartData.map(d => parseFloat(d.Averageprice));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return [minPrice * 0.9, maxPrice * 1.1];
    };

    const getTotalSalesYAxisDomain = () => {
        if (chartData.length === 0) return [0, 1];
        const sales = chartData.map(d => d.TotalSales);
        const minSales = Math.min(...sales);
        const maxSales = Math.max(...sales);
        return [minSales * 0.9, maxSales * 1.1];
    };

    const getArtworkPriceYAxisDomain = () => {
        if (chartData.length === 0) return [0, 1];
        const artworkPrices = chartData.map(d => d.ArtworkPrice);
        const minPrice = Math.min(...artworkPrices);
        const maxPrice = Math.max(...artworkPrices);
        return [minPrice * 0.9, maxPrice * 1.1];
    };

    return (
        <div className="price-history">
            <h2 className='mt5'>Artwork Statistics</h2>

            <div className="chart-selector timeframe-selector">
                <button className={selectedChart === 'averagePrice' ? 'active' : ''} onClick={() => setSelectedChart('averagePrice')}>Average Price</button>
                <button className={selectedChart === 'floorPrice' ? 'active' : ''} onClick={() => setSelectedChart('floorPrice')}>Floor Price</button>
                <button className={selectedChart === 'totalSales' ? 'active' : ''} onClick={() => setSelectedChart('totalSales')}>Total Sales</button>
                <button className={selectedChart === 'artworkPrice' ? 'active' : ''} onClick={() => setSelectedChart('artworkPrice')}>Artwork Price</button>
            </div>

            <div className="timeframe-selector">
                <button className={selectedTimeframe === '1d' ? 'active' : ''} onClick={() => setSelectedTimeframe('1d')}>1 Day</button>
                <button className={selectedTimeframe === '7d' ? 'active' : ''} onClick={() => setSelectedTimeframe('7d')}>7 Days</button>
                <button className={selectedTimeframe === '30d' ? 'active' : ''} onClick={() => setSelectedTimeframe('30d')}>30 Days</button>
                {/* <button className={selectedTimeframe === 'alltime' ? 'active' : ''} onClick={() => setSelectedTimeframe('alltime')}>All Time</button> */}
            </div>

            <ResponsiveContainer width="100%" height={400}>
    {isLoading ? (
        <div className="loading-container">
            <img src="/loading.gif" alt="Loading..." />
        </div>
    ) : (
        selectedChart === 'averagePrice' ? (
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121212" />
                <XAxis dataKey="time" stroke="grey" />
                <YAxis
                    stroke="grey"
                    domain={getYAxisDomain()}
                    tickFormatter={formatYAxisTick}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="Averageprice"
                    stroke="var(--branding-color)"
                    fill="var(--branding-color-hover)"
                    strokeWidth={2}
                    dot={{ stroke: 'var(--branding-color)', strokeWidth: 0, r: 1 }}
                />
            </AreaChart>
        ) : selectedChart === 'floorPrice' ? (
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121212" />
                <XAxis dataKey="time" stroke="grey" />
                <YAxis
                    stroke="grey"
                    domain={getYAxisDomain()}
                    tickFormatter={formatYAxisTick}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="Floorprice"
                    stroke="var(--branding-color)"
                    fill="var(--branding-color-hover)"
                    strokeWidth={2}
                    dot={{ stroke: 'var(--branding-color)', strokeWidth: 0, r: 1 }}
                />
            </AreaChart>
        ) : selectedChart === 'totalSales' ? (
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121212" />
                <XAxis dataKey="time" stroke="grey" />
                <YAxis
                    stroke="grey"
                    domain={getTotalSalesYAxisDomain()}
                    tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip content={customTooltipSales} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="TotalSales"
                    stroke="var(--branding-color)"
                    fill="var(--branding-color-hover)"
                    strokeWidth={2}
                    dot={{ stroke: 'var(--branding-color)', strokeWidth: 0, r: 1 }}
                />
            </AreaChart>
        ) : (
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#121212" />
                <XAxis dataKey="time" stroke="grey" />
                <YAxis
                    stroke="grey"
                    domain={getArtworkPriceYAxisDomain()}
                    tickFormatter={formatYAxisTick}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="ArtworkPrice"
                    stroke="var(--branding-color)"
                    fill="var(--branding-color-hover)"
                    strokeWidth={2}
                    dot={{ stroke: 'var(--branding-color)', strokeWidth: 0, r: 1 }}
                />
            </AreaChart>
        )
    )}
</ResponsiveContainer>

<div className="chart-description blue w100 centered text-align-center">
                <p>{descriptions[selectedChart]}</p>
            </div>
        </div>
    );
};

export default PriceHistory;
