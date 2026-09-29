/****************************************************
 * FRIENDSHIP EDUCATIONAL ACADEMY
 * GITHUB → GOOGLE APPS SCRIPT BRIDGE
 ****************************************************/

const FEA_API_URL =
  "https://script.google.com/macros/s/AKfycbzWLvO2ADPj3hWJsX-1Je-wC0ax30C1nEUp1E0xfpSc4Y-bDpBP8OXT-2j_3PyTQAgvZA/exec";


/****************************************************
 * INTERNAL API CALL
 ****************************************************/

function feaApiCall_(functionName, args) {

  return fetch(FEA_API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      functionName: functionName,

      args: Array.isArray(args)
        ? args
        : []

    })

  })

  .then(function(response) {

    if (!response.ok) {

      throw new Error(
        "Google Apps Script returned HTTP " +
        response.status
      );

    }

    return response.text();

  })

  .then(function(text) {

    var response;

    try {

      response = JSON.parse(text);

    } catch (e) {

      console.error(
        "Invalid response from Google Apps Script:",
        text
      );

      throw new Error(
        "Invalid response received from Google Apps Script."
      );

    }


    if (!response.success) {

      throw new Error(
        response.error ||
        "Google Apps Script request failed."
      );

    }


    return response.result;

  });

}


/****************************************************
 * google.script.run COMPATIBILITY LAYER
 *
 * This allows your existing HTML files to continue
 * using:
 *
 * google.script.run
 *   .withSuccessHandler(...)
 *   .withFailureHandler(...)
 *   .functionName(...)
 ****************************************************/

(function() {

  if (
    window.google &&
    window.google.script &&
    window.google.script.run
  ) {

    // Already running inside Apps Script.
    return;

  }


  window.google = window.google || {};

  window.google.script =
    window.google.script || {};


  function Runner() {

    this._successHandler = null;

    this._failureHandler = null;

  }


  Runner.prototype.withSuccessHandler =
    function(callback) {

      this._successHandler =
        typeof callback === "function"
          ? callback
          : null;

      return this;

    };


  Runner.prototype.withFailureHandler =
    function(callback) {

      this._failureHandler =
        typeof callback === "function"
          ? callback
          : null;

      return this;

    };


  Runner.prototype.withUserObject =
    function() {

      // Compatibility only.
      return this;

    };


  Runner.prototype._execute =
    function(functionName, args) {

      var self = this;


      feaApiCall_(functionName, args)

        .then(function(result) {

          if (self._successHandler) {

            self._successHandler(result);

          }

        })

        .catch(function(error) {

          console.error(
            "FEA API Error:",
            functionName,
            error
          );


          if (self._failureHandler) {

            self._failureHandler({

              message:
                error.message ||
                String(error),

              name:
                error.name ||
                "APIError"

            });

          } else {

            console.error(
              "Unhandled FEA API error:",
              error
            );

          }

        });

    };


  var proxy = new Proxy(

    new Runner(),

    {

      get: function(target, property) {

        // Existing compatibility methods
        if (property in target) {

          return target[property];

        }


        // Any other property is treated as
        // an Apps Script server function.

        return function() {

          var args =
            Array.prototype.slice.call(
              arguments
            );


          target._execute(
            property,
            args
          );

          // Return target so that chained calls
          // continue to work.
          return target;

        };

      }

    }

  );


  window.google.script.run = proxy;


})();


/****************************************************
 * DIRECT API HELPER
 *
 * Optional use:
 *
 * feaCall("getClassList")
 * feaCall("getStudentResult", cls, roll)
 ****************************************************/

function feaCall(functionName) {

  var args =
    Array.prototype.slice.call(arguments, 1);

  return feaApiCall_(
    functionName,
    args
  );

}


/****************************************************
 * CONNECTION TEST
 ****************************************************/

function testFEAConnection() {

  return fetch(FEA_API_URL, {

    method: "GET"

  })

  .then(function(response) {

    if (!response.ok) {

      throw new Error(
        "Connection failed: HTTP " +
        response.status
      );

    }

    return response.json();

  })

  .then(function(data) {

    console.log(
      "FEA Google Apps Script connection:",
      data
    );

    return data;

  })

  .catch(function(error) {

    console.error(
      "FEA Google Sheets connection failed:",
      error
    );

    throw error;

  });

}
