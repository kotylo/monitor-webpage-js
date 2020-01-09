const https = require("https");
const open = require("open");
const moment = require("moment");
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let doLoop = true;
let allowedToLoad = true;

init();
async function init(){
    var msg = 'Hello World. Starting!';
    console.log(msg);
    let nextSleep = 6;
    let notLoadedCount = 0;
    while(doLoop){
        if (allowedToLoad){
            notLoadedCount = 0;
            loadPage();
        }else{
            notLoadedCount++;
        }

        if (notLoadedCount > 5){
            // reset loading 
            console.log("Not loaded count is too high, try loading again...");
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
        method: 'GET'
    };

    allowedToLoad = false;
    const req = https.request(options, res => {
        //console.log(`Status: ${res.statusCode}.`);
        res.on("data", d => {
            allowedToLoad = true;
            //process.stdout.write(d);
            if (d.includes("leider keine") || d.includes(" kein ")){
                console.log(`${moment()}: no tickets.`);
            }else{
                console.log(res.statusCode + ". Maybe a ticket?");
                if (d.includes("campaign-man-select")){
                    console.log("Keyword has been found!");
                }else{
                    console.log("Probably not a ticket: " + d);
                }

                open("https://www.intersport.at/skitag/gratis-tickets", {app: ["chrome"]});
                open("assets/ode_to_joy.mp3");
                doLoop = false;
            }
        });
    });
    
    req.on("error", e => {
        console.log(`Error happened: ${e}`);
        allowedToLoad = true;
    });
    
    req.end();
}