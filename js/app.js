const { createApp } = Vue;

createApp({
  data() {
    return {
      title: 'Weather App',
      city: '',
      forecast: [],
      apiData: null
    };
  },
  methods: {
    async fetchData() {
      try {
        // My API key
        const apiKey = 'a71ecba9aad3c467f76f6773d2473ab9';

        const forecastResp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&appid=${apiKey}`);
        const forecastData = await forecastResp.json();

        this.forecast = [];
        for(let i = 0; i < forecastData.list.length; i++) {
          const item = forecastData.list[i];
          if(item.dt_txt.includes("12:00:00") && this.forecast.length < 3) {
            this.forecast.push ({
              temp: forecastData.list[i].main.temp,
              desc: forecastData.list[i].weather[0].description,
              iconURL: `https://openweathermap.org/img/wn/${forecastData.list[i].weather[0].icon}@2x.png`,
              advice: getPackingAdvice(item.weather[0].description)
            });
          }
          
        }

      } catch (error) {
        console.error('Error fetching API:', error);
      }
      function getPackingAdvice(description) {
          const desc = description.toLowerCase();
          if (desc.includes("rain")) return "Pack an unbrella 🌂";
          if (desc.includes("snow")) return "Pack warm clothing ❄️";
          if (desc.includes("clear")) return "Pack sunglasses and suncream ☀️";
          if (desc.includes("cloud")) return "Pack a light jacket or sweater ☁️";
          if (desc.includes("storm") || desc.includes("thunder")) return "Pack waterproof gear, stay safe! ⚡";
          return "Pack your usual 🧳";
        }
    }
  }
}).mount('#app');
