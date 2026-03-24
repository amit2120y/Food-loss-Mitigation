//scope(global scope,functional scope and block level scope),closures,HOF
let a=10;
const b=20;

function greet(){
    console.log(a);
}

greet();


let global=30;

function greet(){
    let global=40;
    function meet(){
        console.log(global);  // here the the function will firstly look that whether the "global"variable is whether declared in function meet if it's then it will print it's value and if not it will go to it's just outer scope if it's present there then it will print that and repeated ......
    }
    meet();
}
greet();


function createcounter(){
    function increment(){
        console.log("i am increment function");
    } 
    return increment();
}   

const count=createcounter();
console.log(count);


function createcounting(){

    let count=0;
    function increment(){

        count++;
        return count;

    }

    return increment;
}

const couter=createcounting();

couter();

console.log(couter());
console.log(couter());
console.log(couter());


// e.g:
let user={
    balance:500,
    deposit:function(amount){
        if (typeof amount==="number"&& amount>0){
            this.balance+=amount;
            return this.balance;
            }
    },
    withdraw:function(amount){
        if(typeof amount==="number"&& amount>0 && this.balance>=amount){
            this.balance-=amount;
            return this.balance;
        }
    },
    getBalance: function(){
        return this.balance;
    }
}
console.log(user.deposit(300));
console.log(user.getBalance());
console.log(user.withdraw());



//higher order function:passing a function as a argument in another function.
function double(value){

    return function execute(num){
       return num+value;
    }
}

const n=double(20);
console.log(n(5));








