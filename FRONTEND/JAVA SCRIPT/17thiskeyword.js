// ' use strict '
// var a=10;
// b=20;

// console.log(a,b);


'use strict'
function greet(name1,name2){
    console.log(name1,name2);
}
greet("Rohit","Mohit");


//This keyword in Global Scope :IN Node JS it points an empty object i.e. {} but in browser it will points to global object.

'use strict'

console.log(this);


//Function:
const user= {
    name3:"Abhay",
    age:22,
    address:"Noida",
    greet: function(){
        console.log(this);
        console.log(`hi ${this.name3}`);
    }
}
user.greet();  


//2:
'use strict'
function greet(){
    console.log(`hi ${this.name}`);
}

function incrementage(value,name){
    this.age+=value;
    this.name=name;
    console.log(this.age);
    console.log(this.name);
}

const user1={
    name:"Rohit",
    age:30,
}

const user2={
    name:"Mohit",
    age:33
}

greet.call(user1);
greet.call(user2);

incrementage.call(user1,25,"Narottam");
incrementage.call(user2,55,"Ankit");

const incr=incrementage.bind(user2,10,"Mohan");
console.log(incr);
incr();

incrementage.apply(user2,10,"Mohan");

//in Normal function, non-strict mode will point to global object and in Strict Mode it will point to "Undefined".
// Call,Apply and Bind :all these points to the incoking object





//ARROW Function:"This" keyword doesn't exist for Arrow function,it taakes it from laxical environment scope.ś 
'use strict'

const greet=()=>{
    console.log(this);
}
greet();





