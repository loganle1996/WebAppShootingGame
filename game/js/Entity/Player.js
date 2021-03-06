import Entity from "./Entity.js";
import {tileSize, ballSize} from "../constants/tileConstants.js";
import ObjectHandlers from "../tiles/ObjectHandlers.js";
import FireBall from "../magic_balls/FireBall.js"
import SoundHandler from "../sounds/SoundHandler.js"
// import contextDebugger from "../main.js"
const allTiles = ObjectHandlers.getInstance().tiles;
const soundHandler = SoundHandler.getInstance();
const Player = (() => {
    class PlayerInstance extends Entity {
        constructor(name, row, col, width, height, solid) {
            super(name, row, col, width, height, solid);
            this.isJumping = false;
            this.animate = false;
            this.frame = 0;
            this.swimFrameDelay = 0;
            this.walkFrameDelay = 0;
            this.isSwimmingUp = false;
            this.isSwimmingDown = false;
            this.isShooting = false;
        }
        isAlive(){
            return this.hp > 0;
        }
        update(){
            super.update();
            this.animate = (this.isMovingLeft || this.isMovingRight || this.isSwimming);
            this.gravity = this.isSwimming? 0.2: 4;
            if(this.animate){
                if(!this.isSwimming){
                    if(this.walkFrameDelay == 0){
                        soundHandler.stopSwimmingSound();
                        soundHandler.inGame_backgrond.volume = 1;
                        this.frame = (this.frame + 1) % 3;
                    }
                    this.walkFrameDelay = (this.walkFrameDelay + 1) % 4;
                }
                else{
                    if(this.swimFrameDelay == 0){
                        soundHandler.inGame_backgrond.volume = 0.2;
                        soundHandler.playSwimmingSound();
                        this.frame = (this.frame + 1) % 5;
                    }
                    this.swimFrameDelay = (this.swimFrameDelay + 1) % 4;
                }
            }
            this.isSwimming = false;
            ObjectHandlers.getInstance().entities.forEach(e => {
                this.checkEntitiesColliding(e);
            })

            allTiles.forEach(t => {
                this.tileColldingCheck(t);
            });
            
            if(this.velR < 25)
                this.velR += this.gravity;

        }
        checkEntitiesColliding(e){
            if(e.getBoundary().intersects(this.getBoundary())){
                soundHandler.playPlayerHurt();
                this.hp -= 100;
                e.die();
            }
        }
        shoot(){
            let newBall = new FireBall('fireBall', this.row, this.col, ballSize, ballSize);
            newBall.velC = this.facing == 0 ? -20 : 20;
            ObjectHandlers.getInstance().addBall(newBall);
        }
        tileColldingCheck(t){
            if(t.name === "waterWall" && !t.solid){
                if(this.intersectsTile(t)){
                    this.isSwimming = true;
                }
                return;
            }
            if(t.name === "fireWall" && this.intersectsTile(t)){
                this.hp -= 100;
                soundHandler.playPlayerHurt();
            }
            if (this.intersectsTopTile(t)) {
                this.row = t.row - this.height;
                this.isJumping = false;
                this.velR = 0;
                if(t.name === "woodBridge" && this.velC === 0)
                    this.velC += t.velC;
                if(!this.isJumping && (this.isMovingLeft || this.isMovingRight)){
                    soundHandler.playFootStepSound();
                }
            }

            if (this.intersectsBottomTile(t)) {
                this.row = t.row + this.height;
            }
            if (this.intersectsRightTile(t)) {
                this.col = t.col + t.width;
                this.velC = 0;
            }
            if (this.intersectsLeftTile(t)) {
                this.col = t.col - t.width;
                this.velC = 0;
            }
        }
        //overried render method
        render(ctx, spriteSheet, tileSize) {
            // ctx.fillStyle = 'green';
            // ctx.fillRect(this.col, this.row, this.width, this.height);
            if(this.facing == 0){
                if(!this.isJumping){
                    if(this.isMovingLeft){
                        if(!this.isSwimming){
                            ctx.drawImage(spriteSheet[this.frame + 5],this.col , this.row , this.width, this.height);
                        }
                        else{
                            ctx.drawImage(spriteSheet[this.frame + 8],this.col, this.row , this.width, this.height);
                        }
                    }
                    else{
                        if (!this.isSwimming) {
                            if (this.isShooting) {
                                ctx.drawImage(spriteSheet[21],this.col, this.row, this.width, this.height);
                            } else {
                                ctx.drawImage(spriteSheet[4], this.col , this.row, this.width, this.height);
                            }
                        } else {
                            ctx.drawImage(spriteSheet[this.frame + 8],this.col, this.row, this.width, this.height);
                        }
                    }
                }
                else{
                    ctx.drawImage(spriteSheet[5],this.col, this.row, this.width, this.height);
                }
            }
            else{
                if (!this.isJumping) {
                    if (this.isMovingRight) {
                        if (!this.isSwimming) {
                            ctx.drawImage(spriteSheet[this.frame + 1], this.col, this.row, this.width, this.height);
                        } else {
                            ctx.drawImage(spriteSheet[this.frame + 15],this.col, this.row, this.width, this.height);
                        }
    
                    } else {
                        if (!this.isSwimming) {
                            if (this.isShooting) {
                                ctx.drawImage(spriteSheet[20], this.col, this.row, this.width, this.height);
                            } else {
                                ctx.drawImage(spriteSheet[0],this.col, this.row, this.width, this.height);
                            }
                        } else {
                            ctx.drawImage(spriteSheet[this.frame + 15], this.col , this.row, this.width, this.height);
                        }
                    }
                } 
                else {
                    ctx.drawImage(spriteSheet[1],this.col, this.row , this.width, this.height);
                }
            }
        }
    }

    let instance;

    function createInstance() {
        return new PlayerInstance("player", 0, 0, tileSize, tileSize, true)
    }

    return {
        getInstance: () => {
            if (!instance)
                instance = createInstance();
            return instance;
        }
    }

})();
export default Player;