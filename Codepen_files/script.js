window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;

const drawAudio = (m4a) => {
  fetch(m4a)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => audioBuffer.getChannelData(0))
    .then((rawdata) => normalize(rawdata))
    .then((normData) => draw(normData));
};

document.getElementById("Title").innerHTML =
  "Sphinx of black quartz, judge my vow.";

function arrayChunk(rawdata){
  if(rawdata.length > 65536){
    const iMin = Math.ceil(rawdata.length/65536);
    var opt = 0;
    var sortI = [];
    for(let i = 65536; i > 448; i=i-1){
      var spaces = Math.ceil(rawdata.length/i);
      var tol = (spaces*i)-rawdata.length;
      if(tol <= 50){
        var pop =[spaces,tol,i];
        opt++;
        sortI.push(pop);
      }
    }
    var sectMin = sortI.reduce((total,value) => Math.min(total,value[0]),448);
    var sect = sortI.filter((value) => value[0]==sectMin);
    var extraMin = sect.reduce((total,value) => Math.min(total,value[1]),50);
    var extra = sect.filter((value) => value[1]==extraMin);
    const arrayCount = extra[0][0];
    const arraySize = extra[0][2];
    console.log("Chunk:",rawdata.length,"Array to large! Split into",arrayCount,"nested arrays, with max length of",arraySize,". (Sections must be less than 65,536).");
    var rawArray = Object.entries(rawdata);
    var newArray =[];
    for(let i = 0; i < arrayCount; i++){
      var cutA =rawArray.splice(0,arraySize);
      var cutO = Object.fromEntries(cutA);
      console.log("Section",i,": Cut to length,",Object.keys(cutO).length,". Preview: ",cutA.slice(0,2),"...");
      newArray[i] = cutO;
    }
    var rawFolder = newArray;
    console.log("Returned: Nested array with sections[[0],[1],[2],...] of lengths:",rawFolder.map((value) => Object.keys(value).length));
    return rawFolder;
  } else{
    return rawdata=[rawdata];
    console.log("Data is",rawdata.length,"long, no resize needed. Data-type of is",Object.prototype.toString.call(rawdata));
  }
}

const normalize = (rawdataLong) => {
  var rawdata = rawdataLong.slice(31515,166170);
  var dataChunks = arrayChunk(rawdata);
  console.log("Data-type of data is",Object.prototype.toString.call(dataChunks));
  const dataValues = dataChunks.map((obj) => Object.values(obj));
  const sectNumber = dataValues.length-1;
  var NotN =0;
  for (let s = 0; s <= sectNumber; s++){
    console.log("Section",s,"is an array:",Array.isArray(dataValues[s]));
    const IndexLength = dataValues[s].length-1;
    for (let i = 0; i <= IndexLength; i++){
      if(isNaN(dataValues[s][i])){
        NotN++;
        console.error("NaN:",dataValues[s][i],"Found @ s:",s,"i:",i);
        console.log("Coresponding object Value:",Object.keys(dataChunks).find(key => dataChunk[key] === dataValues[s][i]));
      }
    }
  }
  if(NotN > 0){
    console.warn("NaN Count:",NotN,"(Failed)");
  }
  else {
    console.log("NaN is:",NotN,"(Passed)");
  }
  const dataAbs = dataValues.map((value) => value.map(Math.abs));
  const dataMax = dataAbs.map((value) => Math.max(...value));
  console.log("max array:",dataMax);
  const maxValue = Math.max(...dataMax);
  console.log("max total:",maxValue);
  const scaler = 1 / maxValue;
  console.log("scaler:",scaler);
  const normData = rawdata.map((n) => n * scaler);
  console.log("raw data sample:",rawdata.slice(0,5));
  console.log("normalized data sample:",normData.slice(0,5));
  return normData;
};

const draw = (audioBuffer) => {
  console.log("Test!");
  let tally = [];
  for (let i = 1; i <= 200; i++){
    if(audioBuffer.length % (3*i) === 0){
      tally.push(i);
    }
  }
  var total = tally.map(value => audioBuffer.length /(value*3));
  console.log("tally:",tally,"total:", total);
  const canvas = document.getElementById("Artwork");
  canvas.width = total[2];
  canvas.height = canvas.width;
  const content = canvas.getContext("2d");
  const padding = 10;
  content.fillStyle = "lightgreen";
  content.translate(0, canvas.clientHeight / 2);
  content.fillRect(10, 10, 20, 20);

  content.beginPath();
  content.moveTo(0, 0);

  for (let i = 0; i < audioBuffer.length; i++) {
    const dataX = i * (canvas.clientWidth / audioBuffer.length);
    const dataY = audioBuffer[i] * ((canvas.clientHeight / 2) - padding);
    content.lineTo(dataX, dataY);
  }
  content.lineTo(audioBuffer.length, 0);
  content.strokeStyle = "red";
  content.stroke();
  console.log("media");
  console.log(document.styleSheets[0].media.mediaText);
  var Start = 0;
  var Height = 30;
  var End = 55;
  clip(Start,Height,End,canvas,content,"pink");
  var Start = 290;
  var Height = 30;
  var End = canvas.width;
  clip(Start,Height,End,canvas,content,"Thistle");
  //console.log(55*tally[11]*3,290*tally[11]*3);
}

const clip = (xClip,yClip,wClip,canv,cont,color) => {
    cont.fillStyle = color;
  const hClip = -yClip*2;
    cont.fillRect(xClip,yClip,wClip,hClip);
    cont.stroke();
  }

drawAudio(
  "https://cvws.icloud-content.com/B/AU_NP_4MzwNcLwCOErJNt0G0vkQOAY2fj2YqJ9_CGweyhUojr655MSO3/Sphinx%20of%20black%20quartz,%20judge%20my%20vow..m4a?o=AnQbkV6VWwo6uTj_vQfFJQbz2_hp_K8A7iOnngcAJRXQ&v=1&x=3&a=CAogWoBF-wG6wF1Mj9FA9N33cmnC2XvnCSAWGKDF8HTYkvoSbRDD8_SL0TIYw4Pw39oyIgEAUgS0vkQOWgR5MSO3aiZtDa5U7BR12Hm2dE0ZvAKxu99WkznYLA38HELBfz3J-fjZ4tL1RXImi0uU-WXam0wlvgvszNgFl-53mIMTfnM4sjENdt_sc9kS5bBfM0o&e=1742347174&fl=&r=87CB7FF2-5EF4-496E-9A8E-499A89C4D25F-1&k=PxisRjZkDqIBWMtLImjPrw&ckc=com.apple.clouddocs&ckz=iCloud.is.workflow.my.workflows&p=153&s=LEeJHIaUpUYhGfru8hjh8ZukGg8"
);
