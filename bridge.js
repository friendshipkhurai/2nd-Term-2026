/****************************************************
 * FRIENDSHIP EDUCATIONAL ACADEMY
 * GITHUB PAGES → GOOGLE APPS SCRIPT
 ****************************************************/

const FEA_API_URL =
  "https://script.google.com/macros/s/AKfycbzWLvO2ADPj3hWJsX-1Je-wC0ax30C1nEUp1E0xfpSc4Y-bDpBP8OXT-2j_3PyTQAgvZA/exec";


(function () {

  /*
   * If this page is actually running inside Apps Script,
   * don't replace the real google.script.run.
   */
  if (
    window.google &&
    window.google.script &&
    window.google.script.run
  ) {
    console.log("FEA: Native Apps Script environment detected.");
    return;
  }


  console.log("FEA: GitHub API bridge loaded.");


  window.google = window.google || {};
  window.google.script = window.google.script || {};


  function Runner() {

    this.successHandler = null;
    this.failureHandler = null;

    return new Proxy(this, {

      get: function (target, property) {

        /*
         * Existing chain methods
         */
        if (property === "withSuccessHandler") {

          return function (callback) {

            target.successHandler =
              typeof callback === "function"
                ? callback
                : null;

            return target;
          };
        }


        if (property === "withFailureHandler") {

          return function (callback) {

            target.failureHandler =
              typeof callback === "function"
                ? callback
                : null;

            return target;
          };
        }


        if (property === "withUserObject") {

          return function () {
            return target;
          };
        }


        /*
         * Any other property is treated as
         * the Apps Script server function.
         */
        return function () {

          var args =
            Array.prototype.slice.call(arguments);

          callFEA(
            property,
            args,
            target.successHandler,
            target.failureHandler
          );

          return target;
        };
      }
    });
  }


  function callFEA(
    functionName,
    args,
    successHandler,
    failureHandler
  ) {

    console.log(
      "FEA API →",
      functionName,
      args
    );


    fetch(FEA_API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({

        functionName: functionName,

        args: args

      })

    })

    .then(function (response) {

      console.log(
        "FEA HTTP:",
        response.status,
        response.url
      );

      if (!response.ok) {

        throw new Error(
          "HTTP " + response.status
        );
      }

      return response.text();
    })


    .then(function (text) {

      console.log(
        "FEA RAW RESPONSE:",
        text
      );


      var data;

      try {

        data = JSON.parse(text);

      } catch (e) {

        throw new Error(
          "Google Apps Script returned invalid JSON: " +
          text.substring(0, 500)
        );
      }


      if (!data.success) {

        throw new Error(
          data.error ||
          "Google Apps Script request failed."
        );
      }


      if (successHandler) {

        successHandler(data.result);

      }

    })


    .catch(function (error) {

      console.error(
        "FEA API ERROR:",
        functionName,
        error
      );


      if (failureHandler) {

        failureHandler({

          message:
            error.message ||
            String(error),

          name:
            error.name ||
            "FEA_API_ERROR"

        });

      }

    });

  }


  window.google.script.run =
    new Runner();


  /*
   * Direct test helper.
   */
  window.testFEAConnection = function () {

    console.log(
      "Testing FEA Apps Script connection..."
    );


    fetch(FEA_API_URL, {

      method: "GET",

      redirect: "follow"

    })

    .then(function (response) {

      console.log(
        "GET status:",
        response.status
      );

      return response.text();

    })

    .then(function (text) {

      console.log(
        "GET response:",
        text
      );

      alert(
        "FEA connection response:\n\n" +
        text
      );

    })

    .catch(function (error) {

      console.error(
        "FEA CONNECTION ERROR:",
        error
      );

      alert(
        "FEA connection failed:\n\n" +
        error.message
      );

    });

  };


})();
