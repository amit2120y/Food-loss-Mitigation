//prototypes:

const obj={
    name:"Ankit",
    age:23,
    greet:function(){
        console.log("hello")
    }
};
 
// greet function()

const obj2={
    account:30
}

obj2.__proto__=obj;
console.log(obj2.name)

// object1 and object2 is created  and we have wrote that obj2.__proto__=obj then object2 is linked and points to object2 

 


// CLASS IN Java Script:


class PersonA{
    constructor(name,age){
    this.name=name;
    this.age=age;

}
sayhi(){
    console.log('hi ${this.name}');
}
}
// const Person1=new PersonA("Rohit",20);
// const person2=new PersonA("Mohit",23);

// console.log(Person1.age);
// console.log(Person1.name);

// console.log(person2.name);

// console.log(Person1.sayhi());


class Customer extends PersonA{
    constructor(name,age,account,balance){
        super(name,age);
        this.account=account;
        this.balance=balance;

    }
    checkBalance(){
        return this.balance;
    }
}
const c1=new Customer("Mohan",20,21,32,456);
console.log(c1);
// console.log(c1.sayhi());
console.log(c1.balance);






