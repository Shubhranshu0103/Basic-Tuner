let mic;
let src = null;
let analyzer;
let micOn = false;
let SAMPLE_RATE = 1024;
let button;
let btnState = false;

function connectAnalyzer() {
    let audioCtx = getAudioContext();
    src = audioCtx.createMediaStreamSource(mic.stream);
    analyzer = audioCtx.createAnalyser();
    analyzer.minDecibels = -90;
    analyzer.maxDecibels = -10;
    analyzer.smoothingTimeConstant = 0.9;

    src.connect(analyzer);
}

function getPitch() {

    let sig = new Float32Array(SAMPLE_RATE / 2);
    let yin = new Yin(SAMPLE_RATE / 2, 0.15);

    analyzer.getFloatTimeDomainData(sig);

    return yin.getPitch(sig);

}

function toggleMic() {

    if (micOn) {
        mic.stop();
        micOn = false; src = null;
    }
    else {
        mic.start(() => { micOn = true });
    }
}

function setup() {
    createCanvas(800, 800);

    mic = new p5.AudioIn();
    button = createButton('Toggle Mic');
    button.mousePressed(toggleMic);
    //mic.start(() => { micOn = true });

}


function draw() {
    background(0);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(64);


    if (micOn) {
        if (src == null) {

            connectAnalyzer();
        }


        let pitch = getPitch();
        if (pitch > 100)
            text(pitch.toFixed(2), width / 2, height / 2);
        else
            text(0.0, width / 2, height / 2);

        let vol = mic.getLevel();
        let h = map(vol, 0, 1, 0, height);

        ellipse(100, 100, 50, 2 * h);
    }




}