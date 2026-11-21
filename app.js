'use strict';

const views = {
  intro: document.getElementById('intro'),
  meeting: document.getElementById('meeting'),
  gallery: document.getElementById('gallery'),
  ending: document.getElementById('ending')
};
const painting = document.getElementById('painting');
const gallery = views.gallery;
const count = document.getElementById('count');
const steps = document.getElementById('steps');
const nextButton = document.getElementById('next');
const backButton = document.getElementById('back');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const memories = ['stadium','hike','cinema','ramen','birthday','dance'];
const paintingSources = memories.map(scene => './assets/' + scene + '.webp');
// The six watercolor postcards are real image assets, not placeholder SVGs.
paintingSources.forEach(src => { const image = new Image(); image.src = src; });
const descriptions = [
  'Two capybaras in the stands at a soccer match.',
  'Two capybaras together on an autumn hiking trail.',
  'Two capybaras watching a film in a little cinema.',
  'Two capybaras enjoying ramen and Chinese pastries.',
  'Two capybaras celebrating a birthday with arepas and empanadas.',
  'Two capybaras dancing together in a studio.'
];
let current = -1;
let busy = false;
let sequence = 0;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function show(name) {
  Object.entries(views).forEach(([key,el])=>{
    const visible = key === name;
    el.classList.toggle('hidden', !visible);
    el.setAttribute('aria-hidden', String(!visible));
  });
}

// All characters use the same proportions, ear shapes, faces, blue scarf and violet bow.
// These are real scalable vector illustrations; no missing placeholders or remote assets.
function capyFigure(female=false, opts={}) {
  const scarf = !female && opts.scarf !== false;
  const hat = opts.party || false;
  const pack = opts.pack || false;
  const dancing = opts.dance || false;
  const brown = '#c88c5b', shade = '#b5794b', outline = '#795641';
  const flip = female ? 'translate(240 0) scale(-1 1)' : '';
  let a = '<g transform="' + flip + '">';
  a += '<ellipse cx="113" cy="158" rx="74" ry="14" fill="#775953" opacity=".13"/>';
  a += '<path d="M42 128C40 92 62 65 104 63C151 61 169 91 179 119C190 152 163 173 117 173H83C54 173 41 156 42 128Z" fill="'+brown+'" stroke="'+outline+'" stroke-width="3.6" stroke-linejoin="round"/>';
  a += '<ellipse cx="70" cy="153" rx="14" ry="20" fill="'+brown+'" stroke="'+outline+'" stroke-width="3"/>';
  a += '<ellipse cx="140" cy="157" rx="14" ry="18" fill="'+brown+'" stroke="'+outline+'" stroke-width="3"/>';
  if(pack) a += '<rect x="42" y="93" width="34" height="55" rx="13" fill="'+(female?'#b18abf':'#7f9eb1')+'" stroke="'+outline+'" stroke-width="3"/><path d="M67 101Q89 79 100 101" fill="none" stroke="'+outline+'" stroke-width="3"/>';
  a += '<path d="M113 86C117 55 153 34 189 42C216 47 228 68 225 96C222 125 204 139 169 139C133 139 107 117 113 86Z" fill="'+brown+'" stroke="'+outline+'" stroke-width="3.8"/>';
  a += '<ellipse cx="141" cy="48" rx="16" ry="18" fill="'+brown+'" stroke="'+outline+'" stroke-width="3.5"/>';
  a += '<ellipse cx="179" cy="44" rx="15" ry="17" fill="'+brown+'" stroke="'+outline+'" stroke-width="3.5"/>';
  a += '<ellipse cx="142" cy="51" rx="6" ry="7" fill="'+shade+'" opacity=".8"/>';
  a += '<ellipse cx="178" cy="47" rx="5" ry="7" fill="'+shade+'" opacity=".8"/>';
  a += '<ellipse cx="206" cy="105" rx="29" ry="22" fill="#daaa80" stroke="'+outline+'" stroke-width="3"/>';
  a += '<path d="M168 85q10-8 19 1" fill="none" stroke="'+outline+'" stroke-width="4" stroke-linecap="round"/>';
  a += '<ellipse cx="172" cy="104" rx="13" ry="7" fill="#f0a3a9" opacity=".82"/>';
  a += '<path d="M224 102q-3 3-7 1" fill="none" stroke="'+outline+'" stroke-width="3" stroke-linecap="round"/>';
  a += '<path d="M214 116q-7 8-14 3" fill="none" stroke="'+outline+'" stroke-width="2.2" stroke-linecap="round"/>';
  if(scarf) {
    a += '<path d="M109 111Q136 127 156 122L160 142Q129 146 109 134Z" fill="#4b78bc" stroke="#315b94" stroke-width="2.7"/>';
    a += '<path d="M114 135L88 169L108 175L134 143Z" fill="#4b78bc" stroke="#315b94" stroke-width="2.5"/>';
    a += '<path d="M98 170l12 5M91 162l12 6" stroke="#315b94" stroke-width="2"/>';
  }
  if(female) {
    a += '<path d="M164 43C142 25 146 13 163 18Q178 21 184 33C197 17 216 22 209 38Q204 49 186 48" fill="#a97bc7" stroke="#74539a" stroke-width="3" stroke-linejoin="round"/>';
    a += '<circle cx="184" cy="39" r="8" fill="#c9a1e1" stroke="#74539a" stroke-width="2.5"/>';
  }
  if(hat) {
    a += '<path d="M148 37L169 -21L194 37Z" fill="'+(female?'#b797d3':'#8ea9da')+'" stroke="'+outline+'" stroke-width="3"/>';
    a += '<path d="M156 17L185 27M162 0L178 8" stroke="#fef6ec" stroke-width="5"/>';
    a += '<circle cx="169" cy="-25" r="8" fill="#f7d890"/>';
  }
  if(dancing) {
    a += '<path d="M105 137Q80 121 61 116" fill="none" stroke="'+outline+'" stroke-width="9" stroke-linecap="round"/>';
    a += '<ellipse cx="59" cy="116" rx="10" ry="8" fill="'+brown+'" stroke="'+outline+'" stroke-width="2"/>';
  }
  return a + '</g>';
}
function character(female=false,opts={}) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 190" aria-hidden="true">' + capyFigure(female,opts) + '</svg>';
}
function placeCapy(x,y,s=1,female=false,opts={}) {
  return '<g transform="translate('+x+' '+y+') scale('+s+')">' + capyFigure(female,opts) + '</g>';
}
function rearCapy(x,y,s=1,female=false){
  return '<g transform="translate('+x+' '+y+') scale('+s+')">' +
  '<ellipse cx="105" cy="156" rx="72" ry="13" fill="#6c5355" opacity=".15"/>' +
  '<path d="M39 130C39 79 68 62 116 60C166 57 192 90 192 137Q192 171 153 172H84Q38 173 39 130Z" fill="#c78a58" stroke="#75533f" stroke-width="4"/>' +
  '<ellipse cx="144" cy="78" rx="49" ry="44" fill="#c98c5c" stroke="#75533f" stroke-width="4"/>' +
  '<ellipse cx="109" cy="42" rx="14" ry="16" fill="#bb7b4e" stroke="#75533f" stroke-width="3"/>' +
  '<ellipse cx="157" cy="40" rx="14" ry="17" fill="#bb7b4e" stroke="#75533f" stroke-width="3"/>' +
  (female ? '<path d="M144 38Q120 14 129 10Q145 3 158 27Q177 5 186 18Q189 34 164 41" fill="#af83cc" stroke="#755590" stroke-width="3"/><circle cx="159" cy="32" r="7" fill="#b993d3"/>' :
  '<path d="M51 102Q92 126 177 103L184 124Q114 151 49 128Z" fill="#4f7abb" stroke="#315f93" stroke-width="3"/><path d="M65 126L42 159L64 164L91 133" fill="#4f7abb" stroke="#315f93" stroke-width="3"/>') + '</g>';
}
function clouds() {
  return '<g fill="#fff9f1" opacity=".65"><ellipse cx="145" cy="95" rx="77" ry="16"/><ellipse cx="176" cy="82" rx="39" ry="26"/><ellipse cx="696" cy="112" rx="83" ry="17"/><ellipse cx="660" cy="96" rx="35" ry="25"/></g>';
}
function stars(){
  return '<g fill="#fff5d6" opacity=".9"><circle cx="90" cy="72" r="3"/><circle cx="242" cy="42" r="2.5"/><circle cx="619" cy="65" r="3"/><circle cx="791" cy="97" r="2.5"/><path d="M746 40v16m-8-8h16M367 61v13m-6-6h12" stroke="#fff1c0" stroke-width="3" stroke-linecap="round"/></g>';
}
function bush(x,y,s=1,color='#87a28c'){
  return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="0" rx="42" ry="25" fill="'+color+'"/><ellipse cx="-33" cy="5" rx="21" ry="17" fill="'+color+'"/><ellipse cx="31" cy="8" rx="28" ry="20" fill="'+color+'"/></g>';
}
function pine(x,y,s=1,c='#718d7d'){
  return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-6 0V85H6V0" fill="#956f58"/><path d="M0-91L-46-6H-25L-55 34H55L25-6H46Z" fill="'+c+'" stroke="#648270" stroke-width="3" stroke-linejoin="round"/></g>';
}
function leafy(x,y,s=1,c='#c99a65'){
  return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-4 14V123H6V14" fill="#936e59"/>' +
  '<circle cx="-34" cy="-2" r="31" fill="'+c+'"/><circle cx="14" cy="-25" r="39" fill="'+c+'"/><circle cx="52" cy="4" r="32" fill="'+c+'"/><circle cx="0" cy="23" r="39" fill="'+c+'"/>' +
  '<circle cx="-26" cy="-24" r="10" fill="#eac58e" opacity=".45"/><circle cx="36" cy="-15" r="10" fill="#f4d3aa" opacity=".45"/></g>';
}
function flower(x,y,c='#eac0b5'){
  return '<g transform="translate('+x+' '+y+')"><path d="M0 0v24" stroke="#819780" stroke-width="2"/><path d="M0 10q-10-9-11-2q4 8 11 8" fill="#819780"/><circle cx="-6" cy="-4" r="5" fill="'+c+'"/><circle cx="6" cy="-4" r="5" fill="'+c+'"/><circle cy="-10" r="5" fill="'+c+'"/><circle cy="4" r="5" fill="'+c+'"/><circle r="4" fill="#f9df9e"/></g>';
}
const gradients = '<defs>' +
  '<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#bdc8ed"/><stop offset=".6" stop-color="#f7d8d5"/><stop offset="1" stop-color="#f8c8a9"/></linearGradient>' +
  '<linearGradient id="sea" x2="0" y2="1"><stop stop-color="#9baed9"/><stop offset="1" stop-color="#7e98b5"/></linearGradient>' +
  '<linearGradient id="wood" x2="0" y2="1"><stop stop-color="#e6ba98"/><stop offset="1" stop-color="#c99175"/></linearGradient>' +
  '</defs>';
function makeSvg(inner,label) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+label.replace(/"/g,'&quot;')+'">' + gradients + inner + '</svg>';
}
function soccer(){
  let crowd='';
  for(let r=0;r<4;r++){for(let i=0;i<29;i++){crowd+='<circle cx="'+(22+i*31+(r%2)*11)+'" cy="'+(238+r*22)+'" r="'+(4+r%2)+'" fill="'+(['#fbe2b6','#b39ac9','#e6a5a5','#89a2bf'][((i*3)+r)%4])+'"/>';}}
  return makeSvg(
    '<rect width="900" height="540" fill="url(#sky)"/>'+clouds()+
    '<path d="M0 224Q440 101 900 220V390H0Z" fill="#8582a7"/><path d="M0 261Q440 139 900 255" stroke="#e9c7bc" stroke-width="17" fill="none"/>' +
    '<path d="M0 318Q440 188 900 318V432H0Z" fill="#6b728e"/>'+crowd+
    '<ellipse cx="455" cy="366" rx="340" ry="116" fill="#e9e1ce"/><ellipse cx="455" cy="360" rx="322" ry="102" fill="#6d9b79"/>' +
    '<ellipse cx="455" cy="355" rx="275" ry="80" fill="none" stroke="#f7f0e4" stroke-width="6"/><path d="M455 275v155M180 354h551" stroke="#f7f0e4" stroke-width="4"/>' +
    '<circle cx="455" cy="354" r="45" fill="none" stroke="#f7f0e4" stroke-width="4"/>' +
    '<path d="M45 255L66 80M857 255L835 80" stroke="#746f89" stroke-width="11"/>' +
    '<rect x="31" y="76" width="69" height="26" rx="4" fill="#fff1c9"/><rect x="798" y="76" width="69" height="26" rx="4" fill="#fff1c9"/>' +
    '<path d="M0 470Q450 417 900 470V540H0Z" fill="#a06c75"/>' +
    rearCapy(190,310,.95,false)+rearCapy(485,311,.95,true)+
    '<path d="M0 503Q450 456 900 503" stroke="#e5a7b4" stroke-width="11" fill="none"/>',
    descriptions[0]
  );
}
function hike(){
  return makeSvg(
    '<rect width="900" height="540" fill="url(#sky)"/>'+clouds()+
    '<path d="M0 314L142 122L250 294L415 76L595 318L751 153L900 333V540H0Z" fill="#9daec1"/>' +
    '<path d="M89 195L142 122L187 198M347 174L415 76L484 178M710 214L751 153L801 228" fill="#f8f7f1"/>' +
    '<path d="M0 329Q225 267 419 340T900 297V540H0Z" fill="#91a68a"/>' +
    pine(85,318,1.12,'#719884')+pine(785,319,1.23,'#769282')+
    leafy(83,259,1.08,'#dca36b')+leafy(836,245,1.13,'#d5aa6c')+
    '<path d="M0 496Q226 386 432 433T900 396V540H0Z" fill="#b8b992"/>' +
    '<path d="M330 540Q448 438 591 458Q673 462 752 540Z" fill="#e3c9a0"/>' +
    bush(367,420,1,'#899f84')+bush(580,443,.6,'#94a88f')+
    placeCapy(250,282,.85,false,{pack:true})+placeCapy(515,283,.85,true,{pack:true})+
    flower(88,462,'#f4c0a0')+flower(811,465,'#e9bed0')+flower(758,448,'#ead0a0'),
    descriptions[1]
  );
}
function cinema(){
  let seats='';
  for(let row=0;row<2;row++){for(let i=0;i<11;i++){const x=-10+i*92;const y=409+row*74;seats+='<rect x="'+x+'" y="'+y+'" width="78" height="100" rx="24" fill="'+(row===0?'#975b72':'#b27187')+'" stroke="#824c63" stroke-width="6"/>';}}
  return makeSvg(
    '<rect width="900" height="540" fill="#4f4059"/>' +
    '<rect x="100" y="38" width="700" height="341" rx="9" fill="#d9b7a3"/><rect x="118" y="53" width="666" height="311" fill="#a4b2d5"/>' +
    '<path d="M118 302Q257 234 401 304T784 289V364H118Z" fill="#8897b9"/><path d="M118 326Q260 289 410 321T784 310V364H118Z" fill="#607d9f"/>' +
    '<circle cx="640" cy="148" r="46" fill="#f7e3d0" opacity=".85"/>'+stars()+
    '<path d="M449 270v-118l4 118M445 269l-75-11h138Z" fill="#f6e7d9" opacity=".8"/><path d="M436 277q27 16 55 0" stroke="#566a8e" stroke-width="7" fill="none"/>' +
    '<path d="M0 0H142Q50 172 125 366L0 414Z" fill="#8e556a" stroke="#ad7483" stroke-width="11"/>' +
    '<path d="M900 0H755Q850 172 774 366L900 414Z" fill="#8e556a" stroke="#ad7483" stroke-width="11"/>'+
    seats+rearCapy(180,315,.95,false)+rearCapy(493,315,.95,true)+
    '<path d="M448 423l-22-52h68l-10 52Z" fill="#fff4d9"/><path d="M435 380l10 43m10-43l8 43m10-43l4 43" stroke="#d88b82" stroke-width="6"/>' +
    '<g fill="#ffe0a3"><circle cx="438" cy="372" r="13"/><circle cx="455" cy="368" r="13"/><circle cx="475" cy="370" r="12"/><circle cx="493" cy="374" r="12"/></g>',
    descriptions[2]
  );
}
function ramen(){
  const lantern = x=>'<g transform="translate('+x+' 60)"><path d="M0 -70v40" stroke="#6a4f4c" stroke-width="4"/><ellipse cy="4" rx="42" ry="48" fill="#e7a174" stroke="#bd755e" stroke-width="5"/><path d="M-40 5H40M-33-25H32M-30 32H29" stroke="#f5ce9c" stroke-width="6"/><path d="M0 52v27" stroke="#c78c70" stroke-width="5"/></g>';
  const bowl=x=>'<g transform="translate('+x+' 412)"><ellipse rx="106" ry="30" fill="#f3e7d9"/><path d="M-101 0Q-78 92 0 95Q78 92 101 0Z" fill="#85a4b5" stroke="#4b7188" stroke-width="5"/><ellipse rx="100" ry="30" fill="#f7e2ba" stroke="#4b7188" stroke-width="5"/><path d="M-64-5Q-38-34 6-9T68-6M-50 3Q3 30 52 0" fill="none" stroke="#e7b776" stroke-width="6"/><circle cx="42" cy="-7" r="16" fill="#fff9ed"/><circle cx="42" cy="-7" r="8" fill="#efb758"/></g>';
  return makeSvg(
    '<rect width="900" height="540" fill="#e7c8b4"/>' +
    '<rect x="135" y="15" width="630" height="322" rx="8" fill="#ac796b"/><rect x="154" y="34" width="592" height="285" fill="#f6d8b5"/>' +
    '<path d="M348 34v285M550 34v285M154 170h592" stroke="#ad7c6c" stroke-width="13"/>'+lantern(175)+lantern(720)+
    bush(54,330,1.1,'#87a88b')+bush(832,340,1,'#7f9d85')+
    placeCapy(136,175,1,false)+placeCapy(536,176,1,true)+
    '<rect x="0" y="402" width="900" height="138" fill="url(#wood)"/><path d="M0 414h900" stroke="#b67f6b" stroke-width="10"/>' +
    bowl(260)+bowl(642)+
    '<g transform="translate(442 470)"><ellipse rx="78" ry="29" fill="#f9e3cf" stroke="#c49d88" stroke-width="5"/><ellipse cx="-24" cy="-10" rx="28" ry="20" fill="#f6efdf"/><ellipse cx="28" cy="-11" rx="28" ry="19" fill="#f7efde"/></g>' +
    '<g transform="translate(433 510)"><ellipse rx="75" ry="19" fill="#f8e4d6"/><ellipse cx="-23" cy="-7" rx="19" ry="12" fill="#eeb864"/><ellipse cx="18" cy="-6" rx="20" ry="12" fill="#f2c677"/></g>' +
    '<path d="M309 300l-70 126m88-124l-68 125M711 305l-65 119m80-110l-63 117" stroke="#795944" stroke-width="6" stroke-linecap="round"/>',
    descriptions[3]
  );
}
function birthday(){
  const lights = Array.from({length:13},(_,i)=>'<circle cx="'+(37+i*70)+'" cy="'+(36+14*Math.sin(i/2))+'" r="9" fill="'+(i%2?'#f8d3a0':'#fbecd1')+'"/>').join('');
  return makeSvg(
    '<rect width="900" height="540" fill="#f5d9cf"/>' +
    '<rect x="0" y="0" width="900" height="304" fill="#edc1bd"/><rect x="210" y="44" width="480" height="256" rx="12" fill="#f7e9d9"/>' +
    '<rect x="240" y="70" width="420" height="190" fill="#d5e1ea"/><path d="M451 70v190M240 165h420" stroke="#f8f0e8" stroke-width="10"/>' +
    '<path d="M0 24Q450 86 900 19" fill="none" stroke="#bf8e8f" stroke-width="5"/>'+lights+
    bush(50,304,1,'#8fa78d')+bush(852,302,1,'#8ca48a')+
    placeCapy(122,177,1.02,false,{party:true})+placeCapy(545,174,1.02,true,{party:true})+
    '<rect x="0" y="399" width="900" height="141" fill="#e7b09e"/><path d="M0 406h900" stroke="#cc9182" stroke-width="8"/>' +
    '<ellipse cx="452" cy="469" rx="142" ry="30" fill="#f8eee3"/>' +
    '<path d="M376 453v-56q71-18 150 0v56q-68 28-150 0Z" fill="#fff4e9" stroke="#d4b4a7" stroke-width="4"/>' +
    '<ellipse cx="451" cy="398" rx="74" ry="24" fill="#fdf7ee"/>' +
    '<path d="M395 425q14 16 28 0t28 0t29 0t28 0" fill="none" stroke="#e7a7a1" stroke-width="10"/>' +
    '<path d="M453 375v-55" stroke="#ac85a9" stroke-width="8"/><path d="M453 309q-21 15 0 24q20-12 0-24Z" fill="#f0bd6e"/>' +
    '<ellipse cx="195" cy="466" rx="150" ry="35" fill="#fff2e6"/>' +
    '<g fill="#ecc480" stroke="#c99655" stroke-width="4"><ellipse cx="108" cy="459" rx="55" ry="22"/><ellipse cx="207" cy="451" rx="58" ry="24"/><ellipse cx="277" cy="470" rx="46" ry="21"/></g>' +
    '<ellipse cx="716" cy="468" rx="142" ry="32" fill="#fff2e6"/>' +
    '<g fill="#e9ad6e" stroke="#ba8253" stroke-width="3"><path d="M612 468q41-72 88 0q-42 23-88 0"/><path d="M687 467q42-70 85 0q-41 25-85 0"/><path d="M754 468q28-52 75 0q-33 24-75 0"/></g>',
    descriptions[4]
  );
}
function dance(){
  let notes = '<g fill="#9c76b8" font-family="serif" font-size="50" opacity=".8"><text x="108" y="132">♫</text><text x="738" y="155">♪</text><text x="575" y="80">♫</text></g>';
  return makeSvg(
    '<rect width="900" height="540" fill="#f1d6db"/>' +
    '<rect x="75" y="29" width="316" height="281" rx="6" fill="#fff8ed"/><rect x="93" y="47" width="280" height="245" fill="url(#sky)"/>' +
    '<path d="M234 47v245M93 171h280" stroke="#fff9f4" stroke-width="13"/>' +
    '<rect x="513" y="36" width="297" height="260" rx="5" fill="#fff8ed"/><rect x="529" y="54" width="265" height="221" fill="#decde5"/>' +
    '<path d="M662 54v221M529 165h265" stroke="#fff7f2" stroke-width="12"/>' +
    '<path d="M0 349H900" stroke="#a4848b" stroke-width="13"/><path d="M0 370H900" stroke="#e6c5b4" stroke-width="12"/>' +
    '<rect x="0" y="371" width="900" height="169" fill="url(#wood)"/>' +
    Array.from({length:11},(_,i)=>'<path d="M'+(i*90)+' 371l-80 169" stroke="#bf927c" stroke-width="3" opacity=".4"/>').join('') +
    notes+placeCapy(193,188,1.08,false,{dance:true})+placeCapy(526,189,1.08,true,{dance:true})+
    '<path d="M429 345q20-22 51-6" fill="none" stroke="#765541" stroke-width="9" stroke-linecap="round"/>' +
    '<circle cx="477" cy="338" r="9" fill="#c58b61" stroke="#765541" stroke-width="3"/>',
    descriptions[5]
  );
}
const illustrations = [soccer,hike,cinema,ramen,birthday,dance];

function footDuo() {
  // Walking through the museum, they are seen from behind looking at each painting.
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 200" aria-hidden="true">' +
    rearCapy(10,18,.75,false) + rearCapy(203,18,.75,true) + '</svg>';
}
function landscape() {
  return makeSvg(
    '<rect width="900" height="540" fill="url(#sky)"/>'+stars()+clouds()+
    '<circle cx="660" cy="244" r="94" fill="#fbdab7" opacity=".85"/>' +
    '<path d="M0 371L167 228L299 347L470 185L660 381L772 280L900 371V540H0Z" fill="#a5a8be"/>' +
    '<path d="M0 396Q210 318 446 393T900 350V540H0Z" fill="#8d9eac"/>' +
    '<path d="M0 431Q252 350 446 419T900 409V540H0Z" fill="#b9aaa7"/>' +
    '<path d="M0 471Q246 407 457 466T900 454V540H0Z" fill="#8da08b"/>' +
    bush(120,473,1.2,'#829787')+bush(780,482,1.1,'#829787')+
    rearCapy(217,327,1.02,false)+rearCapy(515,327,1.02,true)+
    flower(108,463,'#edb5c0')+flower(788,461,'#efd1bb'),
    'The two capybaras together, looking at the sunset over the mountains.'
  );
}
function diaryIntroCard() {
  return '<div class="gallery-note"><div class="gallery-note-card">' +
    '<div class="gallery-note-kicker">Our little gallery</div>' +
    '<p class="gallery-note-text">Here is our little diary of moments together.</p>' +
    '<span class="gallery-note-heart" aria-hidden="true">♡</span>' +
    '</div></div>';
}
function updateGallery(){
  if(current === -1){
    painting.innerHTML=diaryIntroCard();
    painting.setAttribute('aria-label','Here is our little diary of moments together.');
    count.textContent='♡';
    steps.innerHTML=memories.map(()=>'<span class="step"></span>').join('');
    backButton.disabled=true;
    nextButton.innerHTML='Start our diary <span aria-hidden="true">→</span>';
  } else {
    painting.innerHTML='<img class="painting-image" src="'+paintingSources[current]+'" alt="" loading="eager" decoding="async" draggable="false">';
    painting.setAttribute('aria-label',descriptions[current]);
    count.textContent=String(current+1).padStart(2,'0')+' / '+String(memories.length).padStart(2,'0');
    steps.innerHTML=memories.map((_,i)=>'<span class="step'+(i===current?' current':'')+'"></span>').join('');
    backButton.disabled=current===0;
    nextButton.innerHTML=current===memories.length-1
      ? 'One more thing <span aria-hidden="true">→</span>'
      : 'Keep walking <span aria-hidden="true">→</span>';
  }
  nextButton.disabled=false;
}
async function turn(nextIndex){
  if(busy || nextIndex < -1 || nextIndex > memories.length || nextIndex === current)return;
  if(nextIndex === memories.length){show('ending');return;}
  busy=true;
  nextButton.disabled=true;
  backButton.disabled=true;
  try{
    if(!reduced){gallery.classList.add('changing');await pause(500);}
    current=nextIndex;
    updateGallery();
    if(!reduced)await pause(280);
  } finally {
    gallery.classList.remove('changing');
    busy=false;
    nextButton.disabled=false;
    backButton.disabled=current<=0;
  }
}
async function begin(){
  if(busy)return;
  busy=true;
  document.getElementById('begin').disabled=true;
  document.getElementById('envelope').classList.add('opening');
  if(!reduced)await pause(950);
  show('meeting');
  if(!reduced)await pause(2600);
  current=-1;
  show('gallery');
  updateGallery();
  busy=false;
}
document.getElementById('meeting-him').innerHTML='<img src="./assets/capy-antony.webp" alt="" draggable="false">';
document.getElementById('meeting-her').innerHTML='<img src="./assets/capy-alice.webp" alt="" draggable="false">';
document.getElementById('walk-duo').innerHTML='<div class="walking-sprite" aria-hidden="true"></div>';
// Show the approved watercolor artwork; retain the original SVG only if the asset is not present.
const endingContainer = document.getElementById('ending-art');
const endingImage = new Image();
endingImage.className = 'ending-selected-art';
endingImage.alt = 'Two capybaras cuddling on a mountain at sunset, with a plane towards Brazil on the horizon.';
endingImage.onload = () => { endingContainer.replaceChildren(endingImage); };
endingImage.onerror = () => { endingContainer.innerHTML = landscape(); };
endingImage.src = './assets/ending-option-2.webp';
document.getElementById('begin').addEventListener('click',begin);
nextButton.addEventListener('click',()=>turn(current+1));
backButton.addEventListener('click',()=>turn(current-1));
document.addEventListener('keydown',e=>{
  if(views.gallery.classList.contains('hidden')||busy)return;
  if(e.key==='ArrowRight')turn(current+1);
  if(e.key==='ArrowLeft')turn(current-1);
});
updateGallery();
show('intro');
