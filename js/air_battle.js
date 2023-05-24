document.body.innerHTML="<h2 id='heading'>Air battle</h2><div class='dark-mode-choice'><input type='radio' name='mode' id='light-mode'><label for='light-mode' class='light-mode'>Day flight</label><br><input type='radio' name='mode' id='dark-mode'><label for='dark-mode' class='dark-mode'>Night flight</label><br></div><div id='play-screen'><img src='img/myPlane0.png' class='player'></div><div class='under-screen'><button id='restart'>Restart</button><p id='message'>2022</p></div><script src='js/air_battle.js'></script>";
const BODY = document.querySelector("body");
const HDNG = document.getElementById("heading");
const PLAY_SCREEN = document.getElementById("play-screen");
const BTN_RESTART = document.getElementById("restart");
const RADIO_DAY = document.getElementById("light-mode");
const RADIO_NIGHT = document.getElementById("dark-mode");
const PRGRF = document.getElementById("message");
const LABEL_DAY = document.querySelector(".light-mode");
const LABEL_NIGHT = document.querySelector(".dark-mode");

var PLAYER_AIRPLANE = document.querySelector(".player");
var LIVES_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(LIVES_DIV);
var SCORE_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(SCORE_DIV);
var GAMEOVER_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(GAMEOVER_DIV);
var BOSS_HEALTH_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(BOSS_HEALTH_DIV);
var WEAPON_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(WEAPON_DIV);

PLAY_SCREEN.style.filter = "brightness(200%)";
RADIO_DAY.checked = true;
const S_WIDTH = PLAY_SCREEN.clientWidth;
const S_HEIGHT = PLAY_SCREEN.clientHeight;

var GAME_DURATION;
var TOTAL_SCORE;
var MOVE_PER_CLICK;
var BULLET_SPEED;
var PLANE_SPEED;
var TACT;
var TRIG_K;
var playGame;
var startPause;
var endPause;
var DIFFICULTY; 
var backgroundNum;
var score; 
var counter;
var lives;
var bossHealth;
var explosionCounter;
var explodedObject;
var explosions;
var IMG;
var KEY_PRESSED;
var PLANES;
var BULLETS;
var numOfBossPlane;
var additionalTacts;
var playerTrace;
var propellerCounter;
var playerFireInterval; 
var playerBulletsPerShot;
var SHOT_ENEMIES_COUNTER;
class Trace{
    point=[];
    constructor(num){
        this.queueLength=num;
    };
    toTrace(coordX, coordY){//add player coordinates to array end, deletes first array element, so keeps only last N=num points
        this.point.push({
            "x": coordX,
            "y": coordY
        });
        if(this.point.length>this.queueLength){
            this.point.shift();
        }
    }
    getTipX(){
        return this.point[0].x;
    }
    getTipY(){
        return this.point[0].y;
    }
}

function restart(){//sets default values to all variables
    clearInterval(playGame);
    playGame=false;
    GAME_DURATION = 2*60000;//miliseconds before boss appears
    TOTAL_SCORE = 1000;//any number, score when boss appears
    MOVE_PER_CLICK=10;//px per keydown repeat frequency
    BULLET_SPEED=15;//px per setInterval tact
    PLANE_SPEED=3//px per setInterval tact
    TACT = 100;// millisec
    TRIG_K = Math.PI/180;
    DIFFICULTY = [// first game level and only so far, has 5 phases of progressing difficulty, when last phase is achived Boss airplane appears.
        {
        "score":        [0,         0.1, 0.2, 0.4, 0.7, 1],
        "enemy1Rate":   [40,        35,  30,  25,  20,  25],
        "bullet1Rate":  [39,        36,  32,  28,  24,  28],
        "enemy2Rate":   [Infinity,  45,  35,  30,  22,  Infinity],
        "bullet2Rate":  [Infinity,  25,  23,  22,  20,  Infinity],
        "boss":           true,
        "bulletBossRate": 20,
        }
    ];
    playerFireInterval=1000; //milliseconds, smallest time between shots
    propellerCounter=0;// for propellers rotation
    additionalTacts=0;// to see explosion of boss airplane / players airplane before win game / game over 
    numOfBossPlane=0;// number o boss airplane in PLANES array
    backgroundNum=0;//for sea movement, illusion of flying over sea
    score=0; // score propostional to counter
    counter=0;
    lives=3;// player health
    playerBulletsPerShot=1;// number of bullets launched per shot
    bossHealth=15;//boss health
    startPause=0;//time when pause has started
    endPause=0;//time when pause has ended
    explosionCounter=[];// array of individual counters for each explosion <img> element, is used to change size of an explosion <img>
    explodedObject=[];// array of airplanes <img> elements which have been shot
    explosions=[];// array of explosions <img> elements
    playerTrace = new Trace(50);// The Boss follows point where player was (50*TACT) millisec ago

    IMG = [
        ['img/myPlane1.png','img/myPlane0.png','img/myPlane2.png'],//player airplane
        ['img/bullet0.png','img/bullet1.png','img/bullet2.png'],//bullets
        ['img/enemy1stPlane1.png','img/enemy1stPlane0.png','img/enemy1stPlane2.png'],//enemy airplane 
        ['img/enemy2ndPlane2.png','img/enemy2ndPlane0.png','img/enemy2ndPlane1.png'],//enemy airplane 
        ['img/bossPlane1.png','img/bossPlane0.png','img/bossPlane2.png']//boss airplane
    ];
    KEY_PRESSED = [];//stores key if it is being pressed
    PLANES=[//array with airplaines and their properties
        {
        "class": "player",
        "src": IMG[0],
        "xCrdnt": (S_WIDTH-getWidth(PLAYER_AIRPLANE))*0.5,
        "yCrdnt": S_HEIGHT-getHeight(PLAYER_AIRPLANE),
        "angle": 0,
        "speed": 0,
        "birth": null,
        "life": null
        }
    ];
    BULLETS =[//array with bullets and their properties, index corresponds to the airplane which shot that bullets
        {
        "class": [],
        "src": IMG[1],
        "xCrdnt": [],
        "yCrdnt": [],
        "angle": [],
        "speed": BULLET_SPEED,
        "birth": [],
        "life": []
        }
    ];
    SHOT_ENEMIES_COUNTER={//stores how many planes were shot
        "enemy1stPlane":0,
        "enemy2ndPlane":0,
        "bossPlane":0,
    }
    PLAY_SCREEN.innerHTML="<img src='img/myPlane0.png' class='player'>";
    PLAYER_AIRPLANE = document.querySelector(".player");
    LIVES_DIV = document.createElement("div");
    SCORE_DIV = document.createElement("div");
    PLAY_SCREEN.appendChild(LIVES_DIV);
    PLAY_SCREEN.appendChild(SCORE_DIV);
    GAMEOVER_DIV = document.createElement("div");
    PLAY_SCREEN.appendChild(GAMEOVER_DIV);
    BOSS_HEALTH_DIV = document.createElement("div");
    PLAY_SCREEN.appendChild(BOSS_HEALTH_DIV);
    BOSS_HEALTH_DIV.style.display="none";
    WEAPON_DIV = document.createElement("div");
    PLAY_SCREEN.appendChild(WEAPON_DIV);

    PLANES[0].xCrdnt=(S_WIDTH-getWidth(PLAYER_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(PLAYER_AIRPLANE);
    PLAYER_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    PLAYER_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";

    GAMEOVER_DIV.innerHTML=`<p><b>Press [space] to play.</b></p><p>Survive ${GAME_DURATION/60000} min to fight <img src='${IMG[4][1]}' style='width: 30px; transform: rotate(180deg);'></img> the final boss.</p><div style='display:flex; justify-content:center;'><fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend >Controls:</legend>Fire: [space]<br>Left: [←]<br>Right: [→]<br>Up: [↑]<br>Down: [↓]<br>Pause: [p]</fieldset><fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend>Rewards:</legend><span style='vertical-align: middle;'>5<span style='font-size:12px;'>✕</span></span><img src='${IMG[2][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'> = <img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img>→<img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><br></img><span style='vertical-align: middle;'>10<span style='font-size:12px;'>✕</span></span><img src='${IMG[3][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img> = <sup style='font-size: 10px; color: green'><b>+1<b/></sup><div style='display:inline-block; vertical-align: middle; width:15px; height:15px; margin:1px; background-color: green; border-radius:5px;'></div><span style='vertical-align: middle;'></span><img src='${IMG[0][0]}' style='width: 25px;'></img></fieldset</div>`;
    GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
    GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
    GAMEOVER_DIV.style.zIndex=10;
}
    function getWidth(element){
        const width=element.offsetWidth;
        return width;
    }
    function getHeight(element){
        const height=element.offsetHeight;
        return height;
    }
function waitSpacePress(){
    showStats();
    if(KEY_PRESSED[" "] && !playGame){
        const d=new Date();
        endPause=d.getTime();
        if(startPause==0){startPause=d.getTime();}
        for (let i = 0; i < PLANES.length; i++) {//extends lives of airplanes and bullets by duration the pause
            PLANES[i].birth+=(endPause-startPause);
            for (let j = 0; j < BULLETS[i].birth.length; j++) {
                BULLETS[i].birth[j]+=(endPause-startPause); 
            } 
        }
        GAMEOVER_DIV.innerHTML="";
        play();
    }
}
function showStats(){//shows score and lives
    LIVES_DIV.style.zIndex=10;
    LIVES_DIV.style.opacity=0.9;
    LIVES_DIV.style.right="0px";
    LIVES_DIV.style.top="0px";
    LIVES_DIV.style.margin="5px";
    LIVES_DIV.style.display="flex";
    let output ="";
    for (let i = 0; i < lives; i++) {
        output+=`<div style='width:15px; height:15px; margin:1px; background-color: green; border-radius:5px;'></div>`;
    }
    output+=`<img src='${IMG[0][1]}' style='width: 20px; margin: 2px;'></img>`;
    LIVES_DIV.innerHTML=output;
    SCORE_DIV.style.zIndex=10;
    SCORE_DIV.style.opacity=0.9;
    SCORE_DIV.style.right="0px";
    SCORE_DIV.style.bottom="0px";
    SCORE_DIV.style.margin="5px";
    SCORE_DIV.style.textAlign="right";
    output ="";
    output+=`${SHOT_ENEMIES_COUNTER['enemy1stPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
    output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
    output+="Score: "+(score>=TOTAL_SCORE ? TOTAL_SCORE : Math.floor(score))+"/"+TOTAL_SCORE;
    SCORE_DIV.innerHTML=output;
    BOSS_HEALTH_DIV.style.zIndex=10;
    BOSS_HEALTH_DIV.style.opacity=0.8;
    BOSS_HEALTH_DIV.style.left="0px";
    BOSS_HEALTH_DIV.style.top="0px";
    BOSS_HEALTH_DIV.style.margin="5px";
    output=`<img src='${IMG[4][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg); display: block;'></img>`
    for (let i = 0; i < bossHealth; i++) {
        output+=`<div style='width:15px; height:15px; margin:1px; background-color: #8d0000; border-radius:5px;'></div>`;
    }
    BOSS_HEALTH_DIV.innerHTML=output;
    WEAPON_DIV.style.zIndex=10;
    WEAPON_DIV.style.opacity=0.9;
    WEAPON_DIV.style.left="0px";
    WEAPON_DIV.style.bottom="0px";
    WEAPON_DIV.style.margin="5px";
    output="Gun:";
    for (let i = 0; i < playerBulletsPerShot; i++) {
        output+=`<img src='${IMG[1][1]}' style='margin: 1px; transform: rotate(180deg);'></img>`;
    }
    WEAPON_DIV.innerHTML=output;
}
function play(){
    playGame=setInterval(function(){
        counter++;  
        propellerRotation();
        background();
        spawnEnemies();
        movePlayerAirplane();
        firePlayerBullets();
        movePlanes();
        moveBullets();
        hideOverflowedElements();
        killPlayer();
        killEnemyPlane();      
        drawExplodedObject();
        showStats();
        gameWin();
        gameOver();
    }, TACT); 
}
function pauseGame(){
    if(KEY_PRESSED["p"] || KEY_PRESSED["P"]){
        clearInterval(playGame);
        const d=new Date();
        startPause=d.getTime();
        playGame=false;
        GAMEOVER_DIV.innerHTML="<p>Pause. Press [space] to play.</p>";
        GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
        GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
        GAMEOVER_DIV.style.zIndex=10;
        planeImgSwap();
    }
}
    function planeImgSwap(){//change <img> source to image with unrotated propeller when pause, game over or win
        for (let i = PLANES.length-1; i >= 0; i--) {//collision with an enemy plane
            const P_IMG = document.querySelector(`.${PLANES[i].class}`);
            if(P_IMG.style.display!="none"){
                P_IMG.src=PLANES[i].src[1];
            }
        }
    }
function propellerRotation(){
    propellerCounter++;
    if(propellerCounter>=3){propellerCounter=0};
    for (let i = 0; i < PLANES.length; i++) {
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        P_IMG.src=PLANES[i].src[propellerCounter];
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const B_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
            B_IMG.src=IMG[1][propellerCounter];
        }
    }
}
function background(){//moves background sea for fly forward illusion 
    if((counter % 2) == 0){
        backgroundNum++;
        if(backgroundNum==3){
            backgroundNum=0;
        }
        PLAY_SCREEN.style.backgroundImage = `url('img/backgroung${backgroundNum}.png')`;
    }
}
function spawnEnemies(){//throws different types enemy airplanes and fire bullets depending on achived game difficulty
    score=counter*TACT/GAME_DURATION*TOTAL_SCORE;
    const lastPhaseNum=DIFFICULTY[0].score.length-1;
    if (score>(DIFFICULTY[0].score[lastPhaseNum]*TOTAL_SCORE)){
        if(DIFFICULTY[0].boss){
            DIFFICULTY[0].boss=false;
            addEnemyPlane(IMG[4][1], "bossPlane")
            BOSS_HEALTH_DIV.style.display="flex";
        }
        if((counter % DIFFICULTY[0].bulletBossRate) == 0){
            enemiesFire("bossPlane");
        }        
        phaseOfLevel(lastPhaseNum);
    } else {
        for (let i = 0; i < lastPhaseNum; i++) {
            if ((score>(DIFFICULTY[0].score[i]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[i+1]*TOTAL_SCORE))){
                phaseOfLevel(i);
                break;
            }
        }
    }

    function phaseOfLevel(i){
        if((counter % DIFFICULTY[0].enemy1Rate[i]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[i]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
        if((counter % DIFFICULTY[0].bullet1Rate[i]) == 0){
            enemiesFire("enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].bullet2Rate[i]) == 0){
            enemiesFire("enemy2ndPlane");
        }
    }
    function addEnemyPlane(imgLink, type){//throws enemy airplanes on top of play screen along width in random place
        const d = new Date();
        const elemClass=imgLink.substring(4,(imgLink.length-5));
        const PLANE_IMG = document.createElement("img");
        PLAY_SCREEN.appendChild(PLANE_IMG);
        const arraySize = PLANES.length;
        PLANES.push({}); 
        BULLETS.push({
            "class": [],
            "src": IMG[1],
            "xCrdnt": [],
            "yCrdnt": [],
            "angle": [],
            "speed": BULLET_SPEED,
            "birth": [],
            "life": []
        });
        PLANES[arraySize].class=(elemClass+"_"+arraySize);
        PLANES[arraySize].src=imgLink;
        PLANE_IMG.setAttribute("class", PLANES[arraySize].class);
        PLANE_IMG.setAttribute("src", PLANES[arraySize].src);
        PLANES[arraySize].xCrdnt=Math.random()*(S_WIDTH-getWidth(PLANE_IMG));
        PLANES[arraySize].yCrdnt=-getHeight(PLANE_IMG);
        if(type=="enemy1stPlane"){
            PLANES[arraySize].src=IMG[2];
            PLANES[arraySize].angle=90;
            PLANES[arraySize].speed=PLANE_SPEED;
            PLANES[arraySize].life=1.3*TACT*S_HEIGHT/PLANES[arraySize].speed;
            PLANE_IMG.style.transform="rotate(180deg)";
        }
        else if(type=="enemy2ndPlane"){
            PLANES[arraySize].src=IMG[3];
            const dY = PLANES[0].yCrdnt-PLANES[arraySize].yCrdnt;
            const dX = -PLANES[0].xCrdnt+PLANES[arraySize].xCrdnt;
            PLANES[arraySize].angle=90+Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
            PLANES[arraySize].speed=2*PLANE_SPEED;
            PLANES[arraySize].life=1.0*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/PLANES[arraySize].speed;      
            PLANE_IMG.style.transform=`rotate(${-90+PLANES[arraySize].angle}deg)`;
            PLANE_IMG.style.transformOrigin="50% 50%";
        }
        else if(type=="bossPlane"){
            PLANES[arraySize].src=IMG[4];
            numOfBossPlane=arraySize;
            const dY = PLANES[0].yCrdnt-PLANES[arraySize].yCrdnt;
            const dX = -PLANES[0].xCrdnt+PLANES[arraySize].xCrdnt;
            PLANES[arraySize].angle=90+Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
            PLANES[arraySize].speed=1.0*PLANE_SPEED;
            PLANES[arraySize].life=Infinity;
            PLANE_IMG.style.transform=`rotate(${-90+PLANES[arraySize].angle}deg)`;
            PLANE_IMG.style.transformOrigin="50% 50%";
        }
        PLANES[arraySize].birth=d.getTime();
        PLANE_IMG.style.left=PLANES[arraySize].xCrdnt+"px";
        PLANE_IMG.style.top=PLANES[arraySize].yCrdnt+"px";
        PLANE_IMG.style.margin="0px";
        PLANE_IMG.style.padding="0px";
    }
    function enemiesFire(type){//enemy airplane places (fire) bullets, bullets are brought to move with other function
        for (let i = 1; i < PLANES.length; i++) {
            const P_IMG = document.querySelector(`.${PLANES[i].class}`);
            const planeType=getPlaneType(P_IMG);;
            let bulletFanFeathers=1;
            let bulletFanAngle= 0;
            if (type=="bossPlane"){
                bulletFanFeathers=9;
                bulletFanAngle= 180;
            }
            const dAngle=bulletFanAngle/bulletFanFeathers;
            if((P_IMG.style.display != "none") && (planeType==type)){
                for (let j = 0; j < bulletFanFeathers; j++) {
                    const d = new Date();
                    const BULLET_IMG = document.createElement("img");
                    PLAY_SCREEN.appendChild(BULLET_IMG);
                    const posX=PLANES[i].xCrdnt;
                    const posY=PLANES[i].yCrdnt;
                    const arraySize = BULLETS[i].class.length;
                    BULLETS[i].class.push("bullet_"+i+"_"+arraySize);
                    BULLET_IMG.setAttribute("class", BULLETS[i].class[arraySize]);
                    BULLETS[i].src=IMG[1][0];
                    BULLET_IMG.setAttribute("src", BULLETS[i].src);
                    BULLETS[i].angle.push(PLANES[i].angle-0.5*(bulletFanAngle-dAngle)+j*dAngle);
                    const hPlane=getHeight(P_IMG);
                    const wPlane=getWidth(P_IMG);
                    const hBullet=getHeight(BULLET_IMG);
                    const wBullet=getWidth(BULLET_IMG);
                    const X0=posX+0.5*wPlane-0.5*wBullet;
                    const Y0=posY+0.5*hPlane-0.5*hBullet;
                    BULLETS[i].xCrdnt.push(X0);
                    BULLETS[i].yCrdnt.push(Y0);
                    BULLETS[i].birth.push(d.getTime());
                    BULLETS[i].speed = BULLET_SPEED;
                    BULLETS[i].life.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[i].speed); 
                    BULLET_IMG.style.left=BULLETS[i].xCrdnt[arraySize]+"px";
                    BULLET_IMG.style.top=BULLETS[i].yCrdnt[arraySize]+"px";
                    BULLET_IMG.style.transform=`rotate(${-90+BULLETS[i].angle[arraySize]}deg)`;
                    BULLET_IMG.style.transformOrigin="50% 50%";
                    BULLET_IMG.style.zIndex=-1;
                    BULLET_IMG.style.margin="0px";
                    BULLET_IMG.style.padding="0px";                
                }
            }
        }
    }
}
    function getPlaneType(element){
        const filename = element.src.substring(element.src.lastIndexOf('/')+1);
        const planeType=filename.substring(0,(filename.length-5));
        return planeType;
    }
function movePlayerAirplane() {// moves player airplane when keyboard arrows are pressed 
    let posX=parseInt(PLAYER_AIRPLANE.style.left);
    let posY=parseInt(PLAYER_AIRPLANE.style.top)
    if(KEY_PRESSED["ArrowLeft"]){
        posX-=MOVE_PER_CLICK;
        if(posX<0){posX=0;}
        PLANES[0].xCrdnt=posX;
        PLAYER_AIRPLANE.style.left=posX+"px";
    }
    if(KEY_PRESSED["ArrowRight"]){
        posX+=MOVE_PER_CLICK;
        rightBorder=S_WIDTH-getWidth(PLAYER_AIRPLANE);
        if(posX>rightBorder){posX=rightBorder;}
        PLANES[0].xCrdnt=posX;
        PLAYER_AIRPLANE.style.left=posX+"px";
    }
    if(KEY_PRESSED["ArrowUp"]){
        posY-=MOVE_PER_CLICK;
        if(posY<0){posY=0;}
        PLANES[0].yCrdnt=posY;
        PLAYER_AIRPLANE.style.top=posY+"px";
    }
    if(KEY_PRESSED["ArrowDown"]){
        posY+=MOVE_PER_CLICK;
        bottomBorder=S_HEIGHT-getHeight(PLAYER_AIRPLANE);
        if(posY>bottomBorder){posY=bottomBorder;}
        PLANES[0].yCrdnt=posY;
        PLAYER_AIRPLANE.style.top=posY+"px";
    }
    playerTrace.toTrace(PLANES[0].xCrdnt, PLANES[0].yCrdnt);
}
function firePlayerBullets(){//my airplane places (fires) bullets if space is pressed, bullets are brought to move with other function
    if(KEY_PRESSED[" "]){
        let arraySize;
        for (let j = 0; j < playerBulletsPerShot; j++) {
            const d = new Date();
            const dAngle=2;
            const BULLET_IMG = document.createElement("img");
            PLAY_SCREEN.appendChild(BULLET_IMG);
            const posX=parseInt(PLAYER_AIRPLANE.style.left);
            const posY=parseInt(PLAYER_AIRPLANE.style.top);
            arraySize = BULLETS[0].class.length;
            BULLETS[0].class.push("bullet_"+"0"+"_"+arraySize);
            BULLET_IMG.setAttribute("class", BULLETS[0].class[arraySize]);
            BULLET_IMG.setAttribute("src", IMG[1][0]);
            BULLETS[0].angle.push(-90-0.5*(playerBulletsPerShot-1)*dAngle+j*dAngle);//shifts bullets direction by rotation
            BULLETS[0].xCrdnt.push(posX+(getWidth(PLAYER_AIRPLANE)-getWidth(BULLET_IMG))*0.5);
            BULLETS[0].yCrdnt.push(posY+0.5*getHeight(BULLET_IMG)*Math.pow(-1, j));//shifts bullets along vertical axis
            BULLETS[0].birth.push(d.getTime());
            BULLETS[0].life.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[0].speed); 
            BULLET_IMG.style.left=BULLETS[0].xCrdnt[arraySize]+"px";
            BULLET_IMG.style.top=BULLETS[0].yCrdnt[arraySize]+"px";
            BULLET_IMG.style.transform=`rotate(${-90+BULLETS[0].angle[arraySize]}deg)`;;
            BULLET_IMG.style.zIndex=-1;
            BULLET_IMG.style.margin="0px";
            BULLET_IMG.style.padding="0px";
        }
        if((BULLETS[0].birth[arraySize]-BULLETS[0].birth[arraySize-playerBulletsPerShot])<playerFireInterval){
            for (let j = 0; j < playerBulletsPerShot; j++) {// deletes bullets or does not allow to fire if since the last shot less than playerFireInterval miliseconds have gone
                const BULLET_IMG = document.querySelector(`.${BULLETS[0].class[arraySize-j]}`);
                BULLET_IMG.remove();
                BULLETS[0].class.pop();
                BULLETS[0].angle.pop();
                BULLETS[0].xCrdnt.pop();
                BULLETS[0].yCrdnt.pop();
                BULLETS[0].birth.pop();
                BULLETS[0].life.pop();
            }
        }
    }
}
function movePlanes(){//moves all enemy airplanes
    for (let i = 1; i < PLANES.length; i++) {
        const MOVE_IMG = document.querySelector(`.${PLANES[i].class}`);
        if(MOVE_IMG.style.display!="none"){
            if(i==numOfBossPlane){//boss follows player's "tail"
                const dY = playerTrace.getTipY()-PLANES[i].yCrdnt;
                const dX = -playerTrace.getTipX()+PLANES[i].xCrdnt;
                if(dY>=0){
                    PLANES[i].angle=90+Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
                }else{
                    PLANES[i].angle=90+(180-Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K);
                } 
            }
            MOVE_IMG.style.transform=`rotate(${-90+PLANES[i].angle}deg)`;
            PLANES[i].yCrdnt+=PLANES[i].speed*Math.sin(TRIG_K*PLANES[i].angle);
            MOVE_IMG.style.top=PLANES[i].yCrdnt+"px";
            PLANES[i].xCrdnt+=PLANES[i].speed*Math.cos(TRIG_K*PLANES[i].angle);
            MOVE_IMG.style.left=PLANES[i].xCrdnt+"px";            
        }
    }
}
function moveBullets(){//moves all bullets
    for (let i = 0; i < BULLETS.length; i++) {
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const MOVE_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
            if(MOVE_IMG.style.display!="none"){
                BULLETS[i].yCrdnt[j]+=BULLETS[i].speed*Math.sin(TRIG_K*BULLETS[i].angle[j]);
                MOVE_IMG.style.top=BULLETS[i].yCrdnt[j]+"px";
                BULLETS[i].xCrdnt[j]+=BULLETS[i].speed*Math.cos(TRIG_K*BULLETS[i].angle[j]);
                MOVE_IMG.style.left=BULLETS[i].xCrdnt[j]+"px";
            }
        }
    }
}
function hideOverflowedElements(){//hides airplanes and bullets which were alive longer then the time required to cross play screen thought
    for (let i = 1; i < PLANES.length; i++) {
        const d = new Date();       
        let timeLived=d.getTime();
        timeLived-=PLANES[i].birth;
        if(timeLived>PLANES[i].life){
            const DEL_IMG = document.querySelector(`.${PLANES[i].class}`);
            DEL_IMG.style.display="none";
        }
    }
    for (let i = 0; i < BULLETS.length; i++) {
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const d = new Date();       
            let timeLived=d.getTime();
            timeLived-=BULLETS[i].birth[j];
            if(timeLived>BULLETS[i].life[j]){
                const DEL_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
                DEL_IMG.style.display="none";
            }
        }
    }
}
function killPlayer(){//enemy airplanes and bullets collision with player airplane
    const PLAYER_P_IMG = document.querySelector(`.${PLANES[0].class}`);
    for (let i = 1; i < BULLETS.length; i++) {//collision with a bullet
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const B_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
            if(B_IMG.style.display!="none"){
                if(isCollision(PLAYER_P_IMG, B_IMG)){
                    if(!explodedObject.includes(B_IMG)){
                        lives--;
                        addToQueue(B_IMG);
                    } 
                    playerBulletsPerShot=1;
                    highlightAnimation(PLAYER_P_IMG);
                    highlightAnimation(LIVES_DIV);
                    if(lives<=0){addToQueue(PLAYER_P_IMG);}
                } 
            }
        }
    }
    for (let i = 1; i < PLANES.length; i++) {//collision with an enemy plane
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        if(P_IMG.style.display!="none"){
            if(isCollision(PLAYER_P_IMG, P_IMG)){
                if(i!=numOfBossPlane){
                    if(!explodedObject.includes(P_IMG)){
                        lives--;
                        addToQueue(P_IMG);
                    } 
                }else{
                    lives--;
                }
                playerBulletsPerShot=1;
                highlightAnimation(PLAYER_P_IMG);
                highlightAnimation(LIVES_DIV);
                if(lives<=0){addToQueue(PLAYER_P_IMG);}
            }
        }
    }
}
function killEnemyPlane(){// player bullets collision with enemy airplane
    for (let j = 0; j < BULLETS[0].class.length; j++) {
        const B_IMG = document.querySelector(`.${BULLETS[0].class[j]}`);
        if(B_IMG.style.display!="none"){
            for (let i = 1; i < PLANES.length; i++) {
                const P_IMG = document.querySelector(`.${PLANES[i].class}`);
                if(P_IMG.style.display != "none"){
                    if(isCollision(P_IMG, B_IMG)){
                        if(i!=numOfBossPlane){
                            addToQueue(P_IMG);
                            if(!explodedObject.includes(B_IMG)){
                                addToQueue(B_IMG);
                            } 
                        }else{
                            if(!explodedObject.includes(B_IMG)){
                                addToQueue(B_IMG);
                                bossHealth--;
                            } 
                            highlightAnimation(P_IMG);
                            highlightAnimation(BOSS_HEALTH_DIV);
                            if(bossHealth<=0){addToQueue(P_IMG);}
                        }
                    }
                }
            }
        }
    }
}
    function isCollision(element0, element1){//detects if centers of two <img> elements are closer than their half widths sum
        const x0=parseFloat(element0.style.left)+0.5*getWidth(element0);
        const y0=parseFloat(element0.style.top)+0.5*getHeight(element0);;
        const x1=parseFloat(element1.style.left)+0.5*getWidth(element1);;
        const y1=parseFloat(element1.style.top)+0.5*getHeight(element1);;;
        const distance=Math.sqrt(Math.pow((x1-x0), 2)+Math.pow((y1-y0), 2));
        let r0=0.5*getWidth(element0);
        let r1=0.5*getWidth(element1);
        if(r0>0.5*getHeight(element0)){r0=0.5*getHeight(element0);}
        if(r1>0.5*getHeight(element1)){r1=0.5*getHeight(element1);}
        if((r0+r1)>distance){
            return true;
        }else{
            return false;
        }
    }
    function addToQueue(element){//adds <img> elements to an array for drawExplodedObject()
        countShotPlane(element);
        explodedObject.push(element);
        explosionCounter.push(0);    
        const EXPL = document.createElement("img");
        EXPL.src="img/bang0.png";
        PLAY_SCREEN.appendChild(EXPL);
        explosions.push(EXPL);

        function countShotPlane(element){
            const planeType=getPlaneType(element);
            if(!explodedObject.includes(element)){//does not allow to count more than once already shot airplane
                SHOT_ENEMIES_COUNTER[planeType]++;
                reward(planeType);
            }

            function reward(planeType){//awards rewards for downed enemies
                if(planeType=="enemy2ndPlane"){
                    if((SHOT_ENEMIES_COUNTER["enemy2ndPlane"] % 10) == 0){//for every 10 of second type airplanes 1 live is added
                        lives++;
                        highlightAnimation(LIVES_DIV);
                    }  
                }
                if(planeType=="enemy1stPlane"){
                    if((SHOT_ENEMIES_COUNTER["enemy1stPlane"] % 5) == 0){//gun upgrade to 3 bullets per shot every 5 of 1st type airplanes
                        playerBulletsPerShot=3;
                        highlightAnimation(WEAPON_DIV);
                    }
                }
            }
        }
    }    
    function highlightAnimation(element){//flickers airplanes if collision
        element.style.animation="beingShot";
        element.style.animationDuration="0.1s";
        element.style.animationIterationCount ="3";
        element.addEventListener("animationend", function(){
            element.style.animation="";
        })
    }
function drawExplodedObject(){//draws an explosion in stead of an airplane and a bullet
    for (let i = 0; i < explodedObject.length; i++) {
        explosion(i);
    }

    function explosion(i){
        let explosionSize;
        let explosionStep;
        if (explosionCounter[i]!="no"){
            explodedObject[i].style.display="";
            let planeWidth=0;
            let planeHeight=0;
            if(getWidth(explodedObject[i])>0){
                planeWidth=getWidth(explodedObject[i]);
                explosionStep=Math.ceil(0.5*planeWidth);
                explosionSize=explosionStep*3;//~1.5 size of airplane
            }
            if (getHeight(explodedObject[i])){
                planeHeight=getHeight(explodedObject[i]);
            }
            explosionCounter[i]+=explosionStep; 
            explosions[i].style.transform=explodedObject[i].style.transform;
            if((explosionCounter[i]<=explosionSize) && (explosionCounter[i]>=0)){// explosion <img> gets bigger
                explosions[i].style.width=explosionCounter[i]+"px";
                explosions[i].style.height=explosionCounter[i]+"px";
                explosions[i].style.left=(parseFloat(explodedObject[i].style.left)+0.5*planeWidth-0.5*explosionCounter[i])+"px";
                explosions[i].style.top=(parseFloat(explodedObject[i].style.top)+0.5*planeHeight-0.5*explosionCounter[i])+"px";
            } else if ((explosionCounter[i]>explosionSize) && (explosionCounter[i]<=(2*explosionSize))){//explosion <img> gets smaller
                explodedObject[i].style.display="none";// <img> is hidden 
                explosions[i].style.width=((2*explosionSize)-explosionCounter[i])+"px";
                explosions[i].style.height=((2*explosionSize)-explosionCounter[i])+"px";
                explosions[i].style.left=(parseFloat(explodedObject[i].style.left)+0.5*planeWidth-explosionSize+0.5*explosionCounter[i])+"px";
                explosions[i].style.top=(parseFloat(explodedObject[i].style.top)+0.5*planeHeight-explosionSize+0.5*explosionCounter[i])+"px";
            } else {
                explodedObject[i].style.display="none";
                explosions[i].style.display="none";
                explosionCounter[i]="no";
            }
        }
    }
}
function gameOver(){//game over if zero lives left
    const P_IMG = document.querySelector(`.${PLANES[0].class}`);  
    if(lives<=0){
        additionalTacts++;
        if(additionalTacts>6){
            P_IMG.style.display="none";
            output="<h2 style='margin: 5px'>Game over!</h2>";
            output+="<fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend >Statistic:</legend>";
            output+=`${BULLETS[0].class.length} <span style='font-size:12px;'>✕</span> <img src='${IMG[1][0]}' style='width: 5px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy1stPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['bossPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[4][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img>`;
            output+="</fieldset>";
            output+="<p>Press Restart for a new game.</p>"
            GAMEOVER_DIV.innerHTML=output;
            GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
            GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
            clearInterval(playGame);   
            planeImgSwap();         
        }
    }
}
function gameWin(){//win if boss is defeated
    const P_IMG = document.querySelector(`.${PLANES[numOfBossPlane].class}`);
    if(bossHealth<=0){
        additionalTacts++;
        if(additionalTacts>6){
            P_IMG.style.display="none";
            output="<h2 style='margin: 5px'>You win!</h2>";
            output+="<fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend >Statistic:</legend>";
            output+=`${BULLETS[0].class.length} <span style='font-size:12px;'>✕</span> <img src='${IMG[1][0]}' style='width: 5px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy1stPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['bossPlane']} <span style='font-size:12px;'>✕</span> <img src='${IMG[4][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img>`;
            output+="</fieldset>";
            output+="<p>Press Restart for a new game.</p>"
            GAMEOVER_DIV.innerHTML=output;
            GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
            GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
            clearInterval(playGame);
            planeImgSwap();
        }
    }
}

RADIO_DAY.addEventListener("click", function(){
    PLAY_SCREEN.style.filter = "brightness(200%)";
    RADIO_DAY.checked = true;
    PRGRF.style.color = "black";
    BODY.style.backgroundColor = "white";
    LABEL_DAY.style.color = "black";
    LABEL_NIGHT.style.color = "black";
    HDNG.style.color = "black";
    RADIO_DAY.blur();
    RADIO_NIGHT.blur();
})
RADIO_NIGHT.addEventListener("click", function(){
    PLAY_SCREEN.style.filter = "brightness(100%)";
    RADIO_NIGHT.checked = true;
    PRGRF.style.color = "darkgray";
    BODY.style.backgroundColor = "black";
    LABEL_DAY.style.color = "darkgray";
    LABEL_NIGHT.style.color = "darkgray";
    HDNG.style.color = "darkgray";
    RADIO_DAY.blur();
    RADIO_NIGHT.blur();
})
BTN_RESTART.addEventListener("click", function(){
    BTN_RESTART.blur();
    restart();
    waitSpacePress();
})
document.addEventListener("keydown", function(e){
    KEY_PRESSED[e.key] = true;
    waitSpacePress();
    pauseGame();
})
document.addEventListener("keyup", function(e){
    delete KEY_PRESSED[e.key];
})
window.addEventListener("load", function(){//for chrome browser
    PLANES[0].xCrdnt=(S_WIDTH-getWidth(PLAYER_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(PLAYER_AIRPLANE);
    PLAYER_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    PLAYER_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";
})

restart();
waitSpacePress();
