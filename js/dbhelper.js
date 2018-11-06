// var dbPromise = idb.open("restaurant_reviews", 1, function(upgradeDB) {
//   upgradeDB.createObjectStore("restaurants", { keyPath: "id" });
// });
const offlineMessage = document.getElementById("offline");
const noDataMessage = document.getElementById("no-data");
const dataSavedMessage = document.getElementById("data-saved");
const saveErrorMessage = document.getElementById("save-error");

/**
 * Common database helper functions.
 */
class DBHelper {
  // Alert user that data may not be current
  // "You're offline and viewing stored data."
  static messageOffline() {
    const lastUpdated = this.getLastUpdated();
    if (lastUpdated) {
      offlineMessage.textContent += " Last fetched server data: " + lastUpdated;
    }
    offlineMessage.style.display = "block";
  }

  // Alert user that there is no data available.
  // "You're offline and local data is unavailable."
  static messageNoData() {
    //
    noDataMessage.style.display = "block";
  }

  // Alert user that data has been saved for offline.
  // "Server data was saved for offline mode.""
  static messageDataSaved() {
    const lastUpdated = this.getLastUpdated();
    if (lastUpdated) {
      dataSavedMessage.textContent += " on " + lastUpdated;
    }
    dataSavedMessage.style.display = "block";
  }

  // Alert user that data couldn't be saved offline
  // "Server data couldn't be saved offline.""
  static messageSaveError() {
    saveErrorMessage.style.display = "block";
  }

  // Util network function.
  static getLastUpdated() {
    return localStorage.getItem("lastUpdated");
  }

  // Util network function.
  static setLastUpdated(date) {
    localStorage.setItem("lastUpdated", date);
  }

  /*
   * logResult is available for debugging puprposes, it does some logging
   * of the JSON data.
   */
  static logResult(result) {
    console.log(result);
  }

  /*
   * The fetch call returns a promise that resolves to a response object.
   * If the request does not complete, .catch takes over and is passed the
   * corresponding error.
   */
  static logError(error) {
    console.log("[ERROR] Looks like there was a problem: \n", error);
  }

  /*
   * validateResponse checks if the response is valid (is it a 200-299?).
   * If it isn't, an error is thrown, skipping the rest of the then blocks and
   * triggering the catch block. Without this check bad responses are passed
   * down the chain and could break later code that may rely on receiving
   * a valid response. If the response is valid, it is passed to
   * readResponseAsJSON.
   * TODO: respond with custom pages for different errors or handle other
   * responses that are not ok (i.e., not 200-299), but still usable
   * (e.g., status codes in the 300 range)
   */
  static validateResponse(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  /*
   * readResponseAsJSON reads the body of the response using the Response.json()
   * method. This method returns a promise that resolves to JSON. Once this
   * promise resolves, the JSON data is passed to logResult.
   */
  static readResponseAsJSON(response) {
    return response.json();
  }

  /*
   * readResponseAsText reads the body of the response using the Response.text()
   * method.
   */
  static readResponseAsText(response) {
    return response.text();
  }

  /* Database URL */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port

    return `http://localhost:${port}`; //USE THIS TO TEST ON DEV MACHINE ITSELF, COMMENT OTHERWISE
    //return `http://192.168.1.26:${port}/restaurants`;
    //return `http://10.100.102.18:${port}/restaurants`; //USE THIS TO TEST OVER NETWORK FROM REMOTE DEVICE (use correct IP) COMMENT OTHERWISE
  }

  static get NO_IMAGE() {
    return "noimage";
  }

  static get LOADING_IMAGE() {
    return "img/loading.svg";
  }

  /**
   * getServerData
   */
  static getServerData(pathToResource) {
    // Fetch is called on a resource and Fetch returns a promise that will
    // resolve to a response object. When the promise resolves, the response
    // object is passed to validateResponse.
    return fetch(pathToResource)
      .then(this.validateResponse)
      .then(this.readResponseAsJSON);
    // Once the promise resolves, the JSON data is passed to logResult.
    // .then(this.logResult)
    // .catch(this.logError);
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // Trying to get restaurants from IndexDB
    dbPromise
      .then(function(db) {
        var tx = db.transaction("restaurants");
        var restaurantStore = tx.objectStore("restaurants");
        return restaurantStore.getAll();
      })
      .then(function(restaurants) {
        if (restaurants.length !== 0) {
          // if restaurants already in IndexDB - return them

          callback(null, restaurants);
        } else {
          // If restaurants aren't in DB yet - fetch them from API

          fetch(DBHelper.DATABASE_URL + "/restaurants")
            .then(response => response.json())
            .then(restaurants => {
              // Once restaurants are successfully fetched - add them to IndexDB
              dbPromise
                .then(function(db) {
                  var tx = db.transaction("restaurants", "readwrite");
                  var restaurantStore = tx.objectStore("restaurants");

                  for (let restaurant of restaurants) {
                    restaurantStore.put(restaurant);
                  }

                  return tx.complete;
                })
                .then(function() {
                  // successfully added restaurants to IndexDB

                  console.log("Restaurants added to Index DB successfully");
                })
                .catch(function(error) {
                  // failed adding restaurants to IndexDB

                  console.log(error);
                })
                .finally(function(error) {
                  // no matter whether adding to IndexDB was successfull or not - returning fetched data to caller

                  callback(null, restaurants);
                });
            })
            .catch(error => callback(error, null));
        }
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // Trying to get restaurant by ID  from IndexDB
    dbPromise
      .then(function(db) {
        var tx = db.transaction("restaurants");
        var restaurantStore = tx.objectStore("restaurants");
        return restaurantStore.get(parseInt(id));
      })
      .then(function(restaurant) {
        if (restaurant) {
          // if restaurants already in IndexDB - return them

          callback(null, restaurant);
        } else {
          // if restaurants aren't in Index DB - call API

          fetch(DBHelper.DATABASE_URL + "/restaurants/" + id)
            .then(response => response.json())
            .then(restaurants => callback(null, restaurants))
            .catch(error => callback(error, null));
        }
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `img/${
      restaurant.photograph ? restaurant.photograph : DBHelper.NO_IMAGE
    }`;
  }

  /**
   * Map marker for a restaurant.
   */
  // static mapMarkerForRestaurant(restaurant, map) {
  //   // https://leafletjs.com/reference-1.3.0.html#marker
  //   const marker = new L.marker(
  //     [restaurant.latlng.lat, restaurant.latlng.lng],
  //     {
  //       title: restaurant.name,
  //       alt: restaurant.name,
  //       url: DBHelper.urlForRestaurant(restaurant)
  //     }
  //   );
  //   marker.addTo(newMap);
  //   return marker;
  // }
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

  /**
   * postRequest
   */
  static postRequest(pathToAPI, data) {
    const headers = new Headers({ "Content-Type": "application/json" });
    const body = JSON.stringify(data);
    return fetch(pathToAPI, {
      method: "POST",
      headers: headers,
      body: body
    })
      .then(this.validateResponse)
      .then(this.readResponseAsText);
    // Once the promise resolves, the text data is passed to logResult.
    // .then(this.logResult)
    // .catch(this.logError);
  }
}

/**
 * Write reviews data to object store reviews.
 * The saveReviewsDataLocally function takes an array of objects and adds
 * or updates each object to the IndexedDB database. The store.put operations
 * happen inside a Promise.all. This way if any of the put operations fail,
 * we can catch the error and abort the transaction. Aborting the transaction
 * rolls back all the changes that happened in the transaction so that if any
 * of the events fail to put, none of them will be added to the object store.
 *
 * TODO: this function doesn't seem to work when there's only one review...
 * Error: Uncaught (in promise) DOMException: Failed to execute 'put' on
 * 'IDBObjectStore': Evaluating the object store's key path did not yield
 * a value.
 */
function saveReviewsDataLocally(reviews) {
  if (!("indexedDB" in window)) {
    return null;
  }
  return dbPromise.then(db => {
    const tx = db.transaction("reviews", "readwrite");
    const store = tx.objectStore("reviews");
    // Don't use Promise.all when there's only one review.
    if (reviews.length > 1) {
      return Promise.all(reviews.map(review => store.put(review))).catch(() => {
        tx.abort();
        throw Error("[ERROR] Reviews were not added to the store.");
      });
    } else {
      store.put(reviews);
    }
  });
}

// Get reviews by id data from object store reviews, using the index on
// restaurant_id
function getLocalReviewsByIdData(id) {
  if (!("indexedDB" in window)) {
    return null;
  }
  return dbPromise.then(db => {
    const tx = db.transaction("reviews", "readonly");
    const store = tx.objectStore("reviews");
    const index = store.index("restaurant_id");
    // Make sure you're using a number for id.
    return index.getAll(parseInt(id));
  });
}
