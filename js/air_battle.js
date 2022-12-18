document.body.innerHTML="<h2 id='heading'>Air battle</h2><div class='dark-mode-choice'><input type='radio' name='mode' id='light-mode'><label for='light-mode' class='light-mode'>Day flight</label><br><input type='radio' name='mode' id='dark-mode'><label for='dark-mode' class='dark-mode'>Night flight</label><br></div><div id='play-screen'><img src='img/myPlane0.png' class='player'></div><div class='under-screen'><button id='restart'>Restart</button><p id='arrows-use'>Use arrows to move: ← Left, → Right, ↑ Up, ↓ Down. Press [space] to fire. Pause with \"p\" key.</p></div><script src='js/air_battle.js'></script>";
const BODY = document.querySelector("body");
const HDNG = document.getElementById("heading");
const PLAY_SCREEN = document.getElementById("play-screen");
const BTN_RESTART = document.getElementById("restart");
var MY_AIRPLANE = document.querySelector(".player");
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

const S_WIDTH = PLAY_SCREEN.clientWidth;
const S_HEIGHT = PLAY_SCREEN.clientHeight;
const RADIO_DAY = document.getElementById("light-mode");
const RADIO_NIGHT = document.getElementById("dark-mode");
const PRGRF = document.getElementById("arrows-use");
const LABEL_DAY = document.querySelector(".light-mode");
const LABEL_NIGHT = document.querySelector(".dark-mode");

var GAME_DURATION;//miliseconds befor boss appears
var TOTAL_SCORE;
var MOVE_PER_CLICK;//px per keydown repeat frequency
var BULLET_SPEED;//px per setInterval tact
var PLANE_SPEED;//px per setInterval tact
var TACT;// milisec
var TRIG_K;
var playGame;
var startPause;
var endPause;
var DIFFICULTY; // first stage and only so far, has 5 level of progressing difficulty, when last level achived Boss airplane appears.
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
var PLANES;//array with airplaines and their properties
var BULLETS;//array with bullets and their properties, index corresponds to the airplane which shot that bullets
var numOfBossPlane;
var additionalTacts;
var playerTrace;
var propellerCounter;
var myFireInterval; //milliseconds
var playerBulletsPerShot;
var SHOT_ENEMIES_COUNTER;

class Trace{
    constructor(num){
        this.point=[];
        this.queueLength=num;
    };
    toTrace(coordX, coordY){
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

function restart(){
    clearInterval(playGame);
    playGame=false;
    GAME_DURATION = 60000;//miliseconds befor boss appears
    TOTAL_SCORE = 1000;
    MOVE_PER_CLICK=10;//px per keydown repeat frequency
    BULLET_SPEED=12;//px per setInterval tact
    PLANE_SPEED=3//px per setInterval tact
    TACT = 100;// milisec
    TRIG_K = Math.PI/180;
    DIFFICULTY = [// first stage and only so far, has 5 level of progressing difficulty, when last level achived Boss airplane appears.
        {
            "score":        [0,         0.1, 0.2, 0.4, 0.7, 1],
            "enemy1Rate":   [40,        35,  30,  25,  20,  25],
            "bullet1Rate":  [39,        36,  32,  28,  24,  28],
            "enemy2Rate":   [Infinity,  45,  35,  30,  22,  Infinity],
            // "enemy2Rate":   [20,  45,  35,  30,  22,  Infinity],
            "bullet2Rate":  [Infinity,  25,  23,  22,  20,  Infinity],
            // "bullet2Rate":  [10,  25,  23,  22,  20,  Infinity],
            "boss":           true,
            "bulletBossRate": 20,
        }
    ];

    myFireInterval=1000; //milliseconds, smallest time between shots
    propellerCounter=0;// for propellers rotation
    additionalTacts=0;// to see explosion of boss airplane / players airplane before win game / game over 
    numOfBossPlane=0;// number od boss airplane in PLANES array
    backgroundNum=0;//for sea movement, illusion of flying over sea
    score=0; // score propostional to counter
    counter=0;
    lives=3;// player health
    playerBulletsPerShot=1;
    bossHealth=10;//boss health
    startPause=0;//time when pause has started
    endPause=0;//time when pause has ended
    explosionCounter=[];// array of individual counters for each explosion <img> element, is used to change size of an explosion <img>
    explodedObject=[];// array of airplanes <img> elements which have been shot
    explosions=[];// array of explosions <img> elements
    playerTrace = new Trace(30);// The Boss follows point where player was 30 TACT intervals ago

    IMG = [
        ['img/myPlane0.png','img/myPlane1.png','img/myPlane2.png'],//my airplane
        ['img/bullet0.png','img/bullet1.png'],//bullets
        ['img/enemy1stPlane1.png','img/enemy1stPlane0.png','img/enemy1stPlane2.png'],//enemy airplane 
        ['img/enemy2ndPlane2.png','img/enemy2ndPlane0.png','img/enemy2ndPlane1.png'],//enemy airplane 
        ['img/bossPlane0.png','img/bossPlane0.png','img/bossPlane0.png']//boss airplane
    ];
    KEY_PRESSED = [];
    PLANES=[//array with airplaines and their properties
        {
        "class": "player",
        "src": IMG[0],
        "xCrdnt": (S_WIDTH-getWidth(MY_AIRPLANE))*0.5,
        "yCrdnt": S_HEIGHT-getHeight(MY_AIRPLANE),
        "angle": 0,
        "speed": 0,
        "birth": null,
        "live": null
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
        "live": []
        }
    ];
    SHOT_ENEMIES_COUNTER={
        "enemy1stPlane":0,
        "enemy2ndPlane":0,
        "bossPlane":0,
    }
    PLAY_SCREEN.innerHTML="<img src='img/myPlane0.png' class='player'>";
    MY_AIRPLANE = document.querySelector(".player");
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

    PLANES[0].xCrdnt=(S_WIDTH-getWidth(MY_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(MY_AIRPLANE);
    MY_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    MY_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";

    GAMEOVER_DIV.innerHTML=`<p><b>Press [space] to play.</b><br>Survive ${GAME_DURATION/60000} min to fight <img src='${IMG[4][0]}' style='width: 30px; transform: rotate(180deg);'></img> the final boss.</p><div style='display:flex; justify-content:center;'><fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend >Controls:</legend>Fire: [space]<br>Left: [←]<br>Right: [→]<br>Up: [↑]<br>Down: [↓]<br>Pause: [p]</fieldset><fieldset style='border: 1px solid black; border-radius: 10px; text-align:center;'><legend>Rewards:</legend><span style='vertical-align: middle;'>5✕</span><img src='${IMG[2][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'> = <img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img>→<img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img><br></img><span style='vertical-align: middle;'>10✕</span><img src='${IMG[3][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img> = <sup style='font-size: 10px;'>+1</sup><div style='display:inline-block; vertical-align: middle; width:15px; height:15px; margin:1px; background-color: green; border-radius:5px;'></div><span style='vertical-align: middle;'></span><img src='${IMG[0][0]}' style='width: 25px;'></img></fieldset</div>`;
    GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
    GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
    GAMEOVER_DIV.style.zIndex=10;
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
function getWidth(element){
    let rectangle=element.getBoundingClientRect();
    return rectangle.width;
}
function getHeight(element){
    let rectangle=element.getBoundingClientRect();
    return rectangle.height;
}
function propellerRotation(){
    propellerCounter++;
    if(propellerCounter>=3){propellerCounter=0};
    for (let i = 0; i < PLANES.length; i++) {
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        P_IMG.src=PLANES[i].src[propellerCounter];
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
        // output+=`<img src='${IMG[0][0]}' style='width: 20px; margin: 2px;'></img>`;
        output+=`<div style='width:15px; height:15px; margin:1px; background-color: green; border-radius:5px;'></div>`;
    }
    output+=`<img src='${IMG[0][0]}' style='width: 20px; margin: 2px;'></img>`;
    LIVES_DIV.innerHTML=output;
    SCORE_DIV.style.zIndex=10;
    SCORE_DIV.style.opacity=0.9;
    SCORE_DIV.style.right="0px";
    SCORE_DIV.style.bottom="0px";
    SCORE_DIV.style.margin="5px";
    SCORE_DIV.style.textAlign="right";
    output ="";
    output+=`${SHOT_ENEMIES_COUNTER['enemy1stPlane']} ✕ <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
    output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} ✕ <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
    output+="Score: "+(score>=TOTAL_SCORE ? TOTAL_SCORE : Math.floor(score));
    SCORE_DIV.innerHTML=output;
    BOSS_HEALTH_DIV.style.zIndex=10;
    BOSS_HEALTH_DIV.style.opacity=0.8;
    BOSS_HEALTH_DIV.style.left="0px";
    BOSS_HEALTH_DIV.style.top="0px";
    BOSS_HEALTH_DIV.style.margin="5px";
    // BOSS_HEALTH_DIV.style.display="flex";
    // BOSS_HEALTH_DIV.style.width=`${20*bossHealth}px`;
    // BOSS_HEALTH_DIV.style.height="20px";
    // BOSS_HEALTH_DIV.style.backgroundColor="#8d0000";
    output=`<img src='${IMG[4][0]}' style='width: 20px; margin: 2px; transform: rotate(180deg); display: block;'></img>`
    for (let i = 0; i < bossHealth; i++) {
        // output+=`<img src='${IMG[0][0]}' style='width: 20px; margin: 2px;'></img>`;
        output+=`<div style='width:15px; height:15px; margin:1px; background-color: #8d0000; border-radius:5px;'></div>`;
    }
    // BOSS_HEALTH_DIV.innerHTML=`<img src='${IMG[4][0]}' style='width: 20px; margin: 2px; transform: rotate(180deg); display: block;'></img>`;
    BOSS_HEALTH_DIV.innerHTML=output;
    WEAPON_DIV.style.zIndex=10;
    WEAPON_DIV.style.opacity=0.9;
    WEAPON_DIV.style.left="0px";
    WEAPON_DIV.style.bottom="0px";
    WEAPON_DIV.style.margin="5px";
    output="Gun:";
    for (let i = 0; i < playerBulletsPerShot; i++) {
        output+=`<img src='${IMG[1][0]}' style='margin: 1px; transform: rotate(180deg);'></img>`;
    }
    WEAPON_DIV.innerHTML=output;
}
function spawnEnemies(){//throws different types enemy airplanes and fire bullets depending on achived game difficulty
    score=counter*TACT/GAME_DURATION*TOTAL_SCORE;
    if ((score>(DIFFICULTY[0].score[0]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[1]*TOTAL_SCORE))){
        if((counter % DIFFICULTY[0].enemy1Rate[0]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[0]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
            if((counter % DIFFICULTY[0].bullet1Rate[0]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[0]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    } else if ((score>(DIFFICULTY[0].score[1]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[2]*TOTAL_SCORE))){
        if((counter % DIFFICULTY[0].enemy1Rate[1]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[1]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
            if((counter % DIFFICULTY[0].bullet1Rate[1]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[1]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    } else if ((score>(DIFFICULTY[0].score[2]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[3]*TOTAL_SCORE))){
        if((counter % DIFFICULTY[0].enemy1Rate[2]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[2]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }    
            if((counter % DIFFICULTY[0].bullet1Rate[2]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[2]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    } else if ((score>(DIFFICULTY[0].score[3]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[4]*TOTAL_SCORE))){
        if((counter % DIFFICULTY[0].enemy1Rate[3]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[3]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }  
            if((counter % DIFFICULTY[0].bullet1Rate[3]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[3]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    } else if ((score>(DIFFICULTY[0].score[4]*TOTAL_SCORE)) && (score<=(DIFFICULTY[0].score[5]*TOTAL_SCORE))){
        if((counter % DIFFICULTY[0].enemy1Rate[4]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[4]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
            if((counter % DIFFICULTY[0].bullet1Rate[4]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[4]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    } else if (score>(DIFFICULTY[0].score[5]*TOTAL_SCORE)){
        if(DIFFICULTY[0].boss){
            DIFFICULTY[0].boss=false;
            addEnemyPlane(IMG[4][0], "bossPlane")
            BOSS_HEALTH_DIV.style.display="flex";
        }
        if((counter % DIFFICULTY[0].enemy1Rate[5]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[5]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
            if((counter % DIFFICULTY[0].bulletBossRate) == 0){
                enemiesFire("bossPlane");
            }
            if((counter % DIFFICULTY[0].bullet1Rate[5]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[5]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    }       
}
function addEnemyPlane(imgLink, type){//throws enemy airplanes on top of play screen along width in random place
    const d = new Date();
    let elemClass=imgLink.substring(4,(imgLink.length-5));
    const PLANE_IMG = document.createElement("img");
    PLAY_SCREEN.appendChild(PLANE_IMG);
    let arraySize = PLANES.length;   
    PLANES.push({}); 
    BULLETS.push({
        "class": [],
        "src": IMG[1],
        "xCrdnt": [],
        "yCrdnt": [],
        "angle": [],
        "speed": BULLET_SPEED,
        "birth": [],
        "live": []
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
        PLANES[arraySize].live=1.3*TACT*S_HEIGHT/PLANES[arraySize].speed;
        PLANE_IMG.style.transform="rotate(180deg)";
    }
    else if(type=="enemy2ndPlane"){
        PLANES[arraySize].src=IMG[3];
        let dY = PLANES[0].yCrdnt-PLANES[arraySize].yCrdnt;
        let dX = -PLANES[0].xCrdnt+PLANES[arraySize].xCrdnt;
        PLANES[arraySize].angle=90+Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
        PLANES[arraySize].speed=2*PLANE_SPEED;
        PLANES[arraySize].live=1.0*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/PLANES[arraySize].speed;      
        PLANE_IMG.style.transform=`rotate(${-90+PLANES[arraySize].angle}deg)`;
        PLANE_IMG.style.transformOrigin="50% 50%";
    }
    else if(type=="bossPlane"){
        PLANES[arraySize].src=IMG[4];
        numOfBossPlane=arraySize;
        let dY = PLANES[0].yCrdnt-PLANES[arraySize].yCrdnt;
        let dX = -PLANES[0].xCrdnt+PLANES[arraySize].xCrdnt;
        PLANES[arraySize].angle=90+Math.asin(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
        PLANES[arraySize].speed=1.0*PLANE_SPEED;
        PLANES[arraySize].live=Infinity;
        PLANE_IMG.style.transform=`rotate(${-90+PLANES[arraySize].angle}deg)`;
        PLANE_IMG.style.transformOrigin="50% 50%";
    }
    PLANES[arraySize].birth=d.getTime();
    PLANE_IMG.style.left=PLANES[arraySize].xCrdnt+"px";
    PLANE_IMG.style.top=PLANES[arraySize].yCrdnt+"px";
    PLANE_IMG.style.margin="0px";
    PLANE_IMG.style.padding="0px";
}
function fireMyBullets(){//my airplane places (fires) bullets if space is pressed, bullets are brought to move with other function
    if(KEY_PRESSED[" "]){
        let arraySize;
        for (let j = 0; j < playerBulletsPerShot; j++) {
            const d = new Date();
            const dAngle=2;
            const BULLET_IMG = document.createElement("img");
            PLAY_SCREEN.appendChild(BULLET_IMG);
            let posX=parseInt(MY_AIRPLANE.style.left);
            let posY=parseInt(MY_AIRPLANE.style.top);
            arraySize = BULLETS[0].class.length;
            BULLETS[0].class.push("bullet_"+"0"+"_"+arraySize);
            BULLET_IMG.setAttribute("class", BULLETS[0].class[arraySize]);
            BULLET_IMG.setAttribute("src", IMG[1][0]);
            BULLETS[0].angle.push(-90-0.5*(playerBulletsPerShot-1)*dAngle+j*dAngle); 
            BULLETS[0].xCrdnt.push(posX+(getWidth(MY_AIRPLANE)-getWidth(BULLET_IMG))*0.5);
            BULLETS[0].yCrdnt.push(posY+0.5*getHeight(BULLET_IMG)*Math.pow(-1, j));
            BULLETS[0].birth.push(d.getTime());
            BULLETS[0].live.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[0].speed); 
            BULLET_IMG.style.left=BULLETS[0].xCrdnt[arraySize]+"px";
            BULLET_IMG.style.top=BULLETS[0].yCrdnt[arraySize]+"px";
            BULLET_IMG.style.transform=`rotate(${-90+BULLETS[0].angle[arraySize]}deg)`;;
            BULLET_IMG.style.zIndex=-1;
            BULLET_IMG.style.margin="0px";
            BULLET_IMG.style.padding="0px";
        }
        if((BULLETS[0].birth[arraySize]-BULLETS[0].birth[arraySize-playerBulletsPerShot])<myFireInterval){
            for (let j = 0; j < playerBulletsPerShot; j++) { 
                const BULLET_IMG = document.querySelector(`.${BULLETS[0].class[arraySize-j]}`);
                BULLET_IMG.remove();
                BULLETS[0].class.pop();
                BULLETS[0].angle.pop();
                BULLETS[0].xCrdnt.pop();
                BULLETS[0].yCrdnt.pop();
                BULLETS[0].birth.pop();
                BULLETS[0].live.pop();
            }
        }
    }
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
                BULLETS[i].angle.push(PLANES[i].angle-0.5*bulletFanAngle+j*dAngle);
                const fi=PLANES[i].angle-90;
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
                BULLETS[i].live.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[i].speed); 
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
function hideOverflowedElements(){//hides airplanes and bullets which were alive longer then the time required to cross play screen thought
    for (let i = 1; i < PLANES.length; i++) {
        const d = new Date();       
        let timeLived=d.getTime();
        timeLived-=PLANES[i].birth;
        if(timeLived>PLANES[i].live){
            const DEL_IMG = document.querySelector(`.${PLANES[i].class}`);
            DEL_IMG.style.display="none";
        }
    }
    for (let i = 0; i < BULLETS.length; i++) {
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const d = new Date();       
            let timeLived=d.getTime();
            timeLived-=BULLETS[i].birth[j];
            if(timeLived>BULLETS[i].live[j]){
                const DEL_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
                DEL_IMG.style.display="none";
            }
        }
    }
}
function killEnemyPlane(){// my bullets collition with enemy airplane
    for (let j = 0; j < BULLETS[0].class.length; j++) {
        const B_IMG = document.querySelector(`.${BULLETS[0].class[j]}`);
        if(B_IMG.style.display!="none"){
            for (let i = 1; i < PLANES.length; i++) {
                const P_IMG = document.querySelector(`.${PLANES[i].class}`);
                if(P_IMG.style.display!="none"){
                    if(isCollision(P_IMG, B_IMG)){
                        if(i!=numOfBossPlane){
                            P_IMG.style.display="none";
                            B_IMG.style.display="none";
                            addToQueue(P_IMG);
                        }else{
                            B_IMG.style.display="none";
                            bossHealth--;
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
function isCollision(element0, element1){
    let x0=parseFloat(element0.style.left)+0.5*getWidth(element0);
    let y0=parseFloat(element0.style.top)+0.5*getHeight(element0);;
    let x1=parseFloat(element1.style.left)+0.5*getWidth(element1);;
    let y1=parseFloat(element1.style.top)+0.5*getHeight(element1);;;
    let distance=Math.sqrt(Math.pow((x1-x0), 2)+Math.pow((y1-y0), 2));
    let r0=0.5*getWidth(element0);
    let r1=0.5*getWidth(element1);
    if((r0+r1)>distance){
        return true;
    }else{
        return false;
    }
}
function getPlaneType(element){
    const filename = element.src.substring(element.src.lastIndexOf('/')+1);
    const planeType=filename.substring(0,(filename.length-5));
    return planeType;
}
function countShotPlane(element){
    const planeType=getPlaneType(element);
    if(element!=explodedObject[explodedObject.length-1]){//does not allow to count same already shot airplane
        SHOT_ENEMIES_COUNTER[planeType]++;
    }
    reward(planeType);
}
function reward(planeType){
    if(planeType=="enemy2ndPlane"){
        if((SHOT_ENEMIES_COUNTER["enemy2ndPlane"] % 10) == 0){
            lives++;
            highlightAnimation(LIVES_DIV);
        }  
    }
    if(planeType=="enemy1stPlane"){
        if((SHOT_ENEMIES_COUNTER["enemy1stPlane"] % 5) == 0){
            playerBulletsPerShot=3;
            highlightAnimation(WEAPON_DIV);
        }
    }
}
function addToQueue(element){
    countShotPlane(element);
    explodedObject.push(element);
    explosionCounter.push(0);    
    const EXPL = document.createElement("img");
    EXPL.src="img/bang0.png";
    PLAY_SCREEN.appendChild(EXPL);
    explosions.push(EXPL);
}
function drawExplodedObject(){
    // console.log(explodedObject.length);
    for (let i = 0; i < explodedObject.length; i++) {
        explosion(i);
    }
}
function explosion(i){
    // let explosionSize=90;
    let explosionSize;
    let explosionStep;
    if (explosionCounter[i]!="no"){
        
        // console.log(explosionCounter[i]);
        explodedObject[i].style.display="";
        let planeWidth=0;
        let planeHeight=0;
        if(getWidth(explodedObject[i])>0){
            planeWidth=getWidth(explodedObject[i]);
            explosionStep=Math.ceil(0.5*planeWidth);
            explosionSize=explosionStep*3;
        }
        if (getHeight(explodedObject[i])){
            planeHeight=getHeight(explodedObject[i]);
        }
        // explosionCounter[i]+=30; 
        explosionCounter[i]+=explosionStep; 
        explosions[i].style.transform=explodedObject[i].style.transform;
        if((explosionCounter[i]<=explosionSize) && (explosionCounter[i]>=0)){
            explosions[i].style.width=explosionCounter[i]+"px";
            explosions[i].style.height=explosionCounter[i]+"px";
            explosions[i].style.left=(parseFloat(explodedObject[i].style.left)+0.5*planeWidth-0.5*explosionCounter[i])+"px";
            explosions[i].style.top=(parseFloat(explodedObject[i].style.top)+0.5*planeHeight-0.5*explosionCounter[i])+"px";
            // console.log((0.5*getWidth(explodedObject[i])-0.5*explosionCounter[i])+" . "+(0.5*getHeight(explodedObject[i])-0.5*explosionCounter[i]));
        } else if ((explosionCounter[i]>explosionSize) && (explosionCounter[i]<=(2*explosionSize))){
            explodedObject[i].style.display="none";
            explosions[i].style.width=((2*explosionSize)-explosionCounter[i])+"px";
            explosions[i].style.height=((2*explosionSize)-explosionCounter[i])+"px";
            explosions[i].style.left=(parseFloat(explodedObject[i].style.left)+0.5*planeWidth-explosionSize+0.5*explosionCounter[i])+"px";
            explosions[i].style.top=(parseFloat(explodedObject[i].style.top)+0.5*planeHeight-explosionSize+0.5*explosionCounter[i])+"px";
            // console.log((0.5*getWidth(explodedObject[i])-60+0.5*explosionCounter[i])+" . "+(0.5*getHeight(explodedObject[i])-60+0.5*explosionCounter[i]));
        } else {
            explodedObject[i].style.display="none";
            explosions[i].style.display="none";
            explosionCounter[i]="no";
        }
    }
}
function killMyPlane(){//enemy airplanes and bullets collision with my airplane
    const MY_P_IMG = document.querySelector(`.${PLANES[0].class}`);
    for (let i = 1; i < BULLETS.length; i++) {//collision with a bullet
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const B_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
            if(B_IMG.style.display!="none"){
                if(isCollision(MY_P_IMG, B_IMG)){
                    B_IMG.style.display="none";
                    lives--;
                    playerBulletsPerShot=1;
                    highlightAnimation(MY_P_IMG);
                    if(lives<=0){addToQueue(MY_P_IMG);}
                } 
            }
        }
    }
    for (let i = 1; i < PLANES.length; i++) {//collision with an enemy plane
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        if(P_IMG.style.display!="none"){
            if(isCollision(MY_P_IMG, P_IMG)){
                if(i!=numOfBossPlane){
                    P_IMG.style.display="none";
                    countShotPlane(P_IMG);
                }
                lives--;
                playerBulletsPerShot=1;
                highlightAnimation(MY_P_IMG);
                if(lives<=0){addToQueue(MY_P_IMG);}
            }
        }
    }
}
function highlightAnimation(element){
    element.style.animation="beingShot";
    element.style.animationDuration="0.1s";
    element.style.animationIterationCount ="3";
    element.addEventListener("animationend", function(){
        element.style.animation="";
    })
}
function gameOver(){//game over if zero lives left
    const P_IMG = document.querySelector(`.${PLANES[0].class}`);  
    if(lives<=0){
        additionalTacts++;
        if(additionalTacts>6){
            P_IMG.style.display="none";
            output="<h2>Game over!</h2>";
            output+=`<p>${SHOT_ENEMIES_COUNTER['enemy1stPlane']} ✕ <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} ✕ <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['bossPlane']} ✕ <img src='${IMG[4][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img></p>`;
            GAMEOVER_DIV.innerHTML=output;
            GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
            GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
            clearInterval(playGame);            
        }
    }
}
function gameWin(){
    const P_IMG = document.querySelector(`.${PLANES[numOfBossPlane].class}`);
    if(bossHealth<=0){
        additionalTacts++;
        if(additionalTacts>6){
            P_IMG.style.display="none";
            output="<h2>You win!</h2>";
            output+=`<p>${SHOT_ENEMIES_COUNTER['enemy1stPlane']} ✕ <img src='${IMG[2][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['enemy2ndPlane']} ✕ <img src='${IMG[3][1]}' style='width: 20px; margin: 2px; transform: rotate(180deg);'></img><br>`;
            output+=`${SHOT_ENEMIES_COUNTER['bossPlane']} ✕ <img src='${IMG[4][1]}' style='width: 25px; margin: 2px; transform: rotate(180deg);'></img></p>`;
            GAMEOVER_DIV.innerHTML=output;
            GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
            GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
            clearInterval(playGame);
        }
    }
}
function movePlanes(){//moves all enemy airplanes
    for (let i = 1; i < PLANES.length; i++) {
        // console.log(PLANES[i].speed);
        const MOVE_IMG = document.querySelector(`.${PLANES[i].class}`);
        if(MOVE_IMG.style.display!="none"){
            if(i==numOfBossPlane){
                const PLANE_IMG = document.querySelector(`.${PLANES[i].class}`);
                // let dY = PLANES[0].yCrdnt-PLANES[i].yCrdnt;
                // let dX = -PLANES[0].xCrdnt+PLANES[i].xCrdnt;
                let dY = playerTrace.getTipY()-PLANES[i].yCrdnt;
                let dX = -playerTrace.getTipX()+PLANES[i].xCrdnt;
                // console.log(playerTrace.getTipX()+" . "+playerTrace.getTipY());
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
function moveMyAirplane() {// moves my airplane when keyboard arrows are pressed 
    let posX=parseInt(MY_AIRPLANE.style.left);
    let posY=parseInt(MY_AIRPLANE.style.top)
    if(KEY_PRESSED["ArrowLeft"]){
        posX-=MOVE_PER_CLICK;
        if(posX<0){posX=0;}
        PLANES[0].xCrdnt=posX;
        MY_AIRPLANE.style.left=posX+"px";
    }
    if(KEY_PRESSED["ArrowRight"]){
        posX+=MOVE_PER_CLICK;
        rightBorder=S_WIDTH-getWidth(MY_AIRPLANE);
        if(posX>rightBorder){posX=rightBorder;}
        PLANES[0].xCrdnt=posX;
        MY_AIRPLANE.style.left=posX+"px";
    }
    if(KEY_PRESSED["ArrowUp"]){
        posY-=MOVE_PER_CLICK;
        if(posY<0){posY=0;}
        PLANES[0].yCrdnt=posY;
        MY_AIRPLANE.style.top=posY+"px";
    }
    if(KEY_PRESSED["ArrowDown"]){
        posY+=MOVE_PER_CLICK;
        bottomBorder=S_HEIGHT-getHeight(MY_AIRPLANE);
        if(posY>bottomBorder){posY=bottomBorder;}
        PLANES[0].yCrdnt=posY;
        MY_AIRPLANE.style.top=posY+"px";
    }
    playerTrace.toTrace(PLANES[0].xCrdnt, PLANES[0].yCrdnt);
}
function play(){
    playGame=setInterval(function(){
        counter++;  
        propellerRotation();
        spawnEnemies();
        moveMyAirplane();
        fireMyBullets();
        movePlanes();
        moveBullets();
        hideOverflowedElements();
        killMyPlane();
        killEnemyPlane();
        showStats();
        drawExplodedObject();
        background();
        gameWin();
        gameOver();
    }, TACT); 
}
function waitSpacePress(){
    showStats();
    if(KEY_PRESSED[" "] && !playGame){
        const d=new Date();
        endPause=d.getTime();
        if(startPause==0){startPause=d.getTime();}
        for (let i = 0; i < PLANES.length; i++) {//extends lives of airplanes and bullets by duration of the pause
            PLANES[i].birth+=(endPause-startPause);
            for (let j = 0; j < BULLETS[i].birth.length; j++) {
                BULLETS[i].birth[j]+=(endPause-startPause); 
            } 
        }
        // console.log(endPause-startPause);
        GAMEOVER_DIV.innerHTML="";
        play();
    }
}
function pauseGame(){
    if(KEY_PRESSED["p"] || KEY_PRESSED["P"]){
        clearInterval(playGame);
        const d=new Date();
        startPause=d.getTime();
        playGame=false;
        // waitSpacePress();
        GAMEOVER_DIV.innerHTML="<p>Press [space] to play.</p>";
        GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
        GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
        GAMEOVER_DIV.style.zIndex=10;
    }
}

PLAY_SCREEN.style.filter = "brightness(200%)";
RADIO_DAY.checked = true;
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
    // PLAY_SCREEN.focus();
    restart();
    waitSpacePress();
})
window.addEventListener("load", function(){//for chrome browser
    PLANES[0].xCrdnt=(S_WIDTH-getWidth(MY_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(MY_AIRPLANE);
    MY_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    MY_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";
})
document.addEventListener("keydown", function(e){
    KEY_PRESSED[e.key] = true;
    waitSpacePress();
    pauseGame();
})
document.addEventListener("keyup", function(e){
    delete KEY_PRESSED[e.key];
})

restart();
waitSpacePress();