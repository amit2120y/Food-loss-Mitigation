//OPERATORS
//1. Arithmetic:

console.log(2+5);
console.log(2-5);
console.log(2*5);
console.log(6/2);
console.log(5%2);  //remainder
console.log(5**2);  //square
console.log(5**3);  //cube.....

//2 Assingment Operator:
let x=20;
let y=10;
x=x+y;

console.log(x);

x=x-y;

console.log(x);


//3. Comparision Operator:
let a=10;
let b=20;

console.log(a>b);
console.log(a<b);
console.log(a<=b);
console.log(a<=b);
console.log(a==b);

let p=10;
let q="10";  //now it's a string
console.log(p==q); // "==="used for comaparision between two diffrent types and tells whether they are equal or not

//e.g;
let z="10";
let m=Number(z);

console.log(m);
console.log(typeof m);

//e.g;
let k="112aac";
let l=Number(k);

console.log(0/0);
console.log( typeof l);

//e.g;
let c=10;
let d=String(c);

console.log(d);
console.log(typeof d);

//e.g;

let e=true;

console.log(Number(true));
console.log(Number(false));
console.log(Number(null));
console.log(Number(undefined));

 

//LOOPS:
// 1. For Loop:
for(let i=0;i<10;i++){
    console.log(i);  //post increment
}

for(let i=10;i>2;i--){
    console.log(i);   //post decrement
}
//2. WHILE LOOP:
let i=0;

while(i<10){
    console.log(i);
    i++;
}


// DO WHILE LOOP
let f=0;

do{
    console.log(f);
    f++;
}
while(f<10);


// conditionals statements
//1. If Else conditions:
let age=15;
if(age>=18){
    console.log("Eligible For Vote");
}
else{
    console.log("Not Eligible");
}

//2. 
let age1=25;
if(age1>=18){
    console.log("Young");
}
else if(age>60){
    console.log("Old");
}
else{
    console.log("kid");
}


//LOGICAL OPERATOR:
//1. And Operator:if one false then all false
console.log(true&&true);
console.log(true&&false);
console.log(false&&false);
console.log(false&&true);

//2. Orr Operator: if one true then all true
console.log(true || false);
console.log(true || true);
console.log(false || true);
console.log(false || false);


//e.g:
let a1="Mohit";
let a2="Rohit";

let c1=a1&&a2;

console.log(c1);   
// here,as the operation performed btwn a1 and a2 and there is "&&"operator in between them as it will check the first value which is correct then it will go to  a2 which is also correct so it will print the second value but if our first value is wrong it will print false because if first valuue is false then no need to go to second value to check whteher its wrong or right example is below:

let d1="";
let d2="Ram";

 let c2=d1&&d2;

console.log(c2);











