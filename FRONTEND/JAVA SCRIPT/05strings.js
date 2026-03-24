//STRING:
const str1="Rohit";
const str2="be ready";
const str3="strike is coming soon";  
console.log(str1,str2,str3);

//in the above code the problem is that we can't put double or single inverted commas i.e "" in next line it will show error show that's why we use back tick i.e ` ` and in it there is no error,example is below:


const str4=`pandey strike is 
coming soon`;
console.log(str4);  // most immportant

const day=18;
const str5=`pandey strike is coming on ${day}`;

console.log(str5);

//to know the length of a string:
console.log(str5.length); 

console.log(str5[5]); 
        
console.log(str5.toUpperCase());
a=str5.toUpperCase();

console.log(a);
console.log(typeof a);
b=a.toLowerCase();
console.log(b);

console.log(str5.toLowerCase());



const str6=`hello everyone`;
//upper and lower case
a=str6.toUpperCase();
console.log(str6.indexOf('eve'));
//to know the index of particular portion in a string:
console.log(a.indexOf('ONE'));


//SLICE
const str7=`hello everyone welcome to the tutorial`;

console.log(str7.slice(6,11)); //here the 2nd index is included but not the 11th one.
 
console.log(str7.slice(3)); //here it will just slice the first indeces that are given and gives rest as output.

console.log(str7.slice(-3)); //it will return the last inputs as per the given number of indices. 

console.log(str7.slice(-5,-1));
console.log(str7.substring(2,5));



//attaching multiple strings:
const a="Narottam";
const b="Pandey";

const c=a+" "+b;

console.log(c);



//"replace" and "replace all":
const str8=`hello coders welcome to the coder army`;
console.log(str8.replace("coder","team"));//it will just change the first coming words not all
console.log(str8.replaceAll("coder","team")); //it will change the whole word no matter how many time it comes in the string



const user=" Rohit ";
console.log(user.trim());  //it removes the starting and ending spaces.


const names="Rohit,Mohit,Harshit,Ankit,Pulkit";
console.log(names.split(","));   //it will return the elements in the array form.

const names1="Rohit Mohit Harshit Ankit Pulkit";
console.log(names1.split(" ")); 







//DATE:


const now=new Date();

console.log(now);  //it shows date and time according to the UTC(universal time coordinate);

console.log(now.toString()); //now it will show time and date according to GMT.

console.log(now.getDay()); //days:monday-tuesday(starts from 1)

console.log(now.getMonth());//months:January-December(starts from 0 that means january will be counted as 0th months and december will be counted as 11th month.)
console.log(now.getFullYear()); 



const now1=Date.now();
console.log(now1);//it will date in milliseconds.

const dates=new Date(1759558588379);
console.log(dates); //now it will date according to UTC

local_date=dates.toString();
console.log(local_date);

