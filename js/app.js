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

        const locationResp = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${apiKey}`);
        const locationData = await locationResp.json();

        const lat = locationData[0].lat;
        const lon = locationData[0].lon;

        const forecastResp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&appid=${apiKey}`);
        const forecastData = await forecastResp.json();

        const pollutionResp = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const pollutionData = await pollutionResp.json();

        const aqiVals = [
          pollutionData.list[0].main.aqi,
          pollutionData.list[8].main.aqi,
          pollutionData.list[16].main.aqi
        ];

        this.forecast = [];
        let count = 0;
        for(let i = 0; i < forecastData.list.length; i++) {
          const item = forecastData.list[i];
          if(item.dt_txt.includes("12:00:00") && this.forecast.length < 3) {
            let rain = 0;
            if(item.rain) {
              if(item.rain["3h"] !== undefined && item.rain["3h"] != null) {
                rain = item.rain["3h"];
              }
            }

            this.forecast.push ({
              temp: forecastData.list[i].main.temp,
              desc: forecastData.list[i].weather[0].description,
              windSpeed: forecastData.list[i].wind.speed,
              rain: rain,
              iconURL: `https://openweathermap.org/img/wn/${forecastData.list[i].weather[0].icon}@2x.png`,
              advice: getPackingAdvice(item.weather[0].description, rain),
              tempAdv: getTempAdvice(item.main.temp),
              aqi: aqiVals[count],
              aqiDesc: getAQIDesc(aqiVals[count]),
              pollutionWarn: getPollutionWarning(pollutionData.list[count*8].components)
            });
            count++;
          }
          console.log("AQI for day", count, aqiVals[count], getAQIDesc(aqiVals[count]));

        }

      } catch (error) {
        console.error('Error fetching API:', error);
      }
      function getPackingAdvice(description, rain) {
          const desc = description.toLowerCase();
          if (rain > 0) return "Pack an unbrella 🌂";
          if (desc.includes("snow")) return "Pack warm clothing 🌨️";
          if (desc.includes("clear")) return "Pack sunglasses and suncream ☀️";
          if (desc.includes("cloud")) return "Pack a light jacket or sweater ☁️";
          if (desc.includes("storm") || desc.includes("thunder")) return "Pack waterproof gear, stay safe! ⚡";
          return "Pack your usual 🧳";
      }
      function getTempAdvice(temperature) {
        if (temperature < 8) return "Make sure to pack for cold weather.";
        if (temperature >= 8 && temperature <= 24) return "Make sure to pack for mild weather.";
        if (temperature > 24) return "Make sure to pack for hot weather."
      }
      function getAQIDesc(aqi) {
        switch(aqi) {
          case 1: return "Good";
          case 2: return "Fair";
          case 3: return "Moderate";
          case 4: return "Poor";
          case 5: return "Very Poor";
          default: return "Unknoen"
        }
      }
      function getPollutionWarning(components) {
        let warnings = [];

        if(components.pm2_5 > 35) warnings.push("PM2.5 elevated - May aggravate lungs or asthma");
        if(components.pm10 > 50) warnings.push("PM10 elevated - May irritate respiratory system");
        if(components.co > 10) warnings.push("CO elevated - May cause headaches/dizziness");
        if(components.no2 > 200) warnings.push("NO2 elevated - May cause respiratory infection");
        if(components.o3 > 180) warnings.push("O3 elevated - May cause lung irritation");
        if(components.so2 > 125) warnings.push("SO2 elevated - May cause breathing issues");
        if(components.hn3 > 200) warnings.push("NH3 elevated - May irritate eyes/respiratory tract");
        return warnings.length ? warnings.join("; ") : "Air pollutants at safe levels";
      }
    }
  }
}).mount('#app');
