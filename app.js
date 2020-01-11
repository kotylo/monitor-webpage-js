const https = require("https");
const open = require("open");
const moment = require("moment");
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let doLoop = true;
let allowedToLoad = true;
const pauseCount = 5;

init();
async function init(){
    console.log("Hello World. Starting!");
    let nextSleep = 6;
    let notLoadedCount = 0;
    while(doLoop){
        if (allowedToLoad){
            notLoadedCount = 0;
            loadPage();
        }else{
            console.log(`Making a pause ${notLoadedCount} of ${pauseCount}...`);
            notLoadedCount++;
        }

        if (notLoadedCount > pauseCount){
            // reset loading 
            console.log(`Not loaded count is too high (${pauseCount}), try loading again...`);
            allowedToLoad = true;
        }
        await sleep(nextSleep * 1000);
        nextSleep = 2 + Math.floor(Math.random() * 5);
    }
}

function loadPage(){
    const options = {
        hostname: 'intersport.traumgutscheine.com',
        port: 443,
        path: '/lottery_cart.php?camp_id=9',
        method: 'GET',
        timeout: 300 // sometimes timeout indicates success too
    };

    allowedToLoad = false;

    let startTime = new Date().getTime();
    const req = https.request(options, res => {
        console.log(`Status: ${res.statusCode}.`);
        res.on("data", d => {
            allowedToLoad = true;
            //process.stdout.write(d);
            if (d.includes("leider keine") || d.includes("diesmal kein ")){
                console.log(`${moment()}: no tickets. ${timePassed(startTime)} ms.`);
            }else{
                console.log(`${moment()}. Status: ${res.statusCode}. Maybe a ticket?`);
                if (d.includes("campaign-man-select")){
                    console.log(`${moment()}: Keyword has been found!`);
                }else{
                    console.log(`${moment()}: Probably not a ticket: ${d}`);
                }

                successAction();
                doLoop = false;
                allowedToLoad = false;
            }
        });
    });
    
    req.on("error", e => {
        console.log(`Error happened: ${e}.`);
    });

    req.on("timeout", async e => {
        console.log(`Timeout happened, time ${timePassed(startTime)} ms.`);
        req.abort();

        // try calling it again, to check the double timeout
        await sleep(700);
        let startTime2 = moment();
        const req2 = https.request(options, res => {
            res.on("data", d => {
                console.log('Got the data on second request after timeout, ok.');
                allowedToLoad = true;
            });
        });
        req2.on("timeout", e => {
            console.log(`Timeout2 happened, time ${timePassed(startTime2)} ms. Do the successAction now!`);
            req2.abort();

            // open the website just in case
            successAction();
            allowedToLoad = false;
        });
        req2.on("error", e => {
            console.log(`Error2 happened: ${e}.`);
        });
        req2.end();
    });
    
    req.end();
}

function timePassed(startTime) {
    return moment() - startTime;
}

function successAction() {
    open("https://www.intersport.at/skitag/gratis-tickets", { app: ["chrome"] });
    open("assets/ode_to_joy.mp3");
}
