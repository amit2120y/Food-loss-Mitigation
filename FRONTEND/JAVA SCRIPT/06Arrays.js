let marks=[100,20,30,54,34];

console.log(marks);
console.log(marks.length);

let arr=[100,20,"abhay","ankit",true];
arr[1]="ashish";

console.log(arr);
arr.push("Mohit");  //add  elemnt in the last of an array

console.log(arr);

arr.pop(); //remove last element from array

console.log(arr);

arr.unshift(20);
console.log(arr);  //add elements at starting index

arr.shift(20);
console.log(arr);  //remove first elements from array.


let arr1 = [12,23,45,75];

for(let i=0;i<arr1.length;i++){
    console.log(arr1[i]);
}

for(let num of arr1){
    console.log(num)
}


let arr2=[12,34,54,34];
arr2=arr1;

arr2.push(290);
console.log(arr1);


const arr3=[233,442,34,"dvdvv"];

const arr4=arr3.slice(2,4); //splice remove the elements in the range of given indexes.

console.log(arr4);

const arr5=arr3.splice(1,3);
console.log(arr3);
console.log(arr5);

const arr6=arr3.splice(1,2,"Pandey",22);
console.log(arr3);
console.log(arr6);

//SPREAD OPEARTOR:


const new_arr=[...marks,...arr,...arr1,...arr2,...arr3];
console.log(new_arr); //spread operator break each array in elements and combine every elements in one array.


//JOIN :
const names2=["Ram","Shyam","Hari"];

console.log(names2.toString());

console.log(names2.join("-"));

//simple aearching (by index):
console.log(names2.indexOf("Hari"));
console.log(names2.includes("Hari"));


//SORTING:
const names3=["Alice","Bob","Charlie","bob","bob","Mohit","Ankit"];

console.log(names3.join("-"));

console.log(names3.indexOf("Bob")); // it will show  first index

console.log(names3.lastIndexOf("bob"));// it will show last index.

console.log(names3.includes("bob"));

names3.sort();
console.log(names3); //here it shorts the array but if oj the basis ASCII table that means the lowercaase words will come in the end.

names3.reverse();
console.log(names3);


const arr_1=[101,90,80,32,91];
arr_1.sort();

console.log(arr_1); //here we didn't get actual result as we expected because sorting performed on the basis of ASCII table and here the array first converted into string and then it matches with thE ASCII table and output generates on that.If we want the aactual result then:

const arr_2=[10,23,45,97];

arr_2.sort((a,b)=> a-b);
console.log(arr_2);

arr_2.sort((a,b)=> b-a);
console.log(arr_2);


const arr_3=[10,23,43,32,[23,45,11,256],34,65];

console.log(arr_3);
console.log(arr_3[4]);
console.log(arr_3[4][2]);

a=arr_3.flat();
console.log(a);

const arr_4=[10,23,43,32,[23,45,[244,65,45,76],11,256],34,65];

b=arr_4.flat(2); // now it will flat both the inner arrays so if we want to flat an array inside an array which is inside in another array we can provide the number of times we have to flat in () here it's (2).
console.log(b);


const arr_5=[10,23,43,32,[23,45,[244,65,[344,54,76,67,72],45,76],11,256],34,65];

c=arr_5.flat(Infinity);
console.log(c);



