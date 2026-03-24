//Random Code Generator:
const quotes=
["The only way to do great work is to love what you do. - Steve Jobs",
"In the middle of difficulty lies opportunity. - Albert Einstein",
"Be yourself; everyone else is already taken. - Oscar Wilde",
"The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
"It is during our darkest moments that we must focus to see the light. - Aristotle",
"The only impossible journey is the one you never begin. - Tony Robbins",
"Life is what happens when you're busy making other plans.- John Lennon",
"The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
"You miss 100% of the shots you don't take.- Wayne Gretzky",
"Whether you think you can or you think you can't, you're right. - Henry Ford",
"The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
"The way to get started is to quit talking and begin doing. - Walt Disney",
"Don't watch the clock; do what it does. Keep going. - Sam Levenson",
"The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
"Everything you've ever wanted is on the other side of fear. - George Addair",
"Success is not final, failure is not fatal: it is the courage to continue that counts.- Winston Churchill",
"Believe you can and you're halfway there. - Theodore Roosevelt",
"The mind is everything. What you think you become.- Buddha",
"The best revenge is massive success.- Frank Sinatra",
"Do not go where the path may lead, go instead where there is no path and leave a trail. - Ralph Waldo Emerson"

];
const button=document.querySelector('button');
const quote=document.querySelector('h1');

button.addEventListener('click',()=>{
    const index=Math.floor(Math.random()*20);

    quote.textContent=quotes[index];

})
















