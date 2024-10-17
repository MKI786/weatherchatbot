const apiKey = 'e472cf40fb37e74f3d62e7fa40d3c44f';

// Function to fetch current weather for a city
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeather(data);  // Display current weather
        
        // After displaying current weather, fetch the forecast for the same city
        fetchForecast(city);
    } catch (error) {
        document.getElementById('weather-details').innerText = error.message;
    }
}

// Function to display the fetched weather details in the existing structure
function displayWeather(data) {
    const weatherDetails = document.getElementById('weather-details');
    const weatherImage = document.getElementById('weather-image');
    const { name, main, weather, wind } = data;

    weatherDetails.innerHTML = `
        <h2>${name}</h2>
        <p>Temperature: ${main.temp} °C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
        <p>Description: ${weather[0].description}</p>
    `;

    weatherImage.innerHTML = `<img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" width='500px' alt="Weather Icon">`;

    // Update the temperature bar chart
    createTemperatureChart([main.temp], [new Date().toLocaleDateString()]);

    // Update the humidity doughnut chart
    createHumidityDoughnutChart(main.humidity);

    // Since we're working with a single data point for temperature,
    // use the current date for the line chart.
    const currentDate = new Date().toLocaleDateString();
    createTemperatureLineChart([main.temp], [currentDate]);
}

// Function to fetch 5-day weather forecast for a city
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayForecast(data);  // Display 5-day forecast
    } catch (error) {
        document.querySelector('#forecast-table tbody').innerText = error.message;
    }
}

function displayForecast(data) {
    const forecastTableBody = document.querySelector('#forecast-table tbody');
    forecastTableBody.innerHTML = ''; // Clear existing rows

    const temps = [];
    const dates = [];

    // Process forecast data for every 24 hours (API provides data in 3-hour intervals)
    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) { // Pick every 8th item for 24-hour intervals
            const date = new Date(forecast.dt_txt).toLocaleDateString();
            const temp = forecast.main.temp;
            const conditions = forecast.weather[0].description;

            // Display data in the forecast table
            forecastTableBody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${temp} °C</td>
                    <td>${conditions}</td>
                </tr>
            `;

            // Store data for charts
            temps.push(temp);
            dates.push(date);
        }
    });

}


// Function to create a temperature bar chart
function createTemperatureChart(temps, dates) {
    const ctx = document.getElementById('temp-bar-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to create a doughnut chart for humidity
function createHumidityDoughnutChart(humidity) {
    const ctx = document.getElementById('weather-doughnut-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Humidity', 'Remaining'],
            datasets: [{
                label: 'Humidity (%)',
                data: [humidity, 100 - humidity],
                backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Function to create a line chart for temperature changes
function createTemperatureLineChart(temps, dates) {
    const ctx = document.getElementById('temp-line-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}






// Event listener for fetching weather on button click
document.getElementById('get-weather').addEventListener('click', () => {

    const city = document.getElementById('city-input').value;
   fetchWeather(city);  // Fetch current weather and automatically fetch forecast
   fetchForecast(city);
});




const gapiKey = 'AIzaSyCip070HnWm6TtDdXN5K73QWP1XY_TwHQQ'; // Replace with your actual Gemini API key

// Function to send the user's input to the Gemini AI API and get the response
async function getAIResponse(userInput) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gapiKey}`; // Use the correct Gemini API endpoint

    // API call configuration
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: userInput // Send the user's input as "text"
                        }
                    ]
                }
            ]
        })
    };

    try {
        const response = await fetch(apiUrl, requestOptions);
        
        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Check if Gemini returned a valid response
        if (data && data.contents && data.contents[0] && data.contents[0].parts[0]) {
            return data.contents[0].parts[0].text;  // Return the AI's response
        } else {
            return 'Sorry, I could not generate a response.';
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return 'An error occurred while trying to get a response from the AI.';
    }
}

// Event listener for sending chat input
document.getElementById('send-chat').addEventListener('click', async () => {
    const userInput = document.getElementById('chat-input').value;

    // If input is empty, do nothing
    if (!userInput) return;

    // Clear previous responses
    document.getElementById('chat-response').innerText = 'Thinking...';

    // Get the AI response
    const aiResponse = await getAIResponse(userInput);

    // Display the AI's response in the chat-response div
    document.getElementById('chat-response').innerText = aiResponse;
});

