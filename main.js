// main.js — Phaser CDN ile birlikte kullanılacak (import yok!)
import Phaser from "phaser";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87ceeb',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let boat;
let cursors;

// Fizik/haraket değişkenleri
let velocity = 0;
let directionAngle = 0; // Teknenin yönü (derece, 0-359). 0 = yukarı (sprite frame 0 için)
const MAX_SPEED = 200;          // px/s
const ACCELERATION = 300;       // px/s^2
const DECELERATION = 300;       // px/s^2 (fren / sürtünme)
const TURN_SPEED = 120;         // derece/saniye

const game = new Phaser.Game(config);

function preload() {
    // boat16dir.png dosyasını index.html ile aynı klasöre koy
    this.load.spritesheet('boat', 'boat16dir.png', {
        frameWidth: 64,
        frameHeight: 64
    });
}

function create() {
    boat = this.physics.add.sprite(400, 300, 'boat', 0);
    boat.setCollideWorldBounds(true);
    boat.setOrigin(0.5, 0.5);

    // Başlangıç yönü: yukarı (frame 0). Eğer farklı başlatmak istersen değiştir.
    directionAngle = 0;
    velocity = 0;

    cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
    // delta milisaniye cinsinden geliyor -> saniyeye çevirelim
    const dt = delta / 1000;

    // Dönüş: A/D veya sol/sağ oklarıyla
    if (cursors.left.isDown) {
        directionAngle += TURN_SPEED * dt;
    } else if (cursors.right.isDown) {
        directionAngle -= TURN_SPEED * dt;
    }
    directionAngle = (directionAngle + 360) % 360;

    // İvme / yavaşlama: W/S veya yukarı/aşağı oklarıyla
    if (cursors.up.isDown) {
        velocity = Math.min(velocity + ACCELERATION * dt, MAX_SPEED);
    } else if (cursors.down.isDown) {
        velocity = Math.max(velocity - ACCELERATION * dt, -MAX_SPEED / 2);
    } else {
        // doğal yavaşlama (fren/sürtünme)
        if (velocity > 0) {
            velocity = Math.max(velocity - DECELERATION * dt, 0);
        } else if (velocity < 0) {
            velocity = Math.min(velocity + DECELERATION * dt, 0);
        }
    }

    // Hareket vektörü: sprite sheet'te frame 0 yukarıya baktığı için -90 düzeltmesi yok.
    // (Burada angleDeg 0 yukarı, Phaser 0 sağa, bu yüzden frame hesaplamasında direkt kullanacağız)
    // Ancak hareket için trigonometrik fonksiyonda 0 derecenin yukarı olması için sin/cos dönüşümü:
    // angleRad = Phaser.Math.DegToRad(directionAngle - 90)  -> cos/sin ile uygula
    const angleRad = Phaser.Math.DegToRad(directionAngle - 90);
    const vx = Math.cos(angleRad) * velocity;
    const vy = Math.sin(angleRad) * velocity;

    boat.setVelocity(vx, vy);

    // Frame seçimi: 16 yön -> her frame 22.5 derece
    let frameIndex = Math.round(directionAngle / 22.5) % 16;
    boat.setFrame(frameIndex);

    // Sprite'ın kendi rotation'ını sıfırla (görsel rotation istemiyoruz)
    boat.rotation = 0;
}
