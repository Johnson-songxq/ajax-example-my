"use strict";

const countriesContainer = document.querySelector(".countries");

function renderError(error) {
  countriesContainer.insertAdjacentHTML("beforeend", error.message);
}

function renderCountry(country) {
  const html = `
  <article class="country">
   <img class="country__img" src="${country.flag}" />
   <div class="country__data">
     <h3 class="country__name">${country.name}</h3>
     <h4 class="country__region">${country.region}</h4>
     <p class="country__row"><span>👫</span>${
       (country.population / 1000000).toFixed(1) + " M"
     }</p>
     <p class="country__row"><span>🗣️</span>${country.languages[0].name}</p>
     <p class="country__row"><span>💰</span>${country.currencies[0].name}</p>
   </div>
 </article>
 `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
}

const getCountry = (country) => {
  //老代码
  const request = new XMLHttpRequest();
  request.open("GET", `https://restcountries.com/v2/name/${country}`);
  request.send();

  //load event
  request.addEventListener("load", function () {
    const data = JSON.parse(this.responseText);
    const country = data[0];

    renderCountry(country);

    if (!country.borders) {
      // todo: error hanlding later
      return;
    }

    const neighbour = country.borders[0];
    const neighbourRequest = new XMLHttpRequest();
    neighbourRequest.open(
      "GET",
      `https://restcountries.com/v2/alpha/${neighbour}`
    );
    neighbourRequest.send();
    neighbourRequest.addEventListener("load", function () {
      const country = JSON.parse(this.responseText);
      renderCountry(country);
    });
  });
};

const getCountryBetter = (country) => {
  // fetch(url, options)
  const request = fetch(`https://restcountries.com/v2/name/${country}`);

  request
    .then((response) => response.json())
    .then((data) => {
      const country = data[0];
      renderCountry(country);

      if (!country.borders) {
        throw new Error("This country has no neighbour");
      }

      const neighbour = country.borders[0];
      return fetch(`https://restcountries.com/v2/alpha/${neighbour}`);
    })
    .then((response) => response.json())
    .then((data) => renderCountry(data))
    .catch((error) => renderError(error))
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

const getCountryBest = async (country) => {
  try {
    const response = await fetch(
      `https://restcountries.com/v2/name/${country}`
    );
    const data = await response.json();
    const firstCountry = data[0];
    renderCountry(firstCountry);

    if (!firstCountry.borders) {
      throw new Error("This country has no neighbour");
    }

    const neighbour = firstCountry.borders[0];
    const neighbourRes = await fetch(
      `https://restcountries.com/v2/alpha/${neighbour}`
    );
    const neighbourCountry = await neighbourRes.json();
    renderCountry(neighbourCountry);
  } catch (error) {
    renderError(error);
  } finally {
    countriesContainer.style.opacity = 1;
  }
};

const btn = document.querySelector(".btn-country");
btn.addEventListener("click", () => getCountryBest("china"));

// getCountryBetter("australia");

// getCountry("china");
//这两个不一定谁先返回
