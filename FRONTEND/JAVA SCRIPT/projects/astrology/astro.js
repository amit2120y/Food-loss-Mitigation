const zodiac_signs=[ "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"]

const complement=["You are very emotional but strong from inside.",
  "You think a lot… sometimes too much.",
  "You are different from others.",
  "People misunderstand you, but your intentions are pure.",
  "You have leadership qualities.",
  "You are very kind-hearted.",
  "You don’t trust people easily.",
  "Once you decide something, you stick to it.",
  "You are spiritual by nature.",
  "You attract people without trying.",
  "You have suffered a lot in life.",
  "You are lucky, but luck comes late.",
  "You are very intelligent, but you underestimate yourself.",
  "Your mind is always running.",
  "You are honest, that’s why you face problems.",
  "You care deeply for family.",
  "You are born to do something big.",
  "You have a strong intuition.",
  "You are sensitive but not weak.",
  "Your time is coming."]

const victimcard_complements=[ "You suffer more than others, but you never show it.",
    "People take advantage of your kindness.",
    "You give too much and receive too little.",
    "Life has tested you from a very young age.",
    "You have faced betrayal from close people.",
    "You are too pure for this world.",
    "Your silence hides a lot of pain.",
    "You sacrifice your happiness for others.",
    "You never get credit for what you do.",
    "You attract jealous people easily.",
    "You trust people who don’t deserve it.",
    "Your good heart brings you problems.",
    "You have been unlucky in relationships.",
    "People misunderstand your intentions.",
    "You carry emotional burden alone.",
    "You help everyone, but no one helps you.",
    "You were born with struggles in your chart.",
    "You stay strong even when life is unfair.",
    "You deserve much more than what you got.",
    "God is testing you because you are special."]

const recommendations=["Wear a gemstone after proper consultation.",
  "Chant a specific mantra daily.",
  "Visit a temple on a particular weekday.",
  "Donate food or clothes on Saturdays.",
  "Avoid wearing dark colors on certain days.",
  "Wake up early and face the sun in the morning.",
  "Keep fast on a specific weekday.",
  "Feed cows, birds, or dogs regularly.",
  "Avoid negative people and arguments.",
  "Light a diya every evening.",
  "Keep your house clean and clutter-free.",
  "Wear silver or gold according to your planet.",
  "Avoid lending money during this phase.",
  "Recite Hanuman Chalisa / Gayatri Mantra.",
  "Wear a thread or bracelet for protection.",
  "Drink water from a copper vessel.",
  "Avoid major decisions during Rahu–Ketu period.",
  "Perform a small puja at home.",
  "Respect elders and teachers.",
  "Have patience—time will improve."]
const predictions=[
  "A big change is coming in your life soon.",
  "This year will be better than the last one.",
  "You will face some challenges, but you’ll overcome them.",
  "Financially, things will slowly improve.",
  "Someone from your past may reconnect with you.",
  "You may feel confused right now, but clarity will come.",
  "Career growth is indicated after some delay.",
  "Be careful with decisions in the next few months.",
  "Good news is coming related to work or studies.",
  "Your hard work will finally pay off.",
  "Travel is indicated in your chart.",
  "There may be tension in relationships for a short time.",
  "Health needs a little attention, nothing serious.",
  "A new opportunity will present itself unexpectedly.",
  "You will receive support from an unexpected person.",
  "Avoid trusting people blindly during this phase.",
  "A wish of yours will be fulfilled, but late.",
  "This phase is teaching you patience.",
  "Success will come step by step, not suddenly.",
  "By the end of this period, things will stabilize."
];



 const astroform= document.getElementById('astroform');

 astroform.addEventListener('submit',(e)=>{
  e.preventDefault();

  const name=document.getElementById('name').value;
  const surname=document.getElementById('surname').value;
  const day=parseInt(document.getElementById('day').value);
  const month=parseInt(document.getElementById('month').value);
  const year=parseInt(document.getElementById('year').value);


  const text=`Hii ${name} ${surname} your zodiac sign is ${zodiac_signs[month-1]}.${complement[day%10]}.${victimcard_complements[year%20]}.${recommendations[(day*month)%30]}.${predictions[({name}.length*surname.length)%20]}`;

  document.getElementById('result').textContent=text;



})










