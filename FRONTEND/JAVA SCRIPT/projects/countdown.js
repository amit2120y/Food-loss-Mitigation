const result=document.getElementById('result')
setInterval(()=>{
        
    let Period=Date.now();

    console.log(Period);

    const Future_period=new Date(2027,0,1).getTime();

    console.log(Future_period);

    needed_time= Future_period-Period;
    console.log(needed_time);
    const day=Math.floor(needed_time/(1000*60*60*24));
    needed_time%=1000*60*60*24
    const hour=Math.floor(needed_time/(1000*60*60));
    needed_time%=1000*60*60
    const minutes=Math.floor(needed_time/(1000*60));
    needed_time%=1000*60
    const seconds=Math.floor(needed_time/(1000));


    result.textContent=`${day}:days ${hour}:hours ${minutes}:minutes ${seconds}:seconds`



},1000)




