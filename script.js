let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtn = document.querySelector(".capture-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let recordFlag = false;
let captureFlag = false;
let transparentColor = "transparent";

let recorder;
let chunks = []; //media data in chunks


let constraints = {
    video: true,
    audio: true,
}

//navigator -> global object, browser info
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;

        recorder = new MediaRecorder(stream);
        recorder.addEventListener("start", (e) => {
            chunks = [];
        })
        recorder.addEventListener("dataavailable", (e) => {
            chunks.push(e.data);
        })
        recorder.addEventListener("stop", (e) => {
            //conversion of media chunks data to video

            let blob = new Blob(chunks, { type: "video/mp4" });

            if(db){
                let videoID = shortid();
                let dbTransaction = db.transaction("video","readwrite");
                let videoStore = dbTransaction.objectStore("video");
                let videoEntry = {
                    id: `vid-${videoID}`,
                    blobData: blob,
                }
                videoStore.add(videoEntry);
            }

            // let videoURL = URL.createObjectURL(blob);
            // let a = document.createElement("a");
            // a.href = videoURL;
            // a.download = "stream.mp4";
            // a.click();
        })
    })

recordBtnCont.addEventListener("click", (e) => {
    if (!recorder) return;

    recordFlag = !recordFlag;

    if (recordFlag) { //start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();

    }
    else { //stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})

let timerID;
//represents total seconds
let timer = document.querySelector(".timer")
function startTimer() {
    let counter = 1;
    timer.style.display = "block";
    function displayTimer() {
        let totalSeconds = counter
        let hours = Number.parseInt(totalSeconds / 3600);
        hours = (hours < 10) ? `0${hours}` : hours;

        totalSeconds = totalSeconds % 3600;  //remaining value
        let minutes = Number.parseInt(totalSeconds / 60);
        minutes = (minutes < 10) ? `0${minutes}` : minutes;

        totalSeconds = totalSeconds % 60;

        let seconds = totalSeconds;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;

        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++;
    }
    timerID = setInterval(displayTimer, 1000);
}

function stopTimer() {
    timer.style.display = "none";
    clearInterval(timerID);
    timer.innerText = "00:00:00";
}

captureBtnCont.addEventListener("click", (e) => {
    // captureFlag=true;
    // if(captureFlag){
    //     captureBtn.classList.add("scale-capture");
    //     captureFlag = false;
    // }
    captureBtn.classList.add("scale-capture");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d");
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);
    //filtering
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    let imageURL = canvas.toDataURL();

    if(db){
        let imageID = shortid();
        let dbTransaction = db.transaction("image","readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img-${imageID}`,
            url: imageURL,
        }
        imageStore.add(imageEntry);
        
    }
    captureBtn.classList.remove("scale-capture");
    
    // let a = document.createElement("a");
    // a.href = imageURL;
    // a.download = "image.jpg";
    // a.click();
    
})


//Filtering logic
let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        //get
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor;
    })
})


