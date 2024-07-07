let countries = [];
let cities = [];

// Función para guardar datos en el servidor
function saveDataToServer(url, data) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al guardar los datos.');
        }
        return response.json();
    })
    .then(responseData => {
        console.log(responseData.message); // Mensaje de éxito
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para cargar datos del servidor
function loadDataFromServer(url, callback) {
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los datos.');
        }
        return response.json();
    })
    .then(data => {
        callback(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Class for countries
class CountryClass {
    constructor(name, growthRate) {
        this.name = name;
        this.growthRate = growthRate;
        this.population = 0;
        countries.push(this);
        saveDataToServer('/api/countries', countries); // Guardar en el servidor
        updateCountryOptions();
    }

    updatePopulation() {
        this.population = cities.filter(city => city.country === this)
                                .reduce((total, city) => total + city.population, 0);
    }
}

// Class for cities
class CityClass {
    constructor(biome, name, growthRate, country) {
        this.biome = biome;
        this.name = name;
        this.growthRate = growthRate;
        this.population = 1100;
        this.country = country;
        country.updatePopulation();
        cities.push(this);
        saveDataToServer('/api/cities', cities); // Guardar en el servidor
    }

    increasePopulation() {
        this.population += Math.round((this.population * (this.growthRate + this.country.growthRate) / 100));
        this.country.updatePopulation();
        saveDataToServer('/api/cities', cities); // Guardar en el servidor
    }
}

// Event listener for country form submission
document.getElementById('countryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('countryName').value;
    const growthRate = parseFloat(document.getElementById('countryGrowthRate').value);
    new CountryClass(name, growthRate);
    updateCityList();
    document.getElementById('countryForm').reset();
});

// Event listener for city form submission
document.getElementById('cityForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const biome = document.getElementById('biome').value;
    const name = document.getElementById('name').value;
    const growthRate = parseFloat(document.getElementById('growthRate').value);
    const countryName = document.getElementById('country').value;
    const country = countries.find(c => c.name === countryName);
    if (country) {
        new CityClass(biome, name, growthRate, country);
        updateCityList();
        document.getElementById('cityForm').reset();
    }
});

// Function to update the list of country options in the city form
function updateCountryOptions() {
    const countrySelect = document.getElementById('country');
    countrySelect.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Function to update the city list
function updateCityList() {
    const cityList = document.getElementById('cityList');
    cityList.innerHTML = '';

    countries.forEach(country => {
        country.updatePopulation();
        let countryContainer = document.createElement('div');
        countryContainer.classList.add(`cityOf${country.name}`);

        let countryTitle = document.createElement('h3');
        countryTitle.textContent = `${country.name} - Tasa de Crecimiento: ${country.growthRate}%, Población Total: ${country.population}`;
        countryContainer.appendChild(countryTitle);

        let changeCountryGrowthRateButton = document.createElement('button');
        changeCountryGrowthRateButton.innerHTML = "Cambiar Tasa de Crecimiento";
        changeCountryGrowthRateButton.addEventListener('click', () => {
            let newGrowthRate = prompt("Ingrese la nueva tasa de crecimiento:");
            if (newGrowthRate !== null) {
                country.growthRate = parseFloat(newGrowthRate);
                saveDataToServer('/api/countries', countries);
                updateCityList();
            }
        });

        countryContainer.appendChild(changeCountryGrowthRateButton);

        let ul = document.createElement('ul');
        countryContainer.appendChild(ul);

        cities.filter(city => city.country === country).forEach(city => {
            let li = document.createElement('li');
            li.textContent = `${city.name} - Bioma: ${city.biome}, Población: ${city.population}, Tasa de Crecimiento Demográfico: ${city.growthRate}%`;

            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = "Borrar ciudad";
            deleteButton.addEventListener('click', () => {
                cities = cities.filter(c => c !== city);
                city.country.updatePopulation();
                saveDataToServer('/api/cities', cities);
                updateCityList();
            });
            li.appendChild(deleteButton);

            let changeCountryButton = document.createElement('button');
            changeCountryButton.innerHTML = "Cambiar posesión";
            changeCountryButton.isOpen = false; // Inicialmente, la lista está cerrada
            changeCountryButton.addEventListener('click', () => {
                if (changeCountryButton.isOpen) {
                    let countryList = li.querySelector('.countryListForChangingPosession');
                    if (countryList) {
                        li.removeChild(countryList);
                    }
                    changeCountryButton.isOpen = false;
                } else {
                    let countryListForChangingPosession = document.createElement('div');
                    countryListForChangingPosession.className = 'countryListForChangingPosession';
                    countries.forEach(eachCountry => {
                        let countryOption = document.createElement('div');
                        countryOption.textContent = eachCountry.name;
                        countryOption.className = "countryInTheList";
                        countryOption.addEventListener('click', () => {
                            city.country = eachCountry;
                            city.country.updatePopulation();
                            saveDataToServer('/api/cities', cities);
                            updateCityList();
                        });
                        countryListForChangingPosession.appendChild(countryOption);
                    });
                    li.appendChild(countryListForChangingPosession);
                    changeCountryButton.isOpen = true;
                }
            });
            li.appendChild(changeCountryButton);

            let changeGrowthRateButton = document.createElement('button');
            changeGrowthRateButton.innerHTML = "Cambiar Tasa de Crecimiento";
            changeGrowthRateButton.addEventListener('click', () => {
                let newGrowthRate = prompt("Ingrese la nueva tasa de crecimiento:");
                if (newGrowthRate !== null) {
                    city.growthRate = parseFloat(newGrowthRate);
                    saveDataToServer('/api/cities', cities);
                    updateCityList();
                }
            });
            li.appendChild(changeGrowthRateButton);

            ul.appendChild(li);
        });

        cityList.appendChild(countryContainer);
    });
}

// Cargar datos de países desde el servidor al inicio
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromServer('/api/countries', data => {
        countries = data;
        updateCountryOptions();
        updateCityList();
    });
});

// Cargar datos de ciudades desde el servidor al inicio
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromServer('/api/cities', data => {
        cities = data;
        updateCityList();
    });
});

// Event listener for the button to increase population
document.getElementById('buttonCalcleGrowthRate').addEventListener('click', function() {
    cities.forEach(city => {
        city.increasePopulation();
    });
    updateCityList();
});
