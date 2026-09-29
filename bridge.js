/****************************************************
 * FEA GITHUB BRIDGE
 * JSONP VERSION
 ****************************************************/

(function () {

  console.log("FEA bridge.js loaded");


  var API_URL =
    "https://script.google.com/macros/s/AKfycbzWLvO2ADPj3hWJsX-1Je-wC0ax30C1nEUp1E0xfpSc4Y-bDpBP8OXT-2j_3PyTQAgvZA/exec";


  var requestCounter = 0;


  function createRunner() {

    var successHandler = null;
    var failureHandler = null;


    var runner = {};


    runner.withSuccessHandler = function (fn) {

      successHandler =
        typeof fn === "function"
          ? fn
          : null;

      return runner;
    };


    runner.withFailureHandler = function (fn) {

      failureHandler =
        typeof fn === "function"
          ? fn
          : null;

      return runner;
    };


    runner.withUserObject = function () {

      return runner;
    };


    return new Proxy(runner, {

      get: function (target, property) {

        /*
         * Existing methods
         */
        if (property in target) {
          return target[property];
        }


        /*
         * Apps Script server function
         */
        return function () {

          var args =
            Array.prototype.slice.call(
              arguments
            );


          callApi(
            property,
            args,
            successHandler,
            failureHandler
          );


          return runner;
        };

      }

    });

  }


  function callApi(
    functionName,
    args,
    successHandler,
    failureHandler
  ) {

    requestCounter++;

    var callbackName =
      "__feaCallback" +
      requestCounter;


    var script =
      document.createElement("script");


    var finished = false;


    window[callbackName] =
      function (response) {

        finished = true;


        try {

          if (
            response &&
            response.success
          ) {

            console.log(
              "FEA SUCCESS:",
              functionName,
              response.result
            );


            if (successHandler) {
              successHandler(
                response.result
              );
            }

          } else {

            var error = {

              message:
                response &&
                response.error
                  ? response.error
                  : "Unknown Apps Script error"

            };


            console.error(
              "FEA ERROR:",
              functionName,
              error
            );


            if (failureHandler) {
              failureHandler(error);
            }

          }

        } finally {

          cleanup();

        }

      };


    function cleanup() {

      try {
        delete window[callbackName];
      } catch (e) {}

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

    }


    script.onerror =
      function () {

        if (finished) return;

        finished = true;

        var error = {
          message:
            "Unable to connect to Google Apps Script."
        };


        console.error(
          "FEA CONNECTION ERROR:",
          functionName
        );


        if (failureHandler) {
          failureHandler(error);
        }


        cleanup();

      };


    var params =
      "?api=github" +
      "&functionName=" +
      encodeURIComponent(functionName) +
      "&args=" +
      encodeURIComponent(
        JSON.stringify(args)
      ) +
      "&callback=" +
      encodeURIComponent(callbackName);


    script.src =
      API_URL + params;


    console.log(
      "FEA REQUEST:",
      functionName
    );


    document.head.appendChild(script);

  }


  /*
   * Replace google.script.run
   */
  window.google =
    window.google || {};

  window.google.script =
    window.google.script || {};


  /*
   * If GitHub page does not have native
   * Apps Script API, install our bridge.
   */
  window.google.script.run =
    createRunner();


  /*
   * Public connection test.
   */
  window.testFEAConnection =
    function () {

      console.log(
        "Testing Google Sheet connection..."
      );


      var success =
        function (classes) {

          console.log(
            "CONNECTED TO GOOGLE SHEET",
            classes
          );


          alert(
            "CONNECTED!\n\n" +
            "Classes received:\n" +
            classes.join(", ")
          );

        };


      var failure =
        function (error) {

          console.error(
            error
          );


          alert(
            "CONNECTION FAILED:\n\n" +
            error.message
          );

        };


      window.google.script.run
        .withSuccessHandler(success)
        .withFailureHandler(failure)
        .getClassList();

    };


})();
