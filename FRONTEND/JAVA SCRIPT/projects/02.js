const first=document.getElementById('first');


first.addEventListener('click',(e)=>{
    // console.log(e.target);
    const child=e.target;
    const body=document.querySelector('body');
    body.style.backgroundColor=child.id;
})



































