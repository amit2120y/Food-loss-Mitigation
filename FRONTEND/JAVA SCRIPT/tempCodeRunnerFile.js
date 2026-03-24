
//example:
function blinkitOrderPlaced(){
    console.log("we have started packing your order");
}

function zomatoOrderPlaced(){
    console.log("we are preparing your food");
}

function payment(amount,callback){
    console.log(`${amount} payment has initailized`);
    console.log("payment is reccieved");
    callback();
}

payment(500,zomatoOrderPlaced);
payment(400,blinkitOrderPlaced);
