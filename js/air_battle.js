var GAME_DURATION = 60000;//miliseconds befor boss appears
var TOTAL_SCORE = 1000;
var MOVE_PER_CLICK=10;//px per keydown repeat frequency
var BULLET_SPEED=10;//px per setInterval tact
var PLANE_SPEED=3//px per setInterval tact
var TACT = 100;// milisec
var TRIG_K = Math.PI/180;
var playGame;
var DIFFICULTY = [// first stage and only so far, has 5 level of progressing difficulty, when last level achived Boss airplane appears.
    {
        "score":        [0,         0.1, 0.2, 0.4, 0.7, 1],
        "enemy1Rate":   [45,        35,  30,  25,  20,  25],
        "bullet1Rate":  [40,        36,  32,  28,  24,  28],
        // "enemy2Rate":   [Infinity,  45,  35,  30,  22,  Infinity],
        "enemy2Rate":   [20,  45,  35,  30,  22,  Infinity],
        // "bullet2Rate":  [Infinity,  25,  23,  22,  20,  Infinity],
        "bullet2Rate":  [10,  25,  23,  22,  20,  Infinity],
        "boss":         [false, false, false, false, false, true]
    }
];
var backgroundNum=0;
var score=0; 
var counter=0;
var lives=3;

document.body.innerHTML="<h2>Air battle</h2><div id='play-screen'><img src='img/myPlane0.png' class='my-airplane'></div><div class='under-screen'><button id='restart'>Restart</button><p>Use arrows to move: ← Left, → Right, ↑ Up, ↓ Down. Press [space] to fire.</p></div><script src='js/air_battle.js'></script>";
var PLAY_SCREEN = document.getElementById("play-screen");
var BTN_RESTART = document.getElementById("restart");
var MY_AIRPLANE = document.querySelector(".my-airplane");
var LIVES_DIV = document.createElement("div");
var SCORE_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(LIVES_DIV);
PLAY_SCREEN.appendChild(SCORE_DIV);

var GAMEOVER_DIV = document.createElement("div");
PLAY_SCREEN.appendChild(GAMEOVER_DIV);
    
var S_WIDTH = PLAY_SCREEN.clientWidth;
var S_HEIGHT = PLAY_SCREEN.clientHeight;
var IMG = [
    ['img/myPlane0.png','img/myPlane1.png','img/myPlane2.png'],//my airplane
    ['img/bullet0.png','img/bullet1.png'],//bullets
    ['img/enemy1stPlane0.png','img/enemy1stPlane1.png','img/enemy1stPlane2.png'],//enemy airplane 
    ['img/enemy2ndPlane0.png','img/enemy2ndPlane1.png','img/enemy2ndPlane2.png'],//enemy airplane 
    ['img/bossPlane.png0','img/bossPlane1.png','img/bossPlane2.png']//boss airplane
];
var KEY_PRESSED = [];
var PLANES=[//array with airplaines and their properties
    {
    "class": "my-airplane",
    "src": IMG[0],
    "xCrdnt": (S_WIDTH-getWidth(MY_AIRPLANE))*0.5,
    "yCrdnt": S_HEIGHT-getHeight(MY_AIRPLANE),
    "angle": 0,
    "speed": 0,
    "birth": null,
    "live": null
    }
];
var BULLETS =[//array with bullets and their properties, index corresponds to the airplane which shot that bullets
    {
    "class": [],
    "src": IMG[1][0],
    "xCrdnt": [],
    "yCrdnt": [],
    "angle": [],
    "speed": BULLET_SPEED,
    "birth": [],
    "live": []
    }
];
BTN_RESTART.addEventListener("click", function(){
    // restart();
    // play();
})
document.addEventListener("DOMContentLoaded", function(){//for chrome bro
    PLANES[0].xCrdnt=(S_WIDTH-getWidth(MY_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(MY_AIRPLANE);
    MY_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    MY_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";
})
document.addEventListener("keydown", function(e){
    KEY_PRESSED[e.key] = true;
})
document.addEventListener("keyup", function(e){
    delete KEY_PRESSED[e.key];
})
function background(){//moves background sea for fly forward illusion 

    if((counter % 5) == 0){
        backgroundNum++;
        if(backgroundNum==3){
            backgroundNum=0;
        }

        PLAY_SCREEN.style.backgroundImage = `url('img/backgroung${backgroundNum}.png')`;
        PLAY_SCREEN.style.filter = "brightness(200%)";
    }
    
}

function restart(){//does not work yet
    clearInterval(playGame);
    GAME_DURATION = 60000;//miliseconds befor boss appears
    TOTAL_SCORE = 1000;
    MOVE_PER_CLICK=10;//px per keydown repeat frequency
    BULLET_SPEED=10;//px per setInterval tact
    PLANE_SPEED=3//px per setInterval tact
    TACT = 100;// milisec
    TRIG_K = Math.PI/180;
    DIFFICULTY = [
        {
            "score":        [0,         0.1, 0.2, 0.4, 0.7, 1],
            "enemy1Rate":   [45,        35,  30,  25,  20,  25],
            "bullet1Rate":  [40,        36,  32,  28,  24,  28],
            // "enemy2Rate":   [Infinity,  45,  35,  30,  22,  Infinity],
            "enemy2Rate":   [20,  45,  35,  30,  22,  Infinity],
            // "bullet2Rate":  [Infinity,  25,  23,  22,  20,  Infinity],
            "bullet2Rate":  [10,  25,  23,  22,  20,  Infinity],
            "boss":         [false, false, false, false, false, true]
        }
    ];
    score=0; 
    counter=0;
    lives=3;

    PLAY_SCREEN.innerHTML="<img src='img/myPlane0.png' class='my-airplane'>";      
    MY_AIRPLANE = document.querySelector(".my-airplane"); 

    PLAY_SCREEN.appendChild(LIVES_DIV);
    PLAY_SCREEN.appendChild(SCORE_DIV);

    S_WIDTH = PLAY_SCREEN.clientWidth;
    S_HEIGHT = PLAY_SCREEN.clientHeight;

    IMG = [
        ['img/myPlane0.png','img/myPlane1.png','img/myPlane2.png'],//my airplane
        ['img/bullet0.png','img/bullet1.png'],//bullets
        ['img/enemy1stPlane0.png','img/enemy1stPlane1.png','img/enemy1stPlane2.png'],//enemy airplane 
        ['img/enemy2ndPlane0.png','img/enemy2ndPlane1.png','img/enemy2ndPlane2.png'],//enemy airplane 
        ['img/bossPlane.png0','img/bossPlane1.png','img/bossPlane2.png']//boss airplane
    ];
    KEY_PRESSED = [];
    PLANES=[
        {
        "class": "my-airplane",
        "src": IMG[0],
        "xCrdnt": (S_WIDTH-getWidth(MY_AIRPLANE))*0.5,
        "yCrdnt": S_HEIGHT-getHeight(MY_AIRPLANE),
        "angle": 0,
        "speed": 0,
        "birth": null,
        "live": null
        }
    ];
    BULLETS =[
        {
        "class": [],
        "src": IMG[1][0],
        "xCrdnt": [],
        "yCrdnt": [],
        "angle": [],
        "speed": BULLET_SPEED,
        "birth": [],
        "live": []
        }
    ];
    PLANES[0].xCrdnt=(S_WIDTH-getWidth(MY_AIRPLANE))*0.5;
    PLANES[0].yCrdnt=S_HEIGHT-getHeight(MY_AIRPLANE);
    MY_AIRPLANE.style.left=PLANES[0].xCrdnt+"px";
    MY_AIRPLANE.style.top=PLANES[0].yCrdnt+"px";
}
function getWidth(element){
    let rectangle=element.getBoundingClientRect();
    return rectangle.width;
}
function getHeight(element){
    let rectangle=element.getBoundingClientRect();
    return rectangle.height;
}
function showStats(){//shows score and lives
    LIVES_DIV.style.right="0px";
    LIVES_DIV.style.top="0px";
    LIVES_DIV.style.margin="5px";
    let output ="";
    for (let i = 0; i < lives; i++) {
        output+=`<img src='${IMG[0][0]}' style='width: 20px; margin: 2px;'></img>`;
    }
    LIVES_DIV.innerHTML=output;

    SCORE_DIV.style.right="0px";
    SCORE_DIV.style.bottom="0px";
    SCORE_DIV.style.margin="5px";
    SCORE_DIV.innerHTML="Score: "+Math.floor(score);
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
        if((counter % DIFFICULTY[0].enemy1Rate[5]) == 0){
            addEnemyPlane(IMG[2][0],"enemy1stPlane");
        }
        if((counter % DIFFICULTY[0].enemy2Rate[5]) == 0){
            addEnemyPlane(IMG[3][0],"enemy2ndPlane");
        }
            if((counter % DIFFICULTY[0].bullet1Rate[5]) == 0){
                enemiesFire("enemy1stPlane");
            }
            if((counter % DIFFICULTY[0].bullet2Rate[5]) == 0){
                enemiesFire("enemy2ndPlane");
            }
    }
    // console.log(score+"  ");    
        
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
        "src": IMG[1][0],
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
        PLANES[arraySize].angle=90;
        PLANES[arraySize].speed=PLANE_SPEED;
        PLANES[arraySize].live=1.3*TACT*S_HEIGHT/PLANES[arraySize].speed;
        // PLANE_IMG.style.transformOrigin="50% 100%";
        PLANE_IMG.style.transform="rotate(180deg)";
    }
    else if(type=="enemy2ndPlane"){
        // PLANES[arraySize].angle=45+90*Math.random();
        let dY = PLANES[0].yCrdnt-PLANES[arraySize].yCrdnt;
        let dX = PLANES[0].xCrdnt-PLANES[arraySize].xCrdnt;
        PLANES[arraySize].angle=Math.acos(dX/Math.sqrt(Math.pow(dY, 2)+Math.pow(dX, 2)))/TRIG_K;
        PLANES[arraySize].speed=2*PLANE_SPEED;
        PLANES[arraySize].live=1.0*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/PLANES[arraySize].speed;
        // PLANE_IMG.style.transformOrigin="50% 100%";
        PLANE_IMG.style.transform=`rotate(${90+PLANES[arraySize].angle}deg)`;
    }
    PLANES[arraySize].birth=d.getTime();
    PLANE_IMG.style.left=PLANES[arraySize].xCrdnt+"px";
    PLANE_IMG.style.top=PLANES[arraySize].yCrdnt+"px";
    PLANE_IMG.style.margin="0px";
    PLANE_IMG.style.padding="0px";
}
function fireMyBullets(){//my airplane places (fires) bullets if space is pressed, bullets are brought to move with other function
    if(KEY_PRESSED[" "]){
        const d = new Date();
        const BULLET_IMG = document.createElement("img");
        PLAY_SCREEN.appendChild(BULLET_IMG);
        let posX=parseInt(MY_AIRPLANE.style.left);
        let posY=parseInt(MY_AIRPLANE.style.top);
        let arraySize = BULLETS[0].class.length;
        BULLETS[0].class.push("bullet_"+"0"+"_"+arraySize);
        BULLET_IMG.setAttribute("class", BULLETS[0].class[arraySize]);
        BULLET_IMG.setAttribute("src", IMG[1][0]);

        BULLETS[0].xCrdnt.push(posX+(getWidth(MY_AIRPLANE)-getWidth(BULLET_IMG))*0.5);
        BULLETS[0].yCrdnt.push(posY);
        BULLETS[0].angle.push(270); 
        BULLETS[0].birth.push(d.getTime()); 
        BULLETS[0].speed = BULLET_SPEED;
        BULLETS[0].live.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[0].speed); 
        BULLET_IMG.style.left=BULLETS[0].xCrdnt[arraySize]+"px";
        BULLET_IMG.style.top=BULLETS[0].yCrdnt[arraySize]+"px";
        BULLET_IMG.style.zIndex=-1;
        BULLET_IMG.style.margin="0px";
        BULLET_IMG.style.padding="0px";
    }
}
function enemiesFire(type){//enemy airplane places (fire) bullets, bullets are brought to move with other function
    for (let i = 1; i < PLANES.length; i++) {
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        const planeClass=PLANES[i].class.substring(0,13);
        let planeType="";

        if((P_IMG.style.display != "none") && (planeClass==type)){
            const d = new Date();
            const BULLET_IMG = document.createElement("img");
            PLAY_SCREEN.appendChild(BULLET_IMG);
            let posX=PLANES[i].xCrdnt;
            let posY=PLANES[i].yCrdnt;
            let arraySize = BULLETS[i].class.length;
            BULLETS[i].class.push("bullet_"+i+"_"+arraySize);
            BULLET_IMG.setAttribute("class", BULLETS[i].class[arraySize]);
            BULLETS[i].src=IMG[1][0];
            BULLET_IMG.setAttribute("src", BULLETS[i].src);
            BULLETS[i].angle.push(PLANES[i].angle);

            let dX = 0;
            let dY = 0;
            // dX = 0.5*getHeight(P_IMG)*Math.sin(-PLANES[i].angle+90);
            // dY = 0.5*getHeight(P_IMG)*(1-Math.cos(-PLANES[i].angle+90;
            BULLETS[i].xCrdnt.push(posX+(getWidth(P_IMG)-getWidth(BULLET_IMG))*0.5 + dX);
            BULLETS[i].yCrdnt.push(posY+getHeight(P_IMG)-getHeight(BULLET_IMG) + dY);
             
            BULLETS[i].birth.push(d.getTime());
            BULLETS[i].speed = BULLET_SPEED;
            BULLETS[i].live.push(1.1*TACT*Math.sqrt(S_WIDTH*S_WIDTH+S_HEIGHT*S_HEIGHT)/BULLETS[i].speed); 
            if(type=="enemy1stPlane"){
                BULLET_IMG.style.left=BULLETS[i].xCrdnt[arraySize]+"px";
                BULLET_IMG.style.top=BULLETS[i].yCrdnt[arraySize]+"px";
            }
            if(type=="enemy2ndPlane"){
                BULLET_IMG.style.left=BULLETS[i].xCrdnt[arraySize]+"px";
                BULLET_IMG.style.top=BULLETS[i].yCrdnt[arraySize]+"px";
            }
            // BULLET_IMG.style.transformOrigin="50% 100%";
            BULLET_IMG.style.transform=`rotate(${90+PLANES[i].angle}deg)`;
            BULLET_IMG.style.zIndex=-1;
            BULLET_IMG.style.margin="0px";
            BULLET_IMG.style.padding="0px";
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
                    const rightBulletEdge=BULLETS[0].xCrdnt[j]+getWidth(B_IMG);
                    const rightPlaneEdge=PLANES[i].xCrdnt+getWidth(P_IMG);
                    if((BULLETS[0].xCrdnt[j]>PLANES[i].xCrdnt) && (rightBulletEdge<rightPlaneEdge)){
                        const btmPlaneEdge=PLANES[i].yCrdnt+getHeight(P_IMG);
                        if((BULLETS[0].yCrdnt[j]>PLANES[i].yCrdnt) && (BULLETS[0].yCrdnt[j]<btmPlaneEdge)){
                            P_IMG.style.display="none";
                            B_IMG.style.display="none";
                            explodedPlane.push(P_IMG);
                            explosionCounter.push(0);    
                            const EXPL = document.createElement("img");
                            EXPL.src="img/bang0.png";
                            PLAY_SCREEN.appendChild(EXPL);
                            explosions.push(EXPL);
                        }
                    }
                }
            }
        }
    }
}
var explosionCounter=[];
var explodedPlane=[];
var explosions=[];
function drawExplodedPlane(){
    // console.log(explodedPlane.length);
    for (let i = 0; i < explodedPlane.length; i++) {
        explosion(i);
    }
}
function explosion(i){
    let explosionSize=90;
    if (explosionCounter[i]!="no"){
        explosionCounter[i]+=30; 
        console.log(explosionCounter[i]);
        explodedPlane[i].style.display="";
        let planeWidth=0;
        let planeHeight=0;
        if(getWidth(explodedPlane[i])>0){
            planeWidth=getWidth(explodedPlane[i]);
        }
        if (getHeight(explodedPlane[i])){
            planeHeight=getHeight(explodedPlane[i]);
        }
        explosions[i].style.transform=explodedPlane[i].style.transform;
        if((explosionCounter[i]<=explosionSize) && (explosionCounter[i]>=0)){
            explosions[i].style.width=explosionCounter[i]+"px";
            explosions[i].style.height=explosionCounter[i]+"px";
            explosions[i].style.left=(parseFloat(explodedPlane[i].style.left)+0.5*planeWidth-0.5*explosionCounter[i])+"px";
            explosions[i].style.top=(parseFloat(explodedPlane[i].style.top)+0.5*planeHeight-0.5*explosionCounter[i])+"px";
            // console.log((0.5*getWidth(explodedPlane[i])-0.5*explosionCounter[i])+" . "+(0.5*getHeight(explodedPlane[i])-0.5*explosionCounter[i]));
        } else if ((explosionCounter[i]>explosionSize) && (explosionCounter[i]<=(2*explosionSize))){
            explodedPlane[i].style.display="none";
            explosions[i].style.width=((2*explosionSize)-explosionCounter[i])+"px";
            explosions[i].style.height=((2*explosionSize)-explosionCounter[i])+"px";
            explosions[i].style.left=(parseFloat(explodedPlane[i].style.left)+0.5*planeWidth-explosionSize+0.5*explosionCounter[i])+"px";
            explosions[i].style.top=(parseFloat(explodedPlane[i].style.top)+0.5*planeHeight-explosionSize+0.5*explosionCounter[i])+"px";
            // console.log((0.5*getWidth(explodedPlane[i])-60+0.5*explosionCounter[i])+" . "+(0.5*getHeight(explodedPlane[i])-60+0.5*explosionCounter[i]));
        } else {
            explodedPlane[i].style.display="none";
            explosions[i].style.display="none";
            explosionCounter[i]="no";
        }
    }
}
function killMyPlane(){//enemy airplanes and bullets collision with my airplane
    for (let i = 1; i < BULLETS.length; i++) {//collision with a bullet
        for (let j = 0; j < BULLETS[i].class.length; j++) {
            const B_IMG = document.querySelector(`.${BULLETS[i].class[j]}`);
            if(B_IMG.style.display!="none"){
        
                const P_IMG = document.querySelector(`.${PLANES[0].class}`);
                const rightBulletEdge=BULLETS[i].xCrdnt[j]+getWidth(B_IMG);
                const rightPlaneEdge=PLANES[0].xCrdnt+getWidth(P_IMG);
                if((BULLETS[i].xCrdnt[j]>PLANES[0].xCrdnt) && (rightBulletEdge<rightPlaneEdge)){
                    const btmBulletEdge=BULLETS[i].yCrdnt[j]+getHeight(B_IMG);
                    const btmPlaneEdge=PLANES[0].yCrdnt+getHeight(P_IMG);
                    if((btmBulletEdge>PLANES[0].yCrdnt) && (btmBulletEdge<btmPlaneEdge)){
                        // P_IMG.style.display="none"; 
                        B_IMG.style.display="none";
                        lives--;
                    }
                } 
            }
        }
    }
    for (let i = 1; i < PLANES.length; i++) {//collision with an enemy plane
        const P_IMG = document.querySelector(`.${PLANES[i].class}`);
        const rightPlaneEdge=PLANES[i].xCrdnt+getWidth(P_IMG);
        const rightMyPlanEdge=PLANES[0].xCrdnt+getWidth(MY_AIRPLANE);
        const btmPlaneEdge=PLANES[i].yCrdnt+getHeight(P_IMG);
        const btmMyPlaneEdge=PLANES[0].yCrdnt+getHeight(MY_AIRPLANE);
        if(P_IMG.style.display!="none"){
            if((PLANES[i].xCrdnt>PLANES[0].xCrdnt) && (PLANES[i].xCrdnt<rightMyPlanEdge)){
                if((btmPlaneEdge>PLANES[0].yCrdnt) && (btmPlaneEdge<btmMyPlaneEdge)){
                    P_IMG.style.display="none";
                    lives--;

                }
            }
            if((rightPlaneEdge>PLANES[0].xCrdnt) && (rightPlaneEdge<rightMyPlanEdge)){
                if((btmPlaneEdge>PLANES[0].yCrdnt) && (btmPlaneEdge<btmMyPlaneEdge)){
                    P_IMG.style.display="none";
                    lives--;
                }
            }
        }
    }
}
function gameOver(){//game over if zero lives left
    if(lives<=0){
        GAMEOVER_DIV.innerHTML="<h2>Game over!</h2>"
        GAMEOVER_DIV.style.left=(0.5*S_WIDTH-0.5*getWidth(GAMEOVER_DIV))+"px";
        GAMEOVER_DIV.style.top=(0.5*S_HEIGHT-0.5*getHeight(GAMEOVER_DIV))+"px";
        clearInterval(playGame);
    }

}
function movePlanes(){//moves all enemy airplanes
    for (let i = 1; i < PLANES.length; i++) {
        // console.log(PLANES[i].speed);
        const MOVE_IMG = document.querySelector(`.${PLANES[i].class}`);
        if(MOVE_IMG.style.display!="none"){
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
}
function play(){
    playGame=setInterval(function(){
        counter++;  
        spawnEnemies();
        moveMyAirplane();
        fireMyBullets();
        movePlanes();
        moveBullets();
        hideOverflowedElements();
        killMyPlane();
        killEnemyPlane();
        showStats();
        gameOver();
        background();
        drawExplodedPlane();
        
    }, TACT); 
}

// counter=480;

// restart();
play();


