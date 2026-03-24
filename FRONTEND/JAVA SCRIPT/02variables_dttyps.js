//variables
let name="Pandey";

let age=8;
console.log(name,age);
age=20;
console.log(name,age);

const account=1234;   //here "const" keyword is used so that it can't be changed further like we have done earlier
console.log(account);  


// Data Types:
// Premitive Data types:Numbers,Strings,Boolean,Undefined,Null,Symbol,Bright
//  Non-Premitive Data Types:Arrays,Object,Function
 
//A. Primitive Data Types:
// 1. Numbers
let a=10;
  let b=20.5;
  console.log(a,b);

// 2. Strings
let c="strike is coming";
let d="Rohit";

console.log(c,d);
console.log(typeof c, typeof d);


// 3.Boolean
let login=true;
let f=false;

console.log(login,f);


// 4. Undefined
let user;
console.log(user); //if variable is declared and no value is defined in them then it will give output "undefined"

//5. Bigint (big integer)
let num=23332343231332334546576879802n;
console.log(num);

//6. Null
let weather=null;
console.log(weather);


//7. Symbol
const id1=Symbol("id");
const id2=Symbol("id");
console.log(id2==id1);


//B. Non-Primitive Data Types:
//1. Array:
let arr=[10,20,30,40,"NP",true];
console.log(arr);

//2. Object:
let obj={
  name:"rohit",
  account:12343,
  age:18,
  category:'General'
}
console.log(obj);

// e.g:

function add(){
  console.log("Hello")
}

add();

// WE MAY STORE A FUNCTION INSIDE A VARIABLE IN JAVA SCRIPT.IT'S A PROPERTY IN JAVA SCRIPT WHICH HAS MANY USECASES
// e.g:2

let s=function add(){
  console.log("Hello")
}

console.log(s)
console.log(typeof s);

//IMPORTANT TAKE:Primitive Data Types like numbers,strings etc are immutable in Java Script that means it cannot be changed further if once declared.It actually seems to be changed but not changes,it's just point the new data without manipualting the old one.


// proof:
let str="Apple";

console.log(str[1]);
str[1]="S";

console.log(str[1]); 


console.log(str);
 //here as we changed the 1st index of apple from p to s so it must pe changed but it doesn't changed that means Primitive data types are IMMUTABLE



// NEW TAKE: NON-PRIMITIVE DATA TYPES ARE MUTALE THAT MEANS THEY CAN BE CHANGED FURTHER IF ONCE DECLARED


//eg1:
let Array =[10,20,45,34];

Array[0]=70
Array.push(90);

console.log(Array);


//eg2:
let object ={
  name:"Hari",
  age:30,
  address:"Gkp"
}

object.address="Deoria";

console.log(object.address);
console.log(object);



