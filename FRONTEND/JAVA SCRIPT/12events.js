// OnClick event with defining it in HTML file


function handleClick(){
   const element= document.getElementById("first");
   element.textContent="strike is coming";
}



// OnClick event with defining it in HTML file:

const element=document.getElementById("first");
element.onclick=function handleClick(){
    element.textContent="strike is coming";
}

element.onclick=function handleClick(){
    element.textContent="I am the best";
}
// This Method is also not preferable because it can override the earlier content and cannot be changed further.


// Best Way::
 const element= document.getElementById("first");
 
element.addEventListener('click',()=>{
    element.textContent="India Is Great";
})

element.addEventListener('click',()=>{
    element.style.backgroundColor="Pink";
})

// there are many events like;"dblclick","mouseenter","mouseleave" etc


const child1=document.getElementById("child1");
child1.addEventListener('click',()=>{
    child1.textContent="I am Clicked";
})

// or

const select=document.getElementById("parent");
for(let child of select.children){
    child.addEventListener('click',()=>{
        child.textContent="I am clicked";
    })
}


// BUBBLING IN JAVA SCRIPT:
const grandparent=document.getElementById("grandparent");
grandparent.addEventListener('click',(e)=>{
    console.log(e);
    // console.log("Grandparent is clicked");
    e.stopPropagation();
    console.log(e.target);
},true)

const parent2=document.getElementById("parent2");
parent2.addEventListener('click',(e)=>{
    console.log(e);
    e.stopPropagation();
    // console.log("Parent2 is clicked");
},false)

const childA=document.getElementById("childA");
childA.addEventListener('click',(e)=>{
    console.log(e);
    e.stopPropagation();
    // console.log("childA is clicked");
},false)
 
//important take:here "true" and "false" indicates that whether the "capture" is "Onn" Or "Off".If the capture face is Of then it will move from up to down like (Window-->Document-->HTML-->Body-->Grandparent-->Parent-->child.) and if it is On then event will be go down to up(i.e:Bubbling Phase)


// here (e) is PointerEvent which tells many details about the event that is performed like when we clickk a particular section then what is the distance of that point from the x-axis or y-axis and many more.


