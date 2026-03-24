const user={
    name:"Rohit",
    age:23,
    emailId:"pandey@gmail.com",
    amount:23400,
    "home address":"dwarka"
}
console.log(user);

console.log(user.age);
console.log(user["home address"]);



// CRUD Operation:
//1. Create:
user.aadhar=233234766987;

//2. Update:
user.amount=44300;
console.log(user);

//3. Delete:
delete user.emailId;
console.log(user);


// important take:
const user2=user;
user2.age=28;

console.log(user);
// here if user is equals to user then if we change elements in user2 then it will also changes in user as there is copy by reference.

//to refer only keys:
console.log(Object.keys(user2));

//to refer only values:
console.log(Object.values(user2));

//to refer both keys and values:
console.log(Object.entries(user2));


// or we can also acces keys or values by using loops:
for(let keys in user){
    console.log(keys)
}

//if we want keys with their values:
for(let keys in user){
    console.log( keys,user[keys])
}

//new e.g:
const user3={
    name:"Rohit",
    age:23,
    emailId:"pandey@gmail.com",
    amount:23400,
    "home address":"dwarka"
}

const {name,age,amount}=user3;

console.log(name,age,amount);
//using loops:
//1. to access values:
for(let values of Object.keys(user3)){
    console.log(values);
}
//2. to access keys:
for(let keys of Object.keys(user3)){
    console.log(keys);
}
//3. to access entries:
for(let data of Object.entries(user3)){
    console.log(data);
}




//same example for array:

const arr=[29,453,5533,"Aditya",43];
const [first,second,third,fourth]=arr;

console.log(first,second,third,fourth);


// creating functions inside Objects:

const user4={
    name:"Rohit",
    age:23,
    emailId:"pandey@gmail.com",
    amount:23400,
    "home address":"dwarka",
    greeting:function(){
        console.log(`strike is coming on 18th october by ${this.name}`); //this keyword has the refrernce of user4 and then it calling the name of the  user4.
        return 20;
    }
}
user4.greeting();

via=user4.greeting();
console.log(via);



//Nested Objects:

const user5={
    name:"Rohit", 
    age:23,
    emailId:"pandey@gmail.com",
    amount:23400,
    "home address":"dwarka",
    address:{
        city:"Gorakhpur",
        state:"Uttar Pradesh"
    }
}
console.log(user5);

console.log(user5.address.city);


