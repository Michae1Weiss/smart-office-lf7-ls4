// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Chart configuration
    const chartConfig = {
        temperature: {
            ctx: document.getElementById('temperature-chart').getContext('2d'),
            chart: null,
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            }
        },
        humidity: {
            ctx: document.getElementById('humidity-chart').getContext('2d'),
            chart: null,
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            }
        },
        noise: {
            ctx: document.getElementById('noise-chart').getContext('2d'),
            chart: null,
            data: {
                labels: [],
                datasets: [{
                    label: 'Noise Events',
                    data: [],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            }
        }
    };

    // Initialize charts
    Object.keys(chartConfig).forEach(sensor => {
        chartConfig[sensor].chart = new Chart(chartConfig[sensor].ctx, {
            type: 'line',
            data: chartConfig[sensor].data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000
                },
                scales: {
                    y: {
                        beginAtZero: false
                    },
                    x: {
                        display: true,
                        ticks: {
                            maxTicksLimit: 6
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    });

    // Polling functionality
    let pollingInterval = 5000; // Default polling interval
    let pollingTimer = null;
    
    // Get selected polling interval
    const pollingSelect = document.getElementById('polling-interval');
    pollingSelect.addEventListener('change', () => {
        pollingInterval = parseInt(pollingSelect.value);
        restartPolling();
    });

    // Function to update charts with new data
    function updateChart(sensor, timestamp, value) {
        // Format timestamp for display
        const date = new Date(timestamp);
        const timeLabel = date.toLocaleTimeString();
        
        // Add new data to chart
        if (chartConfig[sensor]) {
            // Limit data points to keep charts readable
            if (chartConfig[sensor].data.labels.length > 20) {
                chartConfig[sensor].data.labels.shift();
                chartConfig[sensor].data.datasets[0].data.shift();
            }
            
            chartConfig[sensor].data.labels.push(timeLabel);
            chartConfig[sensor].data.datasets[0].data.push(value);
            chartConfig[sensor].chart.update();
        }
    }

    // Function to format timestamp for display
    function formatTimestamp(timestamp) {
        if (!timestamp) return '--';
        
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // Function to update UI with sensor data
    function updateUI(data) {
        // Update temperature
        if (data.temperature) {
            document.getElementById('temperature-value').textContent = data.temperature.value.toFixed(1);
            document.getElementById('temperature-unit').textContent = `°${data.temperature.unit}`;
            document.getElementById('temperature-sensor').textContent = data.temperature.sensor;
            document.getElementById('temperature-timestamp').textContent = formatTimestamp(data.temperature.timestamp);
            
            // Update chart if timestamp is valid
            if (data.temperature.timestamp) {
                updateChart('temperature', data.temperature.timestamp, data.temperature.value);
            }
        }
        
        // Update humidity
        if (data.humidity) {
            document.getElementById('humidity-value').textContent = data.humidity.value.toFixed(1);
            document.getElementById('humidity-unit').textContent = data.humidity.unit;
            document.getElementById('humidity-sensor').textContent = data.humidity.sensor;
            document.getElementById('humidity-timestamp').textContent = formatTimestamp(data.humidity.timestamp);
            
            // Update chart if timestamp is valid
            if (data.humidity.timestamp) {
                updateChart('humidity', data.humidity.timestamp, data.humidity.value);
            }
        }
        
        // Update noise level
        if (data.noise) {
            document.getElementById('noise-value').textContent = data.noise.value;
            document.getElementById('noise-unit').textContent = data.noise.unit;
            document.getElementById('noise-sensor').textContent = data.noise.sensor;
            document.getElementById('noise-period').textContent = data.noise.period;
            document.getElementById('noise-timestamp').textContent = formatTimestamp(data.noise.timestamp);
            
            // Update chart if timestamp is valid
            if (data.noise.timestamp) {
                updateChart('noise', data.noise.timestamp, data.noise.value);
            }
        }
        
        // Update system status
        if (data.status) {
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            const statusMessage = document.getElementById('status-message');
            const statusTimestamp = document.getElementById('status-timestamp');
            
            // Remove all status classes
            statusDot.classList.remove('online', 'offline', 'error');
            
            // Add appropriate class based on status
            if (data.status.status === 'online') {
                statusDot.classList.add('online');
                statusText.textContent = 'Online';
            } else if (data.status.status === 'error') {
                statusDot.classList.add('error');
                statusText.textContent = 'Error';
            } else if (data.status.status === 'offline') {
                statusDot.classList.add('offline');
                statusText.textContent = 'Offline';
            } else {
                statusDot.classList.add('error');
                statusText.textContent = data.status.status;
            }
            
            statusMessage.textContent = data.status.message || '--';
            statusTimestamp.textContent = formatTimestamp(data.status.timestamp);
        }
    }

    // Function to fetch data from the API
    async function fetchData() {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Update status to show connection error
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            statusDot.classList.remove('online', 'offline', 'error');
            statusDot.classList.add('offline');
            statusText.textContent = 'Connection Error';
        }
    }

    // Function to start/restart polling
    function restartPolling() {
        // Clear existing timer
        if (pollingTimer) {
            clearInterval(pollingTimer);
        }
        
        // Fetch data immediately, then start timer
        fetchData();
        pollingTimer = setInterval(fetchData, pollingInterval);
    }

    // Start polling when page loads
    restartPolling();
});