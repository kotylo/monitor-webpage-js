const https = require("https");
const open = require("open");
const moment = require("moment");
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let doLoop = true;

init();
async function init(){
    var msg = 'Hello World. Starting!';
    console.log(msg);
    let nextSleep = 6;
    while(doLoop){
        loadPage();
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
    const req = https.request(options, res => {
        //console.log(`Status: ${res.statusCode}.`);
        res.on("data", d => {
            //process.stdout.write(d);
            if (d.includes("leider keine") || d.includes(" kein ")){
                console.log(`${moment()}: no tickets.`);
            }else{
                console.log(res.statusCode + ". maybe a ticket? " + d);
                open("https://www.intersport.at/skitag/gratis-tickets", {app: ["chrome"]});
                doLoop = false;
            }
        });
    });
    
    req.on("error", e => {
        console.log(`Error happened: ${e}`);
    });
    
    req.end();
}