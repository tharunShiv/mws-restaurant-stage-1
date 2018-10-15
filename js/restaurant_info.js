let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  var image_alt = "Image for restuarnt " + restaurant.name;
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.setAttribute("alt", image_alt);
  image.src = "img/" + restaurant.photograph + ".webp";

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById("reviews-container");
  const title = document.createElement("h5");
  title.setAttribute("tabindex", "0");
  title.innerHTML = "Reviews";
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  li.setAttribute("tabindex", "0");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  `<a href="">` + restaurant.name + `</a>`;
  // li.innerHTML = restaurant.name;
  li.innerHTML = `<a href="">` + restaurant.name + `</a>`;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// let restaurant;
// var newMap;

// //Registering service worker
// if (navigator.serviceWorker) {
//   navigator.serviceWorker
//     .register("/worker.js", { scope: "/" })
//     .then(function() {
//       console.log("SW Registration success!");
//     })
//     .catch(function(e) {
//       console.log(e);
//     });
// }

// /**
//  * Initialize map as soon as the page is loaded.
//  */
// document.addEventListener("DOMContentLoaded", event => {
//   initMap();
// });

// window.initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) {
//       // Got an error!
//       console.error(error);
//     } else {
//       self.map = new google.maps.Map(document.getElementById("map"), {
//         zoom: 16,
//         center: restaurant.latlng,
//         scrollwheel: false
//       });
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
//     }
//   });
// };

// /**
//  * Get current restaurant from page URL.
//  */
// fetchRestaurantFromURL = callback => {
//   if (self.restaurant) {
//     // restaurant already fetched!
//     callback(null, self.restaurant);
//     return;
//   }
//   const id = getParameterByName("id");
//   if (!id) {
//     // no id found in URL
//     error = "No restaurant id in URL";
//     callback(error, null);
//   } else {
//     DBHelper.fetchRestaurantById(id, (error, restaurant) => {
//       self.restaurant = restaurant;
//       if (!restaurant) {
//         console.error(error);
//         return;
//       }
//       fillRestaurantHTML();
//       callback(null, restaurant);
//     });
//   }
// };

// /**
//  * Create restaurant HTML and add it to the webpage
//  */
// fillRestaurantHTML = (restaurant = self.restaurant) => {
//   const name = document.getElementById("restaurant-name");
//   name.innerHTML = restaurant.name;

//   const address = document.getElementById("restaurant-address");
//   address.innerHTML = restaurant.address;

//   const picture = document.getElementById("restaurant-pic");
//   picture.className = "restaurant-img";
//   picture.querySelector("source").srcset =
//     DBHelper.imageUrlForRestaurant(restaurant) + ".webp";
//   picture.setAttribute("alt", restaurant.name);
//   picture.setAttribute("title", restaurant.name);

//   const image = document.getElementById("restaurant-img");
//   image.className = "restaurant-img";
//   image.src = DBHelper.imageUrlForRestaurant(restaurant) + ".jpg";
//   image.setAttribute("alt", restaurant.name);
//   image.setAttribute("title", restaurant.name);

//   const cuisine = document.getElementById("restaurant-cuisine");
//   cuisine.innerHTML = restaurant.cuisine_type;

//   // fill operating hours
//   if (restaurant.operating_hours) {
//     fillRestaurantHoursHTML();
//   }
//   // fill reviews
//   fillReviewsHTML();
// };

// /**
//  * Create restaurant operating hours HTML table and add it to the webpage.
//  */
// fillRestaurantHoursHTML = (
//   operatingHours = self.restaurant.operating_hours
// ) => {
//   const hours = document.getElementById("restaurant-hours");
//   for (let key in operatingHours) {
//     const row = document.createElement("tr");

//     const day = document.createElement("td");
//     day.innerHTML = key;
//     day.setAttribute("aria-label", key + " open");
//     row.appendChild(day);

//     const time = document.createElement("td");
//     time.innerHTML = operatingHours[key].replace(",", "<br/>");
//     time.setAttribute("aria-label", operatingHours[key].replace(/\-/g, "to"));
//     row.appendChild(time);
//     row.setAttribute("tabindex", 0);

//     hours.appendChild(row);
//   }
// };

// /**
//  * Create all reviews HTML and add them to the webpage.
//  */
// fillReviewsHTML = (reviews = self.restaurant.reviews) => {
//   const container = document.getElementById("reviews-container");
//   const title = document.createElement("h2");
//   title.innerHTML = "Reviews";
//   title.setAttribute("tabindex", 0);
//   container.appendChild(title);

//   if (!reviews) {
//     const noReviews = document.createElement("p");
//     noReviews.innerHTML = "No reviews yet!";
//     noReviews.setAttribute("tabindex", 0);
//     container.appendChild(noReviews);
//     return;
//   }
//   const ul = document.getElementById("reviews-list");
//   reviews.forEach(review => {
//     ul.appendChild(createReviewHTML(review));
//   });
//   container.appendChild(ul);
// };

// /**
//  * Create review HTML and add it to the webpage.
//  */
// createReviewHTML = review => {
//   const li = document.createElement("li");

//   const header = document.createElement("header");

//   const name = document.createElement("p");
//   name.innerHTML = review.name;
//   name.setAttribute("tabindex", 0);
//   header.appendChild(name);

//   const date = document.createElement("p");
//   date.innerHTML = review.date;
//   date.setAttribute("tabindex", 0);
//   header.appendChild(date);

//   li.appendChild(header);

//   const rating = document.createElement("p");
//   rating.innerHTML = `Rating: ${review.rating}`;
//   rating.setAttribute("tabindex", 0);
//   li.appendChild(rating);

//   const comments = document.createElement("p");
//   comments.innerHTML = review.comments;
//   comments.setAttribute("tabindex", 0);
//   li.appendChild(comments);

//   return li;
// };

// /**
//  * Add restaurant name to the breadcrumb navigation menu
//  */
// fillBreadcrumb = (restaurant = self.restaurant) => {
//   const breadcrumb = document.getElementById("breadcrumb");
//   const li = document.createElement("li");
//   li.innerHTML = restaurant.name;
//   li.setAttribute("aria-hidden", "true");
//   breadcrumb.appendChild(li);
// };

// /**
//  * Get a parameter by name from page URL.
//  */
// getParameterByName = (name, url) => {
//   if (!url) url = window.location.href;
//   name = name.replace(/[\[\]]/g, "\\$&");
//   const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
//     results = regex.exec(url);
//   if (!results) return null;
//   if (!results[2]) return "";
//   return decodeURIComponent(results[2].replace(/\+/g, " "));
// };

// // bypassing map in keyboard navigation
// document.querySelector("#home").addEventListener("keydown", function(event) {
//   if (event.keyCode == 9 && !event.shiftKey) {
//     event.preventDefault();
//     document.querySelector("#restaurant-name").focus();
//   }
// });

// document
//   .querySelector("#restaurant-name")
//   .addEventListener("keydown", function(event) {
//     if (event.keyCode == 9 && event.shiftKey) {
//       event.preventDefault();
//       document.querySelector("#home").focus();
//     }
//   });
