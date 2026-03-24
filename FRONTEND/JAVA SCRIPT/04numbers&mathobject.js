//operations on numbers:
let a=10;
let b=345.5543;
let c=b.toFixed(1);
console.log(c);
console.log(typeof c);
console.log(b.toFixed(3));
console.log(typeof b.toFixed(2));  // as the numbers are immutable so value of b can't be changed so its string the new data in the form of "string"
console.log(b);
console.log(typeof b);


console.log(b.toPrecision(5)); // it will print output on the basis of digits.


console.log(b.toString());
console.log(typeof b.toString());


//creating a number by new way:
let a3=new Number(20);
let b3=20;

console.log(a3);
console.log(typeof a3);

console.log(b3);
console.log(typeof b3);




// important take:
let a4=new Number(30);
let b4=new Number(30);

console.log(a4==b4);   // here a4 is also 30 and  b4 is also 30 but our output is false beacuse of the fact that they are objects and they got allocated to diffrent memories so thet are not equal;it will be more clear by below example:

let obj1={
    name:"Rohit"
} 
let obj2={
    name:"Rohit"
}
console.log(obj1==obj2);


//"math" object:
console.log(Math.abs(-4));

console.log(Math.PI);

console.log(Math.LN10);

console.log(Math.SQRT2);

console.log(Math.ceil(2.3));

console.log(Math.floor(2.3));

console.log(Math.log10(20));

console.log(Math.max(20,10,332,342,454));



console.log(Math.random());  //it genrates the random number between 0 and 1 in which 0 is included but not 1.


console.log(Math.random()*10);




console.log(Math.floor(Math.random()*10)+1); //now it will generate value from 1 to 10 while earlier it was 0 to 9.

// FORMULA TO GET NUMBER OF OUTCOMES:Math.floor(Math.random()*totalNumberofOutcomes)+shift



//Little Bit Experiment:
m1=Math.random()*6;
console.log(m1);
console.log(Math.floor(m1));
console.log(Math.ceil(m1));



//Generating a random number in the range of 15-25:
console.log(Math.floor(Math.random()*11)+15) //here 11 iss because we need total of 11 numbers that is number of outcomes
//formula: Math.floor(Math.random()*(max-min+1))+min    (don't learn formula,logic is simple) 



// APPLICATIONS:4 DIGIT OTP GENERATE
m2=Math.floor(Math.random()*8999)+1000;
//or
m2=Math.floor(Math.random()*(9999-1000+1))+1000;
console.log(m2)
