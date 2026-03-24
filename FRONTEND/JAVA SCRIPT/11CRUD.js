const newElement=document.createElement("h2");
newElement.textContent="strike is coming";
newElement.id="second";

const element=document.getElementById("first");
element.after(newElement);

const newElement2=document.createElement('h3');
newElement2.textContent="Diwali is coming soon";
newElement2.id="third";

newElement2.classList.add("Diwali");
newElement2.classList.add("Holi");

newElement2.style.backgroundColor="pink";
newElement2.style.fontSize="20px";

const element2=document.getElementById("second");

element2.after(newElement2);
console.log(newElement2.getAttribute("class"));

// const list=document.createElement("li");
// list.textContent="Milk";
// const list2=document.createElement("li");
// list2.textContent="Cake";
// const list3=document.createElement("li");
// list3.textContent="Halwa";
// const list4=document.createElement("li");
// list4.textContent="Paneer";

// const unorderElement=document.getElementById("listing");

// unorderElement.append(list);
// unorderElement.append(list2);
// unorderElement.prepend(list3);

// // list.after(list4);

// unorderElement.children[1].after(list4);


// OR

const arr=["milk","cake","paneer","halwa","tea","tofu"];


const unorderElement=document.getElementById("listing");
const fragment=document.createDocumentFragment();

for(let food of arr){
    const list=document.createElement("li");
    list.textContent=food;
    fragment.append(list);
    // console.log(food);
}

unorderElement.append(fragment);


// const s1=document.getElementById("first");
// s1.remove();




 


