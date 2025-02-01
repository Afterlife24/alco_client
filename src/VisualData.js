import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, PointElement } from "chart.js";
import './VisualData.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, PointElement);

const VisualData = ({ orders }) => {
  const [dateFilter, setDateFilter] = useState("Today");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [bestData, setBestData] = useState(null);

  useEffect(() => {
    filterOrdersByDate();
  }, [dateFilter, orders]);

  const filterOrdersByDate = () => {
    const now = new Date();
    let filtered = orders;

    if (dateFilter === "Today") {
      filtered = orders.filter(
        (order) => new Date(order.createdAt).toDateString() === now.toDateString()
      );
    } else if (dateFilter === "Last 3 Days") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);
      filtered = orders.filter((order) => new Date(order.createdAt) >= threeDaysAgo);
    } else if (dateFilter === "Last 15 Days") {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(now.getDate() - 15);
      filtered = orders.filter((order) => new Date(order.createdAt) >= fifteenDaysAgo);
    } else if (dateFilter === "Last Month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = orders.filter((order) => new Date(order.createdAt) >= oneMonthAgo);
    }

    setFilteredOrders(filtered);
  };

  // Group orders by date
  const orderCountsByDate = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for Line Chart
  const chartData = {
    labels: Object.keys(orderCountsByDate),
    datasets: [
      {
        label: "Number of Orders",
        data: Object.values(orderCountsByDate),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const handleChartClick = (event) => {
    const chart = event.chart;
    const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
    if (activePoints.length > 0) {
      const index = activePoints[0].index;
      const selectedDate = chart.data.labels[index];
      const orderCount = chart.data.datasets[0].data[index];
      setBestData({ date: selectedDate, count: orderCount });
    }
  };

  const handleShowAllOrders = () => {
    const totalOrders = orders.length;
    const bestDay = Object.keys(orderCountsByDate).reduce((a, b) =>
      orderCountsByDate[a] > orderCountsByDate[b] ? a : b
    );
    const bestCount = orderCountsByDate[bestDay];
    setBestData({
      totalOrders,
      bestDay,
      bestCount,
    });
  };

  return (
    <div className="visual-data">
      <h2>Orders Over Time</h2>
      <div className="date-filters">
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="Today">Today's Orders</option>
          <option value="Last 3 Days">Last 3 Days</option>
          <option value="Last 15 Days">Last 15 Days</option>
          <option value="Last Month">Last Month</option>
        </select>
      </div>

      <div className="chart-section" onClick={handleChartClick}>
        <Line data={chartData} />
      </div>

      {bestData && (
        <div className="best-data">
          {bestData.totalOrders ? (
            <>
              <h3>Total Orders: {bestData.totalOrders}</h3>
              <h3>Best Day: {bestData.bestDay}</h3>
              <h3>Orders on Best Day: {bestData.bestCount}</h3>
            </>
          ) : (
            <>
              <h3>Selected Date: {bestData.date}</h3>
              <h3>Orders: {bestData.count}</h3>
            </>
          )}
        </div>
      )}

      <div className="show-all">
        <button onClick={handleShowAllOrders}>Show All Orders Statistics</button>
      </div>
    </div>
  );
};

export default VisualData;
