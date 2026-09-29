/****************************************************
 * FRIENDSHIP EDUCATIONAL ACADEMY
 * GITHUB PAGES → GOOGLE APPS SCRIPT BRIDGE
 *
 * File:
 *     /js/bridge.js
 *
 * This replaces google.script.run on GitHub Pages.
 ****************************************************/

(function () {

    "use strict";

    console.log("FEA bridge.js: STARTING");


    /************************************************
     * YOUR GOOGLE APPS SCRIPT WEB APP URL
     ************************************************/

    var API_URL =
        "https://script.google.com/macros/s/AKfycbzWLvO2ADPj3hWJsX-1Je-wC0ax30C1nEUp1E0xfpSc4Y-bDpBP8OXT-2j_3PyTQAgvZA/exec";


    var requestCounter = 0;


    /************************************************
     * CREATE GOOGLE.SCRIPT.RUN COMPATIBILITY LAYER
     ************************************************/

    function createRunner() {

        var runner = {};

        var successHandler = null;
        var failureHandler = null;


        /********************************************
         * withSuccessHandler()
         ********************************************/

        runner.withSuccessHandler = function (callback) {

            successHandler =
                typeof callback === "function"
                    ? callback
                    : null;

            return runner;
        };


        /********************************************
         * withFailureHandler()
         ********************************************/

        runner.withFailureHandler = function (callback) {

            failureHandler =
                typeof callback === "function"
                    ? callback
                    : null;

            return runner;
        };


        /********************************************
         * withUserObject()
         ********************************************/

        runner.withUserObject = function () {

            return runner;
        };


        /********************************************
         * PROXY
         *
         * Any unknown method becomes an Apps Script
         * server-side function.
         ********************************************/

        return new Proxy(runner, {

            get: function (target, property) {

                if (property in target) {

                    return target[property];

                }


                return function () {

                    var args =
                        Array.prototype.slice.call(
                            arguments
                        );


                    callGoogleAppsScript(
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


    /************************************************
     * CALL GOOGLE APPS SCRIPT
     ************************************************/

    function callGoogleAppsScript(
        functionName,
        args,
        successHandler,
        failureHandler
    ) {

        requestCounter++;

        var callbackName =
            "__FEA_CALLBACK_" +
            Date.now() +
            "_" +
            requestCounter;


        var script =
            document.createElement("script");


        var completed = false;


        /********************************************
         * GLOBAL JSONP CALLBACK
         ********************************************/

        window[callbackName] =
            function (response) {

                if (completed) {

                    return;

                }

                completed = true;


                console.log(
                    "FEA response:",
                    functionName,
                    response
                );


                try {

                    if (
                        response &&
                        response.success === true
                    ) {

                        if (
                            typeof successHandler ===
                            "function"
                        ) {

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
                                    : "Unknown Google Apps Script error"

                        };


                        console.error(
                            "FEA API ERROR:",
                            functionName,
                            error
                        );


                        if (
                            typeof failureHandler ===
                            "function"
                        ) {

                            failureHandler(error);

                        }

                    }

                } catch (callbackError) {

                    console.error(
                        "FEA callback error:",
                        callbackError
                    );

                } finally {

                    cleanup();

                }

            };


        /********************************************
         * CLEANUP
         ********************************************/

        function cleanup() {

            try {

                delete window[callbackName];

            } catch (e) {

                window[callbackName] =
                    undefined;

            }


            if (script.parentNode) {

                script.parentNode.removeChild(
                    script
                );

            }

        }


        /********************************************
         * NETWORK ERROR
         ********************************************/

        script.onerror =
            function () {

                if (completed) {

                    return;

                }

                completed = true;


                var error = {

                    message:
                        "Cannot connect to Google Apps Script.\n" +
                        "Check the Apps Script Web App deployment and URL."

                };


                console.error(
                    "FEA NETWORK ERROR:",
                    functionName
                );


                if (
                    typeof failureHandler ===
                    "function"
                ) {

                    failureHandler(error);

                }


                cleanup();

            };


        /********************************************
         * BUILD REQUEST
         ********************************************/

        var query =
            "?api=github" +
            "&functionName=" +
            encodeURIComponent(
                functionName
            ) +
            "&args=" +
            encodeURIComponent(
                JSON.stringify(args)
            ) +
            "&callback=" +
            encodeURIComponent(
                callbackName
            );


        var requestURL =
            API_URL + query;


        console.log(
            "FEA REQUEST:",
            functionName,
            args
        );


        /********************************************
         * SEND JSONP REQUEST
         ********************************************/

        script.src =
            requestURL;


        document.head.appendChild(
            script
        );

    }


    /************************************************
     * INSTALL google.script.run
     ************************************************/

    window.google =
        window.google || {};


    window.google.script =
        window.google.script || {};


    window.google.script.run =
        createRunner();


    console.log(
        "FEA bridge.js: google.script.run READY"
    );


    /************************************************
     * DIRECT API FUNCTION
     *
     * Optional:
     *
     * feaCall("getClassList")
     *
     * feaCall("getStudentResult", "IX(Nine)", "1")
     ************************************************/

    window.feaCall =
        function (functionName) {

            var args =
                Array.prototype.slice.call(
                    arguments,
                    1
                );


            return new Promise(
                function (resolve, reject) {

                    callGoogleAppsScript(
                        functionName,
                        args,
                        resolve,
                        reject
                    );

                }
            );

        };


    /************************************************
     * CONNECTION TEST
     ************************************************/

    window.testFEAConnection =
        function () {

            console.log(
                "FEA: Testing connection..."
            );


            window.google.script.run

                .withSuccessHandler(
                    function (classes) {

                        console.log(
                            "FEA: GOOGLE APPS SCRIPT CONNECTED"
                        );

                        console.log(
                            "Classes:",
                            classes
                        );


                        alert(
                            "CONNECTED TO GOOGLE APPS SCRIPT!\n\n" +
                            "Classes received:\n\n" +
                            classes.join(
                                "\n"
                            )
                        );

                    }
                )

                .withFailureHandler(
                    function (error) {

                        console.error(
                            "FEA: CONNECTION FAILED",
                            error
                        );


                        alert(
                            "CONNECTION FAILED\n\n" +
                            (
                                error &&
                                error.message
                                    ? error.message
                                    : error
                            )
                        );

                    }
                )

                .getClassList();

        };


    /************************************************
     * SIMPLE PAGE LOAD TEST
     ************************************************/

    window.feaBridgeStatus =
        function () {

            return {

                bridge: true,

                apiURL: API_URL,

                googleScriptRun:
                    !!(
                        window.google &&
                        window.google.script &&
                        window.google.script.run
                    )

            };

        };


})();
