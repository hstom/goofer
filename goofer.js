// Canvas page-goofer

let goofer = {};

let lastTS = 0;

goofer.c = document.createElement('canvas');
goofer.c.width = document.documentElement.clientWidth;
goofer.c.height = document.documentElement.clientHeight;
goofer.c.style.position = 'fixed';
goofer.c.style.pointerEvents = 'none';
// c.style.width = '100vmax';
// c.style.height = '100vmax';
goofer.c.style.top = '0';
goofer.c.style.left = '0';

document.body.appendChild(goofer.c);

goofer.ctx = goofer.c.getContext('2d');
// goofer.ctx.globalAlpha = .9;
goofer.ctx.imageSmoothingEnabled = false;
goofer.ctx.fillStyle = "rgba(0, 255, 255, 1)";

goofer.ctx.strokeStyle = "rgba(0, 0, 0, 1)";
goofer.ctx.lineWidth = 1;

goofer.ctx.imageSmoothingEnabled = false;
goofer.ctx.scale(1, 1);

goofer.effects = [];

// Effects
goofer.particleTypes = {
    QSquare: 'QSquare',
    QCircle: 'QCircle'
};

goofer.quantize = (i, q = 10) => Math.floor((i + q/2)/q)*q;

goofer.genParticleEffect = (x,y,c=genColor(), s=10, type=goofer.particleTypes.QSquare) => {
    return {
        x: x + scrollOffsetX,
        y: y + scrollOffsetY,
        i: 0,
        iMax: type === goofer.particleTypes.QSquare ? 120 : 40,
        c: c,
        s: s,
        type: type
    }
};

goofer.genAdvancedEffect = (e) => {
    const i = e.i + 1;
    if(i > e.iMax){
        return [];
    }

    if(e.type === goofer.particleTypes.QSquare){
        const genAdvancedSquare = () => {

            const dX = Math.floor(Math.random() * 12 - 2) + Math.floor(Math.random() * ((i + 10) / e.iMax) * 10);
            const dY = Math.floor(Math.random() * 12 - 2) + Math.floor(Math.random() * ((i + 20) / e.iMax) * 20);

            return Object.assign(
                {},
                e,
                {
                    x: e.x + dX,
                    y: e.y + dY,
                    i
                }
            )
        };
        if(Math.random() > .95 && i < Math.floor(e.iMax / 3)){
            return new Array(3).fill(undefined).map(() => genAdvancedSquare());
        } else {
            return genAdvancedSquare();
        }
    }

    return Object.assign(
        {},
        e,
        {
            i
        }
    );
};

const advanceEffects = () => {
    const ana = goofer.effects.map(e => {
        return goofer.genAdvancedEffect(e);
    });

    goofer.effects = [].concat.apply([], ana);
};

const colors=[
    {r: 255, g: 0, b: 0},
    {r: 0, g: 255, b: 0},
    {r: 0, g: 0, b: 255},
    {r: 255, g: 255, b: 0},
    {r: 255, g: 0, b: 255},
    {r: 0, g: 255, b: 255}
];

const genColor = () => {
    return colors[Math.floor(lastTS) % colors.length];
};

const fillEvent = ({x, y, i, iMax, c: {r, g, b} = genColor(), s, type}) => {
    if(type === goofer.particleTypes.QSquare) {
        goofer.ctx.lineWidth = 1;
        goofer.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(iMax - i)/iMax}`;
        goofer.ctx.strokeStyle = `rgba(0, 0, 0, ${(iMax - i)/iMax}`;
        goofer.ctx.fillRect(goofer.quantize(x - (s / 2) - scrollOffsetX, s), goofer.quantize(y - (s / 2) - scrollOffsetY, s), s - 2, s - 2);
        goofer.ctx.strokeRect(goofer.quantize(x - (s / 2) - scrollOffsetX, s), goofer.quantize(y - (s / 2) - scrollOffsetY, s), s - 1, s - 1);
    } else {
        goofer.ctx.lineWidth = 5;
        goofer.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1`;
        goofer.ctx.beginPath();
        const k = Math.floor(iMax - i)/(iMax) * 100;
        goofer.ctx.arc(x - scrollOffsetX, y - scrollOffsetY, k, 0, 2 * Math.PI, false);
        goofer.ctx.stroke();
        goofer.ctx.closePath();
    }
};

window.addEventListener('click', e => {
    goofer.effects.push(goofer.genParticleEffect(e.clientX, e.clientY, genColor(), 5, goofer.particleTypes.QCircle));
}, true);


window.addEventListener('mousemove', e => {
    const dx = goofer.mouseX - e.clientX;
    const dy = goofer.mouseY - e.clientY;

    if(dx * dx + dy + dy > 1) {
        goofer.effects.push(goofer.genParticleEffect(e.clientX, e.clientY, genColor(), e.buttons % 2 ? 25 : 10, goofer.particleTypes.QSquare));
    }
    goofer.mouseX = e.clientX;
    goofer.mouseY = e.clientY;
}, true);

let scrollOffsetY = window.scrollY;
let scrollOffsetX = window.scrollX;

window.addEventListener('scroll', () => {
    scrollOffsetY = window.scrollY;
    scrollOffsetX = window.scrollX;
});

window.addEventListener('resize', () => {
    goofer.c.width = document.documentElement.clientWidth;
    goofer.c.height = document.documentElement.clientHeight;
});

const churn = (ts) => {
    lastTS = ts;
    goofer.ctx.clearRect(0, 0, goofer.c.width, goofer.c.height);
    // goofer.effects.map(e => fillPixel(e.x, e.y, e.a, e.c, e.s, e.type));
    goofer.effects.map(e => fillEvent(e));
    advanceEffects();
    window.requestAnimationFrame(churn);
};

window.requestAnimationFrame(churn);
