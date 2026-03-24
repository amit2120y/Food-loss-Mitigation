function greeting(){
    console.log("Hello Everyone!Strike is coming on 18th October")
}

greeting();



function addNumbers(num1,num2){
    const sum=num1+num2;
    console.log(sum);
}

addNumbers(85,454);


//spread operator and rest operator:
const arr=[12,34,19,45];
const arr1=[12,34,19,45];

const[first,second,...num]=arr;

console.log(first,second,num);

const ans=[...arr,...arr1];
console.log(ans);




//function:expression
const addNumber=function(a,b){
    return a+b
}

console.log(addNumber(3,4));

//orr:
console.log(addNumber(3,4));

function addNumber(num1,num2){
    return num1+num2;
}

//orr:arrow function:

const addNum=(num1,num2)=>{
    return num1+num2;
}

console.log(addNum(3,4));
//above arrow function can also be written as :

const addNumb=(num1,num2)=>num1+num2;

console.log(addNumb(3,4));



//IIFE(immediately envoked function):
(function greeting(){
    console.log("hello all");
})();

//or:

(()=>{
    console.log("hii");
})();


//function callback:
function greet(){
    console.log("hello all!")
}
function greet1(callback){
    console.log("i am going to meeet someone");
    callback();
    console.log("i have scheduled meeting");

}

greet1(greet);



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



